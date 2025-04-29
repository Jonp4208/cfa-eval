// client/src/pages/users/components/ManagerTeamDialog.tsx
import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Search, SortAsc, SortDesc } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface UserType {
  _id: string;
  name: string;
  email: string;
  position: string;
  departments: string[];
  role: 'user' | 'admin';
  status?: string;
  shift?: 'day' | 'night';
}

interface ManagerTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager: UserType | null;
  teamMembers: UserType[];
}

export default function ManagerTeamDialog({
  open,
  onOpenChange,
  manager,
  teamMembers
}: ManagerTeamDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'position' | 'department'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  if (!manager) return null;

  // Filter and sort team members
  const filteredAndSortedMembers = useMemo(() => {
    // First filter by search query
    const filtered = teamMembers.filter(member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.departments.some(dept => dept.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Then sort
    return [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'position') {
        comparison = a.position.localeCompare(b.position);
      } else if (sortBy === 'department') {
        const deptA = a.departments[0] || '';
        const deptB = b.departments[0] || '';
        comparison = deptA.localeCompare(deptB);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [teamMembers, searchQuery, sortBy, sortOrder]);

  // Toggle sort order
  const toggleSort = (field: 'name' | 'position' | 'department') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#27251F]">
            {manager.name}'s Team
          </DialogTitle>
          <DialogDescription className="text-[#27251F]/60">
            {teamMembers.length > 0
              ? `${teamMembers.length} team members reporting to this manager`
              : "This manager doesn't have any team members reporting to them yet"}
          </DialogDescription>
        </DialogHeader>

        {/* Search and Sort Controls - Only show if there are team members */}
        {teamMembers.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search team members..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-1 ${sortBy === 'name' ? 'border-[#E51636] text-[#E51636]' : ''}`}
                onClick={() => toggleSort('name')}
              >
                Name
                {sortBy === 'name' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-1 ${sortBy === 'position' ? 'border-[#E51636] text-[#E51636]' : ''}`}
                onClick={() => toggleSort('position')}
              >
                Position
                {sortBy === 'position' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-1 ${sortBy === 'department' ? 'border-[#E51636] text-[#E51636]' : ''}`}
                onClick={() => toggleSort('department')}
              >
                Department
                {sortBy === 'department' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {filteredAndSortedMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No team members match your search.' : 'No team members found for this manager.'}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredAndSortedMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="h-10 w-10 rounded-full bg-[#E51636]/10 flex items-center justify-center mr-4">
                    <User className="h-5 w-5 text-[#E51636]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 truncate">{member.name}</h4>
                        <p className="text-sm text-gray-500 truncate">{member.email}</p>
                      </div>
                      <div className="mt-1 sm:mt-0 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {member.position}
                        </span>
                        {member.shift && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {member.shift === 'day' ? 'Day' : 'Night'} Shift
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {member.departments.map((dept, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
