import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Search, Clock, CheckCircle2, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate as utilFormatDate } from '@/lib/utils/formatters';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  position: string;
  departments: string[];
  role: 'user' | 'admin';
  status?: string;
  shift?: 'day' | 'night';
  lastEvaluation?: {
    _id: string;
    status: string;
    scheduledDate: string;
    completedDate?: string;
    templateName: string;
  } | null;
}

interface MyTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MyTeamDialog({ open, onOpenChange }: MyTeamDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch team members
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['my-team-members', user?._id],
    queryFn: async () => {
      try {
        // Fetch users where the current user is the manager
        const response = await api.get('/api/users', {
          params: { managerId: user?._id }
        });

        if (!response.data?.users) {
          return [];
        }

        // For each team member, fetch their most recent evaluation
        const teamWithEvaluations = await Promise.all(
          response.data.users.map(async (member: TeamMember) => {
            try {
              // Get all evaluations for this employee
              const evalResponse = await api.get(`/api/evaluations`, {
                params: { employeeId: member._id }
              });

              const evaluations = evalResponse.data?.evaluations || [];

              // Find the most recent completed evaluation
              const completedEvals = evaluations.filter(evaluation => evaluation.status === 'completed' && evaluation.completedDate);

              // Sort by completedDate in descending order (newest first)
              const lastCompletedEval = completedEvals.length > 0 ?
                completedEvals.sort((a, b) => {
                  const dateA = new Date(a.completedDate).getTime();
                  const dateB = new Date(b.completedDate).getTime();
                  return dateB - dateA; // Descending order
                })[0] : null;

              // Get the most recent evaluation (regardless of status)
              const lastEval = evaluations.length > 0 ? evaluations[0] : null;

              // Process the evaluation data
              let processedEvaluation = null;

              if (lastEval) {
                // Process the date strings to ensure they're in the correct format
                let scheduledDateStr = lastEval.scheduledDate || null;
                let completedDateStr = lastCompletedEval?.completedDate || null;

                // Convert dates to MM/DD/YYYY format if they're not already
                if (scheduledDateStr && scheduledDateStr.includes('T')) {
                  const date = new Date(scheduledDateStr);
                  if (!isNaN(date.getTime())) {
                    scheduledDateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
                  }
                }

                if (completedDateStr && completedDateStr.includes('T')) {
                  const date = new Date(completedDateStr);
                  if (!isNaN(date.getTime())) {
                    completedDateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
                  }
                }

                // Log the processed date strings
                console.log(`Processed date strings for ${member.name}:`, {
                  scheduledDateStr,
                  completedDateStr,
                  lastEvalStatus: lastEval.status,
                  lastCompletedEvalId: lastCompletedEval?._id
                });

                processedEvaluation = {
                  // Use the most recent evaluation for navigation and status
                  _id: lastEval._id,
                  status: lastEval.status,
                  // Store the processed date strings
                  scheduledDate: scheduledDateStr,
                  // But use the most recent completed evaluation's date for the completed date
                  completedDate: completedDateStr,
                  // Also store the ID of the last completed evaluation for reference
                  lastCompletedEvalId: lastCompletedEval?._id,
                  templateName: lastEval.template?.name || 'Unknown Template'
                };
              }

              return {
                ...member,
                lastEvaluation: processedEvaluation
              };
            } catch (error) {
              // Silently handle error and return the member without evaluation data
              return member;
            }
          })
        );

        return teamWithEvaluations;
      } catch (error) {
        // Return empty array if there's an error fetching team members
        return [];
      }
    },
    enabled: open && !!user?._id
  });

  // Filter team members based on search query
  const filteredMembers = teamMembers.filter((member: TeamMember) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.position.toLowerCase().includes(query) ||
      member.departments.some(dept => dept.toLowerCase().includes(query))
    );
  });

  // Sort team members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return sortOrder === 'asc'
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });

  // Get status badge color and text
  const getStatusInfo = (status?: string) => {
    if (!status) return { color: 'bg-gray-100 text-gray-600', text: 'Unknown' };

    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-600', text: 'Completed' };
      case 'pending_self_evaluation':
        return { color: 'bg-blue-100 text-blue-600', text: 'Self Evaluation' };
      case 'pending_manager_review':
        return { color: 'bg-amber-100 text-amber-600', text: 'Manager Review' };
      case 'in_review_session':
        return { color: 'bg-purple-100 text-purple-600', text: 'In Review' };
      default:
        return { color: 'bg-gray-100 text-gray-600', text: status };
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    try {
      // Check if the date is already in MM/DD/YYYY format
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
        // Parse it to ensure it's a valid date
        const [month, day, year] = dateString.split('/').map(Number);
        if (month && day && year) {
          // Validate the date
          const date = new Date(year, month - 1, day);
          if (!isNaN(date.getTime())) {
            return dateString; // Return as is if valid
          }
        }
      }

      // Try to extract date parts directly from the string if it's in ISO format
      // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
      if (dateString.includes('T') && dateString.includes('-') && dateString.includes(':')) {
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);

        if (year && month && day) {
          const formattedDate = `${month}/${day}/${year}`;
          return formattedDate;
        }
      }

      // If not ISO format or extraction failed, try using the Date object
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        // Last resort: try to extract date parts using regex
        const dateRegex = /(\d{4})-(\d{2})-(\d{2})/;
        const match = dateString.match(dateRegex);

        if (match) {
          const [_, year, month, day] = match;
          const formattedDate = `${parseInt(month)}/${parseInt(day)}/${year}`;
          return formattedDate;
        }

        return 'Invalid date';
      }

      // Format the date manually to ensure consistency
      const month = date.getMonth() + 1; // getMonth() is 0-indexed
      const day = date.getDate();
      const year = date.getFullYear();

      const formattedDate = `${month}/${day}/${year}`;
      return formattedDate;
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-xl font-semibold">My Team</DialogTitle>
          <DialogDescription>
            View your team members and their evaluation status
          </DialogDescription>
        </DialogHeader>

        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1 h-10 whitespace-nowrap"
          >
            Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </Button>
        </div>

        {/* Team Members List */}
        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636] mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading team members...</p>
            </div>
          ) : sortedMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No team members match your search.' : 'No team members found.'}
            </div>
          ) : (
            <div className="grid gap-3">
              {sortedMembers.map((member: TeamMember) => (
                <div
                  key={member._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="h-10 w-10 rounded-full bg-[#E51636]/10 flex items-center justify-center mr-4 mb-3 sm:mb-0">
                    <User className="h-5 w-5 text-[#E51636]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                      <div>
                        <h3 className="font-medium text-[#27251F] truncate">{member.name}</h3>
                        <p className="text-sm text-[#27251F]/60 truncate">
                          {member.position} • {member.departments.join(', ')}
                        </p>
                      </div>

                      {member.lastEvaluation ? (
                        <div className="mt-2 sm:mt-0 flex flex-col items-start sm:items-end">
                          <Badge className={`${getStatusInfo(member.lastEvaluation.status).color} mb-1`}>
                            {getStatusInfo(member.lastEvaluation.status).text}
                          </Badge>
                          <p className="text-xs text-[#27251F]/60">
                            {member.lastEvaluation.completedDate
                              ? `Last evaluation: ${formatDate(member.lastEvaluation.completedDate)}`
                              : `Due: ${formatDate(member.lastEvaluation.scheduledDate)}`
                            }
                          </p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="mt-2 sm:mt-0">No evaluations</Badge>
                      )}
                    </div>
                  </div>

                  {member.lastEvaluation && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 sm:mt-0 sm:ml-2 text-[#E51636] hover:text-[#E51636]/80 hover:bg-[#E51636]/10 p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/evaluations/${member.lastEvaluation?._id}`);
                        onOpenChange(false);
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create New Evaluation Button */}
        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => {
              navigate('/evaluations/new');
              onOpenChange(false);
            }}
            className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            Create New Evaluation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
