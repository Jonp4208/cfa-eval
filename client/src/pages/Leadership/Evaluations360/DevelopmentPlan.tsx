import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/axios';
import {
  ArrowLeft,
  Target,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  TrendingUp,
  Clock,
  Award,
  Users,
  Lightbulb
} from 'lucide-react';
import { format } from 'date-fns';

interface DevelopmentPlan {
  subjectName: string;
  overallRating: number;
  generatedDate: string;
  developmentAreas: Array<{
    area: string;
    currentRating: number;
    targetRating: number;
    priority: 'high' | 'medium' | 'low';
    keyFeedback: string[];
  }>;
  smartGoals: Array<{
    area: string;
    goal: string;
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
  }>;
  actionPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  resources: string[];
  milestones: Array<{
    timeframe: string;
    description: string;
    measurable: string;
  }>;
}

export default function DevelopmentPlan() {
  const { evaluationId } = useParams();
  const navigate = useNavigate();

  // Fetch development plan
  const { data: developmentPlan, isLoading, error } = useQuery({
    queryKey: ['developmentPlan', evaluationId],
    queryFn: async () => {
      const response = await api.get(`/api/leadership/360-evaluations/${evaluationId}/development-plan`);
      return response.data;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    );
  }

  if (error || !developmentPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p>Error loading development plan</p>
        <Button
          variant="outline"
          onClick={() => navigate(`/leadership/360-evaluations/${evaluationId}`)}
          className="mt-4"
        >
          Back to Evaluation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-6 pb-6">
      {/* Header */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate(`/leadership/360-evaluations/${evaluationId}`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Evaluation
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leadership Development Plan</h2>
          <p className="text-muted-foreground">
            For {developmentPlan.subjectName} • Generated {format(new Date(developmentPlan.generatedDate), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Development Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#E51636]">
                {developmentPlan.overallRating.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Current Overall Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {developmentPlan.developmentAreas.length}
              </div>
              <div className="text-sm text-muted-foreground">Focus Areas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {developmentPlan.smartGoals.length}
              </div>
              <div className="text-sm text-muted-foreground">SMART Goals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Priority Development Areas
          </CardTitle>
          <CardDescription>
            Areas identified for focused development based on your 360° feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {developmentPlan.developmentAreas.map((area, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{area.area}</h4>
                    <Badge variant="outline" className={getPriorityColor(area.priority)}>
                      {area.priority.charAt(0).toUpperCase() + area.priority.slice(1)} Priority
                    </Badge>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">
                      {area.currentRating.toFixed(1)} → {area.targetRating.toFixed(1)}
                    </div>
                    <div className="text-muted-foreground">Target Growth</div>
                  </div>
                </div>
                <div className="mb-3">
                  <Progress 
                    value={(area.currentRating / 5) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Current: {area.currentRating.toFixed(1)}/5.0</span>
                    <span>Target: {area.targetRating.toFixed(1)}/5.0</span>
                  </div>
                </div>
                {area.keyFeedback.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Key Feedback:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {area.keyFeedback.map((feedback, feedbackIndex) => (
                        <li key={feedbackIndex} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{feedback}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SMART Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            SMART Goals
          </CardTitle>
          <CardDescription>
            Specific, Measurable, Achievable, Relevant, and Time-bound development goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {developmentPlan.smartGoals.map((goal, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">{goal.area}</h4>
                <div className="bg-blue-50 p-3 rounded-md mb-4">
                  <p className="font-medium text-blue-900">{goal.goal}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Specific:</span> {goal.specific}
                  </div>
                  <div>
                    <span className="font-medium">Measurable:</span> {goal.measurable}
                  </div>
                  <div>
                    <span className="font-medium">Achievable:</span> {goal.achievable}
                  </div>
                  <div>
                    <span className="font-medium">Relevant:</span> {goal.relevant}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Time-bound:</span> {goal.timeBound}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Action Plan Timeline
          </CardTitle>
          <CardDescription>
            Structured approach to achieving your development goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-red-600" />
                Immediate (0-30 days)
              </h4>
              <ul className="space-y-2">
                {developmentPlan.actionPlan.immediate.map((action, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-amber-600" />
                Short-term (1-3 months)
              </h4>
              <ul className="space-y-2">
                {developmentPlan.actionPlan.shortTerm.map((action, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-green-600" />
                Long-term (3-12 months)
              </h4>
              <ul className="space-y-2">
                {developmentPlan.actionPlan.longTerm.map((action, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources and Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Recommended Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...new Set(developmentPlan.resources)].map((resource, index) => (
                <div key={index} className="flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                  <span className="text-sm">{resource}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Success Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {developmentPlan.milestones.map((milestone, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="font-medium text-sm">{milestone.timeframe}</div>
                  <div className="text-sm text-muted-foreground">{milestone.description}</div>
                  <div className="text-xs text-blue-600 mt-1">{milestone.measurable}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
