import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { 
  ArrowLeft, 
  Users, 
  UserPlus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
      position: string;
    };
    relationship: string;
    isComplete: boolean;
    submittedAt?: string;
  }[];
}

export default function Evaluators() {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch evaluation
  const { data: evaluation, isLoading } = useQuery({
    queryKey: ['leadership360Evaluation', evaluationId],
    queryFn: async () => {
      const response = await api.get(`/api/leadership/360-evaluations/${evaluationId}`);
      return response.data;
    }
  });

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

  // Check if the current user is the initiator
  const isInitiator = evaluation?.initiator._id === user?._id;

  if (isLoading) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(`/leadership/360-evaluations/${evaluationId}`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Evaluators</h2>
        </div>
        {isInitiator && evaluation.status === 'pending_evaluators' && (
          <Button
            onClick={() => navigate(`/leadership/360-evaluations/${evaluationId}/evaluators/add`)}
            className="bg-[#E51636] hover:bg-[#C41230] text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Evaluators
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Evaluators for {evaluation.subject.name}'s 360° Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="p-4 bg-gray-50 border-b">
              <h4 className="font-medium">Evaluators ({evaluation.evaluations.length})</h4>
            </div>
            {evaluation.evaluations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No evaluators added yet
              </div>
            ) : (
              <div className="divide-y">
                {evaluation.evaluations.map((evaluator) => (
                  <div key={evaluator.evaluator._id} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{evaluator.evaluator.name}</span>
                      {getRelationshipBadge(evaluator.relationship)}
                    </div>
                    <div>
                      {evaluator.isComplete ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
