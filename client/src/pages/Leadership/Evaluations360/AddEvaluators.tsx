import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import {
  ArrowLeft,
  Users,
  UserPlus,
  UserMinus,
  Check,
  AlertCircle,
  Shield,
  Info
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface User {
  _id: string;
  name: string;
  position: string;
  email: string;
}

interface Evaluation360 {
  _id: string;
  subject: {
    _id: string;
    name: string;
    position: string;
  };
  template: {
    _id: string;
    name: string;
  };
  status: string;
  evaluations: {
    evaluator: {
      _id: string;
      name: string;
    };
    relationship: string;
  }[];
}

interface EvaluatorEntry {
  userId: string;
  relationship: 'manager' | 'peer' | 'direct_report' | 'self';
}

export default function AddEvaluators() {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [evaluators, setEvaluators] = useState<EvaluatorEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRelationship, setSelectedRelationship] = useState<'manager' | 'peer' | 'direct_report' | 'self'>('peer');

  // Fetch evaluation
  const { data: evaluation, isLoading: isLoadingEvaluation } = useQuery({
    queryKey: ['leadership360Evaluation', evaluationId],
    queryFn: async () => {
      const response = await api.get(`/api/leadership/360-evaluations/${evaluationId}`);
      return response.data;
    }
  });

  // Fetch users
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/api/users');
      return response.data;
    }
  });

  // Ensure users is an array
  const users = Array.isArray(usersData) ? usersData :
               (usersData && usersData.users ? usersData.users : []);

  // Add evaluators mutation
  const addEvaluatorsMutation = useMutation({
    mutationFn: async (data: { evaluatorIds: string[], relationships: string[] }) => {
      const response = await api.post(`/api/leadership/360-evaluations/${evaluationId}/evaluators`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Evaluators added successfully",
      });

      // Invalidate and refetch queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['leadership360Evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['leadership360Evaluation', evaluationId] });

      // Navigate back to evaluation list
      navigate('/leadership/360-evaluations');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add evaluators",
        variant: "destructive",
      });
    }
  });

  // Add self-evaluation automatically if subject is the current user
  useEffect(() => {
    if (evaluation && user && evaluation.subject._id === user._id) {
      const selfEvaluatorExists = evaluators.some(e =>
        e.userId === user._id && e.relationship === 'self'
      );

      if (!selfEvaluatorExists) {
        setEvaluators(prev => [...prev, { userId: user._id, relationship: 'self' }]);
      }
    }
  }, [evaluation, user]);

  // Add the subject's manager automatically if available
  useEffect(() => {
    if (evaluation && users) {
      const subject = users.find((u: User) => u._id === evaluation.subject._id);
      if (subject && subject.manager) {
        const managerEvaluatorExists = evaluators.some(e =>
          e.userId === subject.manager && e.relationship === 'manager'
        );

        if (!managerEvaluatorExists) {
          setEvaluators(prev => [...prev, { userId: subject.manager, relationship: 'manager' }]);
        }
      }
    }
  }, [evaluation, users]);

  const handleAddEvaluator = () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    // Check if evaluator already exists with the same relationship
    const exists = evaluators.some(e =>
      e.userId === selectedUser && e.relationship === selectedRelationship
    );

    if (exists) {
      toast({
        title: "Error",
        description: "This evaluator with the selected relationship already exists",
        variant: "destructive",
      });
      return;
    }

    // Add evaluator
    setEvaluators(prev => [...prev, { userId: selectedUser, relationship: selectedRelationship }]);
    setSelectedUser('');
  };

  const handleRemoveEvaluator = (index: number) => {
    setEvaluators(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (evaluators.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one evaluator",
        variant: "destructive",
      });
      return;
    }

    addEvaluatorsMutation.mutate({
      evaluatorIds: evaluators.map(e => e.userId),
      relationships: evaluators.map(e => e.relationship)
    });
  };

  const getRelationshipBadge = (relationship: string) => {
    switch (relationship) {
      case 'manager':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Manager</Badge>;
      case 'peer':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Peer</Badge>;
      case 'direct_report':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Direct Report</Badge>;
      case 'self':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Self</Badge>;
      default:
        return <Badge variant="outline">{relationship}</Badge>;
    }
  };

  // Filter out users who are already evaluators with the same relationship
  const filteredUsers = users?.filter((u: User) => {
    // Don't include the subject as an evaluator (except for self-evaluation)
    if (evaluation && u._id === evaluation.subject._id && selectedRelationship !== 'self') {
      return false;
    }

    // Don't include users who are already evaluators with the selected relationship
    return !evaluators.some(e => e.userId === u._id && e.relationship === selectedRelationship);
  });

  if (isLoadingEvaluation) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p>Evaluation not found</p>
        <Button
          variant="outline"
          onClick={() => navigate('/leadership/360-evaluations')}
          className="mt-4"
        >
          Back to Evaluations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-6 pb-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/leadership/360-evaluations')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Add Evaluators</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            360° Evaluation for {evaluation.subject.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="font-medium">{evaluation.subject.name} - {evaluation.subject.position}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Template</p>
                <p className="font-medium">{evaluation.template.name}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Add Evaluators</h3>

              {/* Anonymity notice */}
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-start">
                <Shield className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-green-800 flex items-center">
                    <span>Feedback Will Be Anonymous</span>
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    Evaluators' identities will be kept anonymous. Only their relationship to {evaluation.subject.name}
                    (peer, manager, etc.) will be shown in the feedback results. This ensures honest, constructive feedback.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="col-span-2">
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an evaluator" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        filteredUsers?.map((user: User) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name} - {user.position}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedRelationship} onValueChange={(value: any) => setSelectedRelationship(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="peer">Peer</SelectItem>
                      <SelectItem value="direct_report">Direct Report</SelectItem>
                      <SelectItem value="self">Self</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleAddEvaluator}
                className="mb-6"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Evaluator
              </Button>

              <div className="border rounded-md">
                <div className="p-4 bg-gray-50 border-b">
                  <h4 className="font-medium">Selected Evaluators ({evaluators.length})</h4>
                </div>
                {evaluators.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No evaluators added yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {evaluators.map((evaluator, index) => {
                      const evaluatorUser = users?.find((u: User) => u._id === evaluator.userId);
                      return (
                        <div key={index} className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{evaluatorUser?.name || 'Unknown User'}</span>
                            {getRelationshipBadge(evaluator.relationship)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEvaluator(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSubmit}
                disabled={evaluators.length === 0 || addEvaluatorsMutation.isPending}
                className="bg-[#E51636] hover:bg-[#C41230] text-white"
              >
                {addEvaluatorsMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </div>
                ) : (
                  <>
                    Save and Send Anonymous Invitations
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
