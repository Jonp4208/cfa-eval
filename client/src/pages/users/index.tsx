// client/src/pages/users/index.tsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { User, Plus, Search, Upload, Download, Edit, Mail, Trash2, Shield, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from '@/lib/axios';
import AddUserDialog from './components/AddUserDialog';
import ManagerTeamDialog from './components/ManagerTeamDialog';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import { cn } from '@/lib/utils';

interface UserType {
  _id: string;
  name: string;
  email: string;
  position: string;
  departments: string[];
  role: 'user' | 'admin';
  status?: string;
  store?: {
    _id: string;
    name: string;
    storeNumber: string;
  };
  manager?: {
    _id: string;
    name: string;
  };
  shift?: 'day' | 'night';
}

// Helper function to check if user can manage users
const canManageUsers = (user: any) => {
  return user?.role === 'admin' || user?.position === 'Director' || user?.position === 'Leader';
};

// Helper function to check if user can toggle status (Directors only)
const canToggleStatus = (user: any) => {
  return user?.position === 'Director';
};

// Helper function to check if user can delete users (Admins only)
const canDeleteUsers = (user: any) => {
  return user?.role === 'admin';
};

export default function Users() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'position' | 'department' | 'role' | 'manager'>('name');
  const [filterBy, setFilterBy] = useState<'all' | 'FOH' | 'BOH' | 'myTeam'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmailResetDialog, setShowEmailResetDialog] = useState(false);
  const [showManagerTeamDialog, setShowManagerTeamDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedManager, setSelectedManager] = useState<UserType | null>(null);
  const [isManagerSectionExpanded, setIsManagerSectionExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/api/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowDeleteDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/api/users/${userId}/reset-password`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password reset instructions sent successfully",
      });
      setShowEmailResetDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send password reset instructions",
        variant: "destructive"
      });
    }
  });



  // Fetch users with role-based filtering
  const { data, isLoading, error } = useQuery<{ users: UserType[] }>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        // If no user is logged in
        if (!currentUser) {
          return { users: [] };
        }

        // For regular users, only show their own user data
        if (currentUser.position?.toLowerCase() !== 'director' && !currentUser.position?.toLowerCase().includes('leader')) {
          const response = await api.get(`/api/users/${currentUser._id}`);
          return { users: [response.data] };
        }

        // For leaders and directors, fetch all users
        const response = await api.get('/api/users');
        console.log('Fetched users:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    enabled: !!currentUser
  });

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <Card className="bg-white rounded-[20px] shadow-md">
          <CardContent className="p-6 text-center text-[#E51636]">
            Error loading users. Please try again later.
          </CardContent>
        </Card>
      </div>
    );
  }

  const users = data?.users?.filter(user => user && typeof user === 'object');
  console.log('Initial users:', users);

  // Filter users based on search query and filter selection
  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by status (active/inactive)
    const matchesStatus = user.status === statusFilter;

    // Filter by department or my team
    let matchesFilter = true;
    if (filterBy !== 'all') {
      if (filterBy === 'myTeam') {
        matchesFilter = user.manager?._id === currentUser?._id;
      } else if (filterBy === 'FOH' || filterBy === 'BOH') {
        matchesFilter = user.departments?.includes(filterBy);
      }
    }

    // Only show users from the same store as the current user
    const sameStore = user.store?._id === currentUser?.store?._id;

    console.log('Filtering user:', {
      name: user.name,
      position: user.position,
      matchesSearch,
      matchesFilter,
      sameStore,
      currentStore: currentUser?.store?._id,
      userStore: user.store?._id
    });

    return matchesSearch && matchesFilter && matchesStatus && sameStore;
  });

  console.log('Filtered users:', filteredUsers);

  // Calculate the number of team members per manager
  const managerTeamSizes = users?.reduce((acc, user) => {
    if (user.manager?._id) {
      acc[user.manager._id] = (acc[user.manager._id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  // Function to get team members for a specific manager
  const getTeamMembers = (managerId: string) => {
    return users?.filter(user => user.manager?._id === managerId) || [];
  };

  // Sort users based on selected field
  const sortedUsers = [...(filteredUsers || [])].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'department') {
      return (a.departments?.[0] || '').localeCompare(b.departments?.[0] || '');
    }
    if (sortBy === 'position') {
      return (a.position || '').localeCompare(b.position || '');
    }
    if (sortBy === 'role') {
      return (a.role || '').localeCompare(b.role || '');
    }
    if (sortBy === 'manager') {
      const managerNameA = a.manager?.name || '';
      const managerNameB = b.manager?.name || '';
      return managerNameA.localeCompare(managerNameB);
    }
    return 0;
  });

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/api/users/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: "Success",
        description: "Users uploaded successfully",
      });

      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error: any) {
      console.error('Error uploading users:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload users",
        variant: "destructive"
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    // CSV header and example rows with comments
    const csvContent = [
      'name,email,departments,position,role,shift,status',
      '# Departments options (comma-separated list): Front Counter, Drive Thru, Kitchen, Everything',
      '# Position options: Team Member, Trainer, Leader, Director',
      '# Role options: user, admin',
      '# Shift options: day, night',
      '# Status options: active, inactive',
      '',
      'John Doe,john@example.com,"Front Counter,Drive Thru",Team Member,user,day,active',
      'Jane Smith,jane@example.com,Kitchen,Trainer,user,day,active',
      'Mike Johnson,mike@example.com,Everything,Director,admin,day,active',
      'Sarah Williams,sarah@example.com,"Front Counter,Drive Thru",Leader,user,night,active'
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Update currentUser check
  const isAdmin = currentUser && (currentUser as any).role === 'admin';

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
        <PageHeader
          title="Team Management"
          subtitle={`${currentUser?.store?.name || 'Calhoun FSU'} #${currentUser?.store?.storeNumber}`}
          icon={<User className="h-5 w-5" />}
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              {canManageUsers(currentUser) && (
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="w-full sm:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              )}
            </div>
          }
        />

        {/* Bulk Actions Section */}
        {canManageUsers(currentUser) && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 sm:h-10 px-4 text-sm sm:text-base font-medium text-gray-700 hover:text-[#E51636] hover:border-[#E51636] transition-all duration-200"
            >
              Import Users
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="h-9 sm:h-10 px-4 text-sm sm:text-base font-medium text-gray-700 hover:text-[#E51636] hover:border-[#E51636] transition-all duration-200"
            >
              Download Template
            </Button>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Card className="bg-white rounded-[16px] sm:rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#27251F]/60">Total Users</p>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2 text-[#27251F]">{users?.length || 0}</h3>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[16px] sm:rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#27251F]/60">
                    {statusFilter === 'active' ? 'Active Users' : 'Inactive Users'}
                  </p>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2 text-[#27251F]">
                    {users?.filter(user => user.status === statusFilter).length || 0}
                  </h3>
                </div>
                <div className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-xl sm:rounded-2xl flex items-center justify-center ${
                  statusFilter === 'active' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <Shield className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 ${
                    statusFilter === 'active' ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[16px] sm:rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#27251F]/60">Filtered Results</p>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2 text-[#27251F]">
                    {sortedUsers.length}
                  </h3>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-purple-50 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[16px] sm:rounded-[20px] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#27251F]/60">FOH Users</p>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2 text-[#27251F]">
                    {users?.filter(user => user.departments?.some(dept =>
                      dept.toLowerCase() === 'front counter' ||
                      dept.toLowerCase() === 'drive thru'
                    )).length || 0}
                  </h3>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-orange-50 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Managers Section */}
        <Card className="bg-white rounded-[16px] sm:rounded-[20px] shadow-md">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
              onClick={() => setIsManagerSectionExpanded(!isManagerSectionExpanded)}
            >
              <h3 className="text-lg font-semibold text-[#27251F] flex items-center">
                {isManagerSectionExpanded ?
                  <ChevronDown className="h-5 w-5 mr-2 text-[#E51636]" /> :
                  <ChevronRight className="h-5 w-5 mr-2 text-[#E51636]" />
                }
                Team Managers
              </h3>
              <div className="flex items-center">
                <div className="text-sm text-gray-500 mr-2">
                  {users?.filter(user =>
                    (user.position === 'Director' || user.position === 'Leader')
                  ).length || 0} managers
                </div>
                <span className="text-xs text-[#E51636]">
                  {isManagerSectionExpanded ? 'Click to collapse' : 'Click to expand'}
                </span>
              </div>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-hidden transition-all duration-300 ease-in-out ${
              isManagerSectionExpanded ? 'max-h-[1000px] mt-4 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              {users?.filter(user =>
                (user.position === 'Director' || user.position === 'Leader')
              ).sort((a, b) => (managerTeamSizes[b._id] || 0) - (managerTeamSizes[a._id] || 0)).map(manager => (
                <div
                  key={manager._id}
                  className={`flex items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer ${
                    managerTeamSizes[manager._id] ? '' : 'opacity-80'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent's onClick
                    setSelectedManager(manager);
                    setShowManagerTeamDialog(true);
                  }}
                >
                  <div className="h-10 w-10 rounded-full bg-[#E51636]/10 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-[#E51636]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 hover:text-[#E51636] transition-colors">
                      {manager.name}
                    </div>
                    <div className="flex items-center mt-1">
                      {managerTeamSizes[manager._id] ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {managerTeamSizes[manager._id]} team members
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          No team members
                        </span>
                      )}
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {manager.position}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters Section */}
        <Card className="bg-white rounded-[16px] sm:rounded-[20px] shadow-md">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,auto,auto] gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full h-[40px] sm:h-[46px] pl-9 sm:pl-10 pr-4 rounded-[12px] sm:rounded-[14px] border-2 border-gray-200 bg-white focus:outline-none focus:border-gray-300 transition-all duration-200 text-sm sm:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Toggle */}
              <div className="flex bg-gray-100 rounded-[12px] sm:rounded-[14px] p-1">
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`flex-1 px-3 sm:px-4 py-2 rounded-[8px] sm:rounded-[10px] text-sm sm:text-base font-medium transition-all duration-200 ${
                    statusFilter === 'active'
                      ? 'bg-white text-[#E51636] shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className={`flex-1 px-3 sm:px-4 py-2 rounded-[8px] sm:rounded-[10px] text-sm sm:text-base font-medium transition-all duration-200 ${
                    statusFilter === 'inactive'
                      ? 'bg-white text-[#E51636] shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Inactive
                </button>
              </div>

              <Select value={filterBy} onValueChange={(value: 'all' | 'FOH' | 'BOH' | 'myTeam') => setFilterBy(value)}>
                <SelectTrigger className="h-[40px] sm:h-[46px] px-3 sm:px-4 rounded-[12px] sm:rounded-[14px] border-2 border-gray-200 bg-white hover:border-gray-300 focus:outline-none min-w-[120px] sm:min-w-[140px] transition-all duration-200 text-sm sm:text-base">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>View</SelectLabel>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="myTeam">My Team</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Department</SelectLabel>
                    <SelectItem value="FOH">Front of House</SelectItem>
                    <SelectItem value="BOH">Back of House</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="h-[40px] sm:h-[46px] px-3 sm:px-4 rounded-[12px] sm:rounded-[14px] border-2 border-gray-200 bg-white hover:border-gray-300 focus:outline-none min-w-[120px] sm:min-w-[140px] transition-all duration-200 text-sm sm:text-base">
                  <SelectValue placeholder="Name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="position">Position</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <div className="overflow-x-auto bg-white rounded-[16px] sm:rounded-[20px] shadow-md">
          <div className="min-w-full divide-y divide-gray-200">
            {/* Mobile View */}
            <div className="block sm:hidden">
              {currentUsers.map((user) => (
                <div key={user._id} className="p-5 border-b border-gray-100 hover:bg-gray-50/50 transition-all duration-200 rounded-xl mb-2">
                  {/* User Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-[#E51636]/10 flex items-center justify-center">
                        <User className="h-7 w-7 text-[#E51636]" />
                      </div>
                      <div className="min-w-0 max-w-[200px]">
                        <div className="text-lg font-semibold text-gray-900 truncate">{user.name}</div>
                        <div className="text-sm text-gray-500 truncate" title={user.email}>{user.email}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-[#E51636]/10 text-[#E51636]'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>

                  {/* User Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Position</div>
                      <div className="text-sm font-medium text-gray-900">{user.position}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Shift</div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.shift ? (user.shift === 'day' ? 'Day' : 'Night') + ' Shift' : 'N/A'}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Reports to</div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.manager ? (
                          <button
                            className="text-gray-900 hover:text-[#E51636] transition-colors font-medium"
                            onClick={() => {
                              const manager = users?.find(u => u._id === user.manager?._id);
                              if (manager) {
                                setSelectedManager(manager);
                                setShowManagerTeamDialog(true);
                              }
                            }}
                          >
                            {user.manager.name}
                          </button>
                        ) : 'N/A'}
                      </div>
                    </div>

                    {user._id && managerTeamSizes[user._id] > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Team Size</div>
                        <div className="text-sm font-medium text-gray-900">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {managerTeamSizes[user._id]} members
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Departments</div>
                      <div className="flex flex-wrap gap-1.5">
                        {user.departments.map((dept, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-1 pt-3 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 px-3 text-[#27251F]/70 hover:text-[#E51636] hover:bg-[#E51636]/10"
                      onClick={() => navigate(`/users/${user._id}`)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      <span className="text-sm">View</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 px-3 text-[#27251F]/70 hover:text-[#E51636] hover:bg-[#E51636]/10"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEmailResetDialog(true);
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-sm">Reset</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 px-3 text-[#27251F]/70 hover:text-[#E51636] hover:bg-[#E51636]/10"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowAddDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      <span className="text-sm">Edit</span>
                    </Button>

                    {canDeleteUsers(currentUser) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 px-3 text-[#27251F]/70 hover:text-[#E51636] hover:bg-[#E51636]/10"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span className="text-sm">Delete</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block">
              <div className="bg-gray-50">
                <div className="grid grid-cols-6 gap-0">
                  <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</div>
                  <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</div>
                  <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</div>
                  <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</div>
                  <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</div>
                  <div className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</div>
                </div>
              </div>
              <div className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <div key={user._id} className="grid grid-cols-6 gap-0 hover:bg-gray-50 transition-colors duration-200">
                    <div className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-[#E51636]/10 flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-[#E51636]" />
                        </div>
                        <div className="min-w-0 max-w-[250px]">
                          <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                          <div className="text-sm text-gray-500 truncate" title={user.email}>{user.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.position}</div>
                      {user.shift && (
                        <div className="text-sm text-gray-500">{user.shift === 'day' ? 'Day' : 'Night'} Shift</div>
                      )}
                    </div>
                    <div className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.departments.map((dept, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-[#E51636]/10 text-[#E51636]'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </div>
                    <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.manager ? (
                        <button
                          className="text-gray-600 hover:text-[#E51636] transition-colors font-medium"
                          onClick={() => {
                            const manager = users?.find(u => u._id === user.manager?._id);
                            if (manager) {
                              setSelectedManager(manager);
                              setShowManagerTeamDialog(true);
                            }
                          }}
                        >
                          {user.manager.name}
                        </button>
                      ) : 'N/A'}
                      {user._id && managerTeamSizes[user._id] > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Team: {managerTeamSizes[user._id]}
                        </span>
                      )}
                    </div>
                    <div className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-[#27251F]/60 hover:text-[#E51636] hover:bg-[#E51636]/10"
                                onClick={() => navigate(`/users/${user._id}`)}
                              >
                                <User className="w-5 h-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Profile</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-[#27251F]/60 hover:text-[#E51636] hover:bg-[#E51636]/10"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowEmailResetDialog(true);
                                }}
                              >
                                <Mail className="w-5 h-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Send Password Reset</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-[#27251F]/60 hover:text-[#E51636] hover:bg-[#E51636]/10"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowAddDialog(true);
                                }}
                              >
                                <Edit className="w-5 h-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit User</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {canDeleteUsers(currentUser) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 text-[#27251F]/60 hover:text-[#E51636] hover:bg-[#E51636]/10"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete User</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-white border-t border-gray-200 rounded-b-[16px] sm:rounded-b-[20px]">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-2 relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastUser, sortedUsers.length)}</span> of{' '}
                  <span className="font-medium">{sortedUsers.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`relative inline-flex items-center px-3 sm:px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                        currentPage === index + 1
                          ? 'z-10 bg-[#E51636] border-[#E51636] text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Dialog */}
      <AddUserDialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) setSelectedUser(null);
        }}
        user={selectedUser}
      />

      {/* Manager Team Dialog */}
      {selectedManager && (
        <ManagerTeamDialog
          open={showManagerTeamDialog}
          onOpenChange={(open) => {
            setShowManagerTeamDialog(open);
            if (!open) setSelectedManager(null);
          }}
          manager={selectedManager}
          teamMembers={getTeamMembers(selectedManager._id)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white rounded-[20px] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Permanently Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div className="text-[#27251F]">
                You are about to permanently delete <span className="font-semibold">{selectedUser?.name}</span>.
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-sm font-bold">!</span>
                  </div>
                  <div className="text-red-800 text-sm">
                    <div className="font-semibold mb-2">⚠️ WARNING: This action is irreversible!</div>
                    <div className="space-y-1">
                      <div>• All user account data will be permanently deleted</div>
                      <div>• All evaluation records will be lost forever</div>
                      <div>• All training progress will be erased</div>
                      <div>• All documentation will be removed</div>
                      <div>• User will be immediately logged out</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-blue-800 text-sm">
                  <div className="font-semibold mb-1">💡 Alternative: Deactivate Instead</div>
                  <div>Consider deactivating the user instead to preserve all data while preventing access.</div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="h-12 px-6 rounded-xl">Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              className="h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700"
              onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser._id)}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Permanently Delete
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Confirmation Dialog */}
      <AlertDialog open={showEmailResetDialog} onOpenChange={setShowEmailResetDialog}>
        <AlertDialogContent className="bg-white rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Send Password Reset</AlertDialogTitle>
            <AlertDialogDescription>
              Send password reset instructions to <span className="font-medium truncate inline-block max-w-[300px]" title={selectedUser?.email}>{selectedUser?.email}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-12 px-6 rounded-xl">Cancel</AlertDialogCancel>
            <Button
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white h-12 px-6 rounded-xl"
              onClick={() => selectedUser && resetPasswordMutation.mutate(selectedUser._id)}
            >
              {resetPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}