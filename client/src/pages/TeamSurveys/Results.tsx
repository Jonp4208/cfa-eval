import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TeamSurveyResults() {
  const { surveyId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/team-surveys')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Surveys
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Survey Results</h1>
          <p className="text-gray-600">Survey ID: {surveyId}</p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Dashboard Coming Soon</h3>
        <p className="mt-1 text-sm text-gray-500">
          Detailed survey results and analytics will be available in the next update.
        </p>
      </div>
    </div>
  );
}
