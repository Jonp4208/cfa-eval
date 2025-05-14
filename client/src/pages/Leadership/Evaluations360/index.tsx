import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Users,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  BarChart2
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import api from '@/lib/axios';

interface Evaluation360 {
  _id: string;
  subject: {
    _id: string;
    name: string;
    position: string;
  };
  initiator: {
    _id: string;
    name: string;
    position: string;
  };
  template: {
    _id: string;
    name: string;
  };
  status: 'pending_evaluators' | 'in_progress' | 'completed' | 'reviewed';
  startDate: string;
  dueDate: string;
  completedDate?: string;
  reviewedDate?: string;
  evaluations: {
    evaluator: {
      _id: string;
      name: string;
      position: string;
    };
    relationship: 'manager' | 'peer' | 'direct_report' | 'self';
    isComplete: boolean;
    submittedAt?: string;
  }[];
}

export default function Evaluations360() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data: evaluationsData, isLoading, error } = useQuery({
    queryKey: ['leadership360Evaluations'],
    queryFn: async () => {
      const response = await api.get('/api/leadership/360-evaluations');
      return response.data;
    }
  });

  // Ensure evaluations is an array
  const evaluations = Array.isArray(evaluationsData) ? evaluationsData : [];

  const isManagerOrDirector = user?.position === 'Leader' || user?.position === 'Director';

  // Filter evaluations based on search term and status filter
  const filteredEvaluations = evaluations?.filter((evaluation: Evaluation360) => {
    const matchesSearch = searchTerm === '' ||
      evaluation.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.template.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === null || evaluation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_evaluators':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending Evaluators</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Reviewed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_evaluators':
        return <Users className="h-5 w-5 text-amber-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'reviewed':
        return <BarChart2 className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCompletionRate = (evaluation: Evaluation360) => {
    if (evaluation.evaluations.length === 0) return 0;
    const completedCount = evaluation.evaluations.filter(e => e.isComplete).length;
    return Math.round((completedCount / evaluation.evaluations.length) * 100);
  };

  return (
    <div className="space-y-6 px-4 md:px-6 pb-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name or template..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(null)}
            className={statusFilter === null ? "bg-[#E51636] text-white" : ""}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "in_progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("in_progress")}
            className={statusFilter === "in_progress" ? "bg-blue-500 text-white" : ""}
          >
            In Progress
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("completed")}
            className={statusFilter === "completed" ? "bg-green-500 text-white" : ""}
          >
            Completed
          </Button>
          {isManagerOrDirector && (
            <Button
              onClick={() => navigate('/leadership/360-evaluations/new')}
              className="bg-[#E51636] hover:bg-[#C41230] text-white ml-2"
            >
              <Plus className="mr-2 h-4 w-4" /> New 360°
            </Button>
          )}
        </div>
      </div>

      {/* Evaluations List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-[#27251F]/60">Error loading evaluations</p>
          </div>
        ) : filteredEvaluations?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-[#27251F]/60">No 360° evaluations found</p>
          </div>
        ) : (
          filteredEvaluations?.map((evaluation: Evaluation360) => (
            <Card
              key={evaluation._id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/leadership/360-evaluations/${evaluation._id}`)}
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(evaluation.status)}
                          <h3 className="font-semibold text-lg">{evaluation.subject.name}</h3>
                          {getStatusBadge(evaluation.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{evaluation.template.name}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Initiated By</p>
                        <p className="text-sm font-medium">{evaluation.initiator.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Due Date</p>
                        <p className="text-sm font-medium">
                          {format(new Date(evaluation.dueDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Completion</p>
                        <p className="text-sm font-medium">
                          {getCompletionRate(evaluation)}% ({evaluation.evaluations.filter(e => e.isComplete).length}/{evaluation.evaluations.length})
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end p-4 md:p-6 bg-gray-50 md:w-16">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
