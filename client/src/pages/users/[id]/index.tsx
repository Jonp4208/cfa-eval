// client/src/pages/users/[id]/index.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  User, Mail, Phone, Calendar, Award,
  TrendingUp, ClipboardList, Star,
  FileText, AlertCircle, BookOpen,
  CheckCircle, Activity, Target,
  ArrowLeft, Pencil, Plus, Stethoscope, MessageSquare, File,
  Building, Clock, BadgeCheck, Users, Briefcase, Info,
  GraduationCap, BookOpen as BookOpenIcon, Layers, CheckCircle2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import Draggable from 'react-draggable';
import disciplinaryService from '@/services/disciplinaryService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/PageHeader';

interface Evaluation {
  id?: string;
  date: string;
  score: number;
  type: string;
  strengths: string[];
  improvements: string[];
}

interface Goal {
  id?: string;
  goal: string;
  status: 'not-started' | 'in-progress' | 'completed';
  targetDate: string;
  progress: number;
  notes: string[];
}

interface Document {
  id?: string;
  type: 'review' | 'disciplinary' | 'coaching' | 'medical' | 'conversation' | 'other';
  date: string;
  title: string;
  description: string;
  createdBy: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

interface Metrics {
  evaluationScores: Array<{
    date: string;
    score: number;
  }>;
  trainingCompletion: number;
  goalAchievement: number;
  leadershipScore: number;
  heartsAndHands?: {
    x: number;
    y: number;
  };
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  role: string;
  status: 'active' | 'inactive';
  store: {
    _id: string;
    name: string;
    storeNumber: string;
  };
  manager?: {
    _id: string;
    name: string;
  };
  startDate: string;
  evaluations?: Evaluation[];
  development?: Goal[];
  documentation?: Document[];
  metrics?: Metrics;
}

interface DisciplinaryIncident {
  _id: string;
  date: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  actionTaken: string;
  createdBy: {
    name: string;
  };
  supervisor: {
    name: string;
  };
}

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const dragContainerRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [heartsAndHandsPosition, setHeartsAndHandsPosition] = useState({
    x: 50,
    y: 50
  });
  const [disciplinaryIncidents, setDisciplinaryIncidents] = useState<DisciplinaryIncident[]>([]);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  // Fetch user data
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      try {
        console.log('Fetching user with ID:', id);
        const response = await api.get(`/api/users/${id}`);
        console.log('User API Response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Error fetching user:', error);
        throw error;
      }
    }
  });

  // Fetch training progress data
  const { data: trainingProgress, isLoading: isTrainingLoading } = useQuery({
    queryKey: ['trainingProgress', id],
    queryFn: async () => {
      try {
        // This endpoint might need to be adjusted based on your actual API
        const response = await api.get(`/api/training/progress`, {
          params: { traineeId: id }
        });
        console.log('Training Progress Response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Error fetching training progress:', error);
        return []; // Return empty array on error to avoid breaking the UI
      }
    },
    enabled: !!id // Only run this query if we have an ID
  });

  // Add new query for evaluation scores
  const { data: evaluationScores } = useQuery({
    queryKey: ['evaluationScores', id],
    queryFn: async () => {
      const response = await api.get(`/api/users/${id}/evaluation-scores`);
      return response.data.evaluationScores;
    }
  });

  // Update positions when profile data changes
  useEffect(() => {
    const initializePosition = () => {
      if (profile?.metrics?.heartsAndHands && dragContainerRef.current) {
        const rect = dragContainerRef.current.getBoundingClientRect();
        const dotSize = 32;
        const savedPosition = profile.metrics.heartsAndHands;

        console.log('Initializing position with:', savedPosition);

        // Force set both positions
        setHeartsAndHandsPosition(savedPosition);
        setPosition({
          x: (savedPosition.x / 100) * (rect.width - dotSize),
          y: ((100 - savedPosition.y) / 100) * (rect.height - dotSize)
        });

        setContainerSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    // Try multiple times to ensure initialization
    const timeoutId = setTimeout(initializePosition, 100);
    const intervalId = setInterval(initializePosition, 500);

    // Clean up after 2 seconds
    const cleanupId = setTimeout(() => {
      clearInterval(intervalId);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(cleanupId);
      clearInterval(intervalId);
    };
  }, [profile?.metrics?.heartsAndHands]);

  // Remove the separate pixel position effect since we're handling it in the initialization
  useEffect(() => {
    const handleResize = () => {
      if (dragContainerRef.current && profile?.metrics?.heartsAndHands) {
        const rect = dragContainerRef.current.getBoundingClientRect();
        const dotSize = 32;
        const savedPosition = profile.metrics.heartsAndHands;

        setPosition({
          x: (savedPosition.x / 100) * (rect.width - dotSize),
          y: ((100 - savedPosition.y) / 100) * (rect.height - dotSize)
        });

        setContainerSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [profile?.metrics?.heartsAndHands]);

  // Update Hearts & Hands position
  const updateHeartsAndHandsMutation = useMutation({
    mutationFn: async (position: { x: number; y: number }) => {
      console.log('Saving position:', position);
      const response = await api.patch(`/api/users/${id}/metrics`, {
        heartsAndHands: position
      });
      console.log('Save response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Save successful, new data:', data);
      toast({
        title: "Success",
        description: "Position updated successfully",
      });
      // Explicitly refetch to ensure we have latest data
      refetch();
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update position",
        variant: "destructive",
      });
      // Reset position on error
      if (profile?.metrics?.heartsAndHands) {
        setHeartsAndHandsPosition(profile.metrics.heartsAndHands);
      }
    }
  });

  // Fetch potential managers
  useQuery({
    queryKey: ['potential-managers', profile?.store?._id],
    queryFn: async () => {
      try {
        if (!profile?.store?._id) {
          return [];
        }
        const response = await api.get('/api/users', {
          params: {
            role: ['manager', 'admin'],
            store: profile.store._id,
            excludeId: id
          }
        });
        return response.data.users || [];
      } catch (error) {
        console.error('Error fetching potential managers:', error);
        return [];
      }
    },
    enabled: !!profile?.store?._id && currentUser?.role === 'admin'
  });

  // Update manager mutation
  const updateManager = useMutation({
    mutationFn: async (managerId: string) => {
      const response = await api.patch(`/api/users/${id}`, {
        managerId: managerId || null
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Manager updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update manager',
        variant: 'destructive',
      });
    }
  });

  // Set initial selected manager
  useEffect(() => {
    if (profile?.manager?._id) {
      setSelectedManagerId(profile.manager._id);
    }
  }, [profile]);

  const handleManagerChange = (newManagerId: string) => {
    setSelectedManagerId(newManagerId);
    updateManager.mutate(newManagerId);
  };

  // Add this new effect to fetch disciplinary incidents
  useEffect(() => {
    const fetchDisciplinaryIncidents = async () => {
      try {
        console.log('Fetching disciplinary incidents for user:', id);
        const data = await disciplinaryService.getEmployeeIncidents(id as string);
        console.log('Disciplinary incidents data:', data);
        setDisciplinaryIncidents(data);
      } catch (error) {
        console.error('Error fetching disciplinary incidents:', error);
      }
    };

    if (id) {
      fetchDisciplinaryIncidents();
    }
  }, [id]);

  const handleAddDocument = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAddingDocument(true);

    try {
      const formData = new FormData(event.currentTarget);
      const file = formData.get('file') as File;

      let fileData = null;
      if (file && file.size > 0) {
        // Create a new FormData for file upload
        const fileFormData = new FormData();
        fileFormData.append('file', file);

        // Upload the file first
        const uploadResponse = await api.post('/api/upload', fileFormData);
        fileData = uploadResponse.data;
      }

      // Prepare document data
      const documentData = {
        title: formData.get('title'),
        type: formData.get('type'),
        description: formData.get('description'),
        date: new Date().toISOString(),
        ...(fileData && {
          fileUrl: fileData.url,
          fileName: file.name,
          fileType: file.type
        })
      };

      // Add the document
      const response = await api.post(`/api/users/${id}/documents`, documentData);
      console.log('Document added response:', response.data);

      // Refetch user data to update the UI
      await refetch();

      toast({
        title: 'Document Added',
        description: 'The document has been successfully added.',
        variant: 'default'
      });

      // Close the dialog using the ref
      dialogCloseRef.current?.click();
    } catch (error) {
      console.error('Error adding document:', error);
      toast({
        title: 'Error',
        description: 'Failed to add the document. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAddingDocument(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 space-y-4">
        <Button
          variant="outline"
          onClick={() => navigate('/users')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-semibold text-red-600">User not found</h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  // Function to get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-[#F4F4F4] min-h-screen">
      {/* Replace the custom header with PageHeader */}
      <div className="px-6 pt-6">
        <PageHeader
          title={profile.name}
          subtitle={
            <div className="flex items-center gap-2 text-white/80 text-sm md:text-base">
              <Briefcase className="w-4 h-4" />
              <span>{profile.position}</span>
              <span className="mx-1">•</span>
              <Users className="w-4 h-4" />
              <span>{profile.departments.join(', ')}</span>
              <Badge className={`ml-2 ${profile.status === 'active' ? 'bg-green-500/20 text-green-100' : 'bg-gray-500/20 text-gray-100'} border-none`}>
                {profile.status}
              </Badge>
            </div>
          }
          icon={
            <Avatar className="h-10 w-10 border-2 border-white/20">
              <AvatarImage src="" alt={profile.name} />
              <AvatarFallback className="bg-white/20 text-white text-base font-bold">
                {getUserInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
          }
          actions={
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button
                  onClick={() => navigate(`/users/${id}/edit`)}
                  className="flex-1 sm:flex-none bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
              <button
                onClick={() => navigate(currentUser?._id === profile._id ? '/' : '/users')}
                className="flex-1 sm:flex-none bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentUser?._id === profile._id ? 'Back to Dashboard' : 'Back to Users'}</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Basic Info Card */}
        <Card className="bg-white rounded-[20px] shadow-md overflow-hidden border-none">
          <CardHeader className="bg-[#F9F9F9] border-b border-gray-100 p-6">
            <CardTitle className="text-xl text-[#27251F] flex items-center gap-2">
              <User className="w-5 h-5 text-[#E51636]" />
              Employee Information
            </CardTitle>
            <CardDescription>
              Basic details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-xl bg-[#E51636]/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#E51636]" />
                  </div>
                  <div className="max-w-[200px]">
                    <p className="text-sm text-[#27251F]/60 font-medium">Email</p>
                    <p className="font-medium text-[#27251F] truncate" title={profile.email}>{profile.email}</p>
                  </div>
                </div>
              </div>

              {profile.phone && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 rounded-xl bg-[#E51636]/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-[#E51636]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#27251F]/60 font-medium">Phone</p>
                      <p className="font-medium text-[#27251F]">{profile.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-xl bg-[#E51636]/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#E51636]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#27251F]/60 font-medium">Start Date</p>
                    <p className="font-medium text-[#27251F]">{new Date(profile.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {profile.manager && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 rounded-xl bg-[#E51636]/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#E51636]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#27251F]/60 font-medium">Manager</p>
                      <p className="font-medium text-[#27251F]">{profile.manager.name}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-xl bg-[#E51636]/10 flex items-center justify-center">
                    <Building className="w-5 h-5 text-[#E51636]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#27251F]/60 font-medium">Store</p>
                    <p className="font-medium text-[#27251F]">{profile.store.name} (#{profile.store.storeNumber})</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-xl bg-[#E51636]/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#E51636]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#27251F]/60 font-medium">Shift</p>
                    <p className="font-medium text-[#27251F] capitalize">{profile.shift}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-xl bg-[#E51636]/10 flex items-center justify-center">
                    <BadgeCheck className="w-5 h-5 text-[#E51636]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#27251F]/60 font-medium">Role</p>
                    <p className="font-medium text-[#27251F] capitalize">{profile.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="bg-white rounded-xl p-1 flex w-full min-w-max shadow-sm border border-gray-100">
              <TabsTrigger
                value="performance"
                className="px-4 py-2 data-[state=active]:bg-[#E51636] data-[state=active]:text-white transition-all duration-200"
              >
                <Activity className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger
                value="training"
                className="px-4 py-2 data-[state=active]:bg-[#E51636] data-[state=active]:text-white transition-all duration-200"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Training
              </TabsTrigger>
              <TabsTrigger
                value="development"
                className="px-4 py-2 data-[state=active]:bg-[#E51636] data-[state=active]:text-white transition-all duration-200"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Development
              </TabsTrigger>
              <TabsTrigger
                value="documentation"
                className="px-4 py-2 data-[state=active]:bg-[#E51636] data-[state=active]:text-white transition-all duration-200"
              >
                <FileText className="w-4 h-4 mr-2" />
                Documentation
              </TabsTrigger>
              <TabsTrigger
                value="metrics"
                className="px-4 py-2 data-[state=active]:bg-[#E51636] data-[state=active]:text-white transition-all duration-200"
              >
                <Activity className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Performance Tab Content */}
          <TabsContent value="performance">
            <div className="grid gap-6">
              <Card className="bg-white rounded-[20px] shadow-md overflow-hidden border-none">
                <CardHeader className="bg-[#F9F9F9] border-b border-gray-100 p-6">
                  <CardTitle className="text-[#27251F] text-xl flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#E51636]" />
                    Performance Overview
                  </CardTitle>
                  <CardDescription>
                    Evaluation scores over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evaluationScores || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27251F/10" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                          stroke="#27251F/60"
                        />
                        <YAxis domain={[0, 100]} stroke="#27251F/60" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          labelStyle={{ fontWeight: 'bold', color: '#27251F' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#E51636"
                          strokeWidth={2}
                          dot={{ stroke: '#E51636', strokeWidth: 2, fill: 'white', r: 4 }}
                          activeDot={{ stroke: '#E51636', strokeWidth: 2, fill: '#E51636', r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-[20px] shadow-md overflow-hidden border-none">
                <CardHeader className="bg-[#F9F9F9] border-b border-gray-100 p-6">
                  <CardTitle className="text-[#27251F] text-xl flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-[#E51636]" />
                    Recent Evaluations
                  </CardTitle>
                  <CardDescription>
                    Performance review history
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {profile.evaluations?.map((evaluation: Evaluation, index: number) => (
                      <Card key={evaluation.id || index} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-[#E51636]/10 flex items-center justify-center">
                                <Star className="w-5 h-5 text-[#E51636]" />
                              </div>
                              <div>
                                <h4 className="font-medium text-[#27251F]">{evaluation.type}</h4>
                                <p className="text-sm text-[#27251F]/60">
                                  {new Date(evaluation.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-semibold px-3 py-1 rounded-full bg-[#E51636]/10 text-[#E51636]">{evaluation.score}%</span>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-green-50 p-4 rounded-xl">
                              <h5 className="text-sm font-medium mb-3 flex items-center gap-2 text-green-700">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Strengths
                              </h5>
                              <ul className="list-disc pl-4 text-sm text-green-700/80 space-y-2">
                                {evaluation.strengths?.map((strength: string, i: number) => (
                                  <li key={i}>{strength}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-red-50 p-4 rounded-xl">
                              <h5 className="text-sm font-medium mb-3 flex items-center gap-2 text-red-700">
                                <Target className="w-4 h-4 text-red-500" />
                                Areas for Improvement
                              </h5>
                              <ul className="list-disc pl-4 text-sm text-red-700/80 space-y-2">
                                {evaluation.improvements?.map((improvement: string, i: number) => (
                                  <li key={i}>{improvement}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {!profile.evaluations?.length && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                        <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-[#27251F]/60 font-medium">No evaluations on record</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Training Tab Content */}
          <TabsContent value="training">
            <div className="grid gap-6">
              <Card className="bg-white rounded-[20px] shadow-md overflow-hidden border-none">
                <CardHeader className="bg-[#F9F9F9] border-b border-gray-100 p-6">
                  <CardTitle className="text-[#27251F] text-xl flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#E51636]" />
                    Training Overview
                  </CardTitle>
                  <CardDescription>
                    Current training progress and certifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {isTrainingLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
                    </div>
                  ) : trainingProgress && trainingProgress.length > 0 ? (
                    <div className="space-y-8">
                      {/* Active Training Plans */}
                      <div>
                        <h3 className="text-lg font-medium text-[#27251F] mb-4 flex items-center gap-2">
                          <BookOpenIcon className="w-5 h-5 text-[#E51636]" />
                          Active Training
                        </h3>
                          <div className="space-y-4">
                            {trainingProgress
                              .filter(plan => plan.status === 'IN_PROGRESS')
                              .length > 0 ? (
                              trainingProgress
                                .filter(plan => plan.status === 'IN_PROGRESS')
                                .map((plan, index) => {
                                // Calculate progress percentage
                                const totalModules = plan.moduleProgress?.length || 0;
                                const completedModules = plan.moduleProgress?.filter(module => module.completed)?.length || 0;
                                const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

                                return (
                                  <Card
                                    key={index}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#E51636]/30 transition-all duration-200 cursor-pointer relative group"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (!plan._id) {
                                        console.error('Training plan ID is missing or invalid:', plan);
                                        toast({
                                          title: 'Error',
                                          description: 'This training plan cannot be viewed. ID is missing.',
                                          variant: 'destructive'
                                        });
                                        return;
                                      }

                                      console.log('Navigating to training plan with ID:', plan._id);
                                      navigate(`/training/progress/${plan._id}`);
                                    }}
                                  >
                                    <CardContent className="p-6">
                                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Badge variant="outline" className="bg-white/80 text-[#E51636] border-[#E51636]/20 text-xs">
                                          View Details
                                        </Badge>
                                      </div>
                                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                        <div className="flex items-start gap-3">
                                          <div className="h-10 w-10 rounded-xl bg-[#E51636]/10 flex items-center justify-center mt-1">
                                            <BookOpenIcon className="w-5 h-5 text-[#E51636]" />
                                          </div>
                                          <div>
                                            <h4 className="font-medium text-[#27251F] text-lg">{plan.trainingPlan?.name || 'Training Plan'}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                              <Calendar className="w-4 h-4 text-[#27251F]/60" />
                                              <p className="text-sm text-[#27251F]/60">
                                                Started: {new Date(plan.startDate).toLocaleDateString()}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                          Active Training
                                        </Badge>
                                      </div>

                                      <div className="space-y-4">
                                        <div className="bg-[#F9F9F9] p-4 rounded-xl">
                                          <div className="flex justify-between text-sm mb-3">
                                            <span className="text-[#27251F]/80 font-medium">Progress</span>
                                            <span className="text-[#E51636] font-semibold">{progressPercentage}%</span>
                                          </div>

                                          {/* Progress Bar */}
                                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                                            <div
                                              className="h-full bg-[#E51636] rounded-full transition-all duration-500 ease-in-out"
                                              style={{ width: `${progressPercentage}%` }}
                                            ></div>
                                          </div>

                                          <div className="flex justify-between items-center mt-2 text-sm text-[#27251F]/60 bg-white p-2 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-2">
                                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                                              <span>{completedModules} completed</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Layers className="w-4 h-4 text-gray-400" />
                                              <span>{totalModules - completedModules} remaining</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })
                            ) : (
                              <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                                <BookOpenIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-[#27251F]/60 font-medium">No active training plans</p>
                                <p className="text-[#27251F]/40 text-sm mt-1">This employee is not currently enrolled in any active training</p>
                              </div>
                            )}
                          </div>
                        </div>

                      {/* Completed Training */}
                      {trainingProgress.filter(plan => plan.status === 'COMPLETED').length > 0 ? (
                        <div>
                          <h3 className="text-lg font-medium text-[#27251F] mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            Completed Training
                          </h3>
                          <div className="space-y-4">
                            {trainingProgress
                              .filter(plan => plan.status === 'COMPLETED')
                              .map((plan, index) => (
                                <Card
                                  key={index}
                                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-300 transition-all duration-200 cursor-pointer relative group"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (!plan._id) {
                                      console.error('Training plan ID is missing or invalid:', plan);
                                      toast({
                                        title: 'Error',
                                        description: 'This training plan cannot be viewed. ID is missing.',
                                        variant: 'destructive'
                                      });
                                      return;
                                    }

                                    console.log('Navigating to training plan with ID:', plan._id);
                                    navigate(`/training/progress/${plan._id}`);
                                  }}
                                >
                                  <CardContent className="p-4">
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Badge variant="outline" className="bg-white/80 text-green-600 border-green-200 text-xs">
                                        View Details
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-[#27251F]">{plan.trainingPlan?.name || 'Training Plan'}</h4>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4 text-[#27251F]/60" />
                                            <p className="text-xs text-[#27251F]/60">
                                              Completed: {plan.completedAt ? new Date(plan.completedAt).toLocaleDateString() : 'Unknown'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <Badge className="bg-green-100 text-green-800">
                                        100% Complete
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                      <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-[#27251F]/60 font-medium">No training records found</p>
                      <p className="text-[#27251F]/40 text-sm mt-2">This employee has no training history or active plans</p>
                      <Button
                        variant="outline"
                        className="mt-4 text-sm bg-white hover:bg-gray-50"
                        onClick={() => navigate('/training/progress')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Assign Training
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Certifications Card */}
              <Card className="bg-white rounded-[20px] shadow-md overflow-hidden border-none">
                <CardHeader className="bg-[#F9F9F9] border-b border-gray-100 p-6">
                  <CardTitle className="text-[#27251F] text-xl flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#E51636]" />
                    Certifications
                  </CardTitle>
                  <CardDescription>
                    Training certifications and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Enhanced visual placeholder for certifications */}
                  <div className="py-6">
                    <div className="text-center mb-8">
                      <div className="relative inline-block">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-30 blur-lg"></div>
                        <div className="relative bg-white p-4 rounded-full">
                          <Award className="w-16 h-16 text-[#E51636]" />
                        </div>
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-[#27251F]">Achievement Showcase</h3>
                      <p className="text-[#27251F]/60 max-w-md mx-auto mt-2">Complete training modules to earn certifications and achievements</p>
                    </div>

                    {/* Empty state with visual badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      {['Food Safety', 'Customer Service', 'Leadership'].map((cert, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center opacity-50 hover:opacity-70 transition-opacity">
                          <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-3">
                            {index === 0 ? <Stethoscope className="w-8 h-8 text-gray-400" /> :
                             index === 1 ? <MessageSquare className="w-8 h-8 text-gray-400" /> :
                             <Award className="w-8 h-8 text-gray-400" />}
                          </div>
                          <h4 className="text-sm font-medium text-gray-500">{cert}</h4>
                          <p className="text-xs text-gray-400 mt-1">Not yet certified</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Development Tab Content */}
          <TabsContent value="development">
            <div className="grid gap-6">
              <Card className="bg-white rounded-[20px] shadow-md overflow-hidden border-none">
                <CardHeader className="bg-[#F9F9F9] border-b border-gray-100 p-6">
                  <CardTitle className="text-[#27251F] text-xl flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#E51636]" />
                    Development Goals
                  </CardTitle>
                  <CardDescription>
                    Career growth and skill development tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {profile.development?.map((goal: Goal, index: number) => (
                      <Card key={goal.id || index} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-xl bg-[#E51636]/10 flex items-center justify-center mt-1">
                                <Target className="w-5 h-5 text-[#E51636]" />
                              </div>
                              <div>
                                <h4 className="font-medium text-[#27251F] text-lg">{goal.goal}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Calendar className="w-4 h-4 text-[#27251F]/60" />
                                  <p className="text-sm text-[#27251F]/60">
                                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              goal.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : goal.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {goal.status.replace('-', ' ')}
                            </span>
                          </div>

                          <div className="space-y-5">
                            <div className="bg-[#F9F9F9] p-4 rounded-xl">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-[#27251F]/80 font-medium">Progress</span>
                                <span className="text-[#E51636] font-semibold">{goal.progress}%</span>
                              </div>
                              <div className="w-full bg-[#27251F]/10 rounded-full h-3">
                                <div
                                  className="bg-[#E51636] h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${goal.progress}%` }}
                                />
                              </div>
                            </div>

                            {goal.notes?.length > 0 && (
                              <div className="border-t border-gray-100 pt-4">
                                <h5 className="text-sm font-medium mb-3 text-[#27251F] flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-[#E51636]" />
                                  Progress Notes
                                </h5>
                                <ul className="space-y-3 bg-gray-50 p-4 rounded-xl">
                                  {goal.notes?.map((note: string, i: number) => (
                                    <li key={i} className="text-sm text-[#27251F]/80 flex items-start gap-2">
                                      <span className="text-[#E51636] font-bold mt-1">•</span>
                                      <span>{note}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {!profile.development?.length && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-[#27251F]/60 font-medium">No development goals on record</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documentation Tab Content */}
          <TabsContent value="documentation">
            <div className="grid gap-6">
              {/* Disciplinary Incidents Section */}
              <Card className="bg-white rounded-[20px] shadow-md overflow-hidden border-none">
                <CardHeader className="bg-[#F9F9F9] border-b border-gray-100 p-6">
                  <CardTitle className="text-[#27251F] text-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#E51636]" />
                    Disciplinary Incidents
                  </CardTitle>
                  <CardDescription>
                    Record of workplace incidents and actions taken
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {disciplinaryIncidents.map((incident) => (
                      <Card key={incident._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center mt-1">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-[#27251F] text-lg">{incident.type}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Calendar className="w-4 h-4 text-[#27251F]/60" />
                                  <p className="text-sm text-[#27251F]/60">
                                    {new Date(incident.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                incident.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                                incident.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {incident.status}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                incident.severity === 'Minor' ? 'bg-gray-100 text-gray-800' :
                                incident.severity === 'Moderate' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {incident.severity}
                              </span>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-xl">
                              <h5 className="text-sm font-medium text-[#27251F] mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#E51636]" />
                                Description
                              </h5>
                              <p className="text-sm text-[#27251F]/80">{incident.description}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                              <h5 className="text-sm font-medium text-[#27251F] mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[#E51636]" />
                                Action Taken
                              </h5>
                              <p className="text-sm text-[#27251F]/80">{incident.actionTaken}</p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex flex-col gap-1 text-sm text-[#27251F]/60">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>Issued by: <span className="font-medium text-[#27251F]">{incident.createdBy.name}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  <span>Manager: <span className="font-medium text-[#27251F]">{incident.supervisor.name}</span></span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                className="flex items-center gap-2 text-[#E51636] hover:bg-[#E51636]/10 border-[#E51636]/20"
                                onClick={() => navigate(`/disciplinary/${incident._id}`)}
                              >
                                <FileText className="w-4 h-4" />
                                View Write-up
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {disciplinaryIncidents.length === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-[#27251F]/60 font-medium">No disciplinary incidents on record</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-[20px] shadow-md overflow-hidden border-none">
                <CardHeader className="bg-[#F9F9F9] border-b border-gray-100 p-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-[#27251F] text-xl flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#E51636]" />
                      Document History
                    </CardTitle>
                    <CardDescription>
                      Employee records and documentation
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-[#E51636] hover:bg-[#E51636]/90 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Add New Document</DialogTitle>
                        <DialogDescription>
                          Upload a document or record a conversation for this team member.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddDocument} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input id="title" name="title" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Document Type</Label>
                          <Select name="type" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="review">Performance Review</SelectItem>
                              <SelectItem value="disciplinary">Disciplinary Action</SelectItem>
                              <SelectItem value="coaching">Coaching Session</SelectItem>
                              <SelectItem value="medical">Medical Documentation</SelectItem>
                              <SelectItem value="conversation">Conversation Record</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="file">Document File (Optional)</Label>
                          <Input
                            id="file"
                            name="file"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                          <p className="text-sm text-[#27251F]/60">
                            Supported formats: PDF, Word, Images
                          </p>
                        </div>
                        <DialogFooter>
                          <DialogClose ref={dialogCloseRef} className="hidden" />
                          <Button
                            type="submit"
                            className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                            disabled={isAddingDocument}
                          >
                            {isAddingDocument ? (
                              <>
                                <span className="mr-2">Adding...</span>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              </>
                            ) : (
                              'Add Document'
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {profile.documentation?.map((doc: Document, index: number) => (
                      <Card
                        key={doc.id || index}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-[#E51636]/30"
                        onClick={(e) => {
                          // Get the document ID, either from id or _id property
                          const documentId = doc.id || (doc._id ? doc._id.toString() : null);

                          // If no document ID is available, show an error
                          if (!documentId) {
                            console.error('Document ID is missing:', doc);
                            toast({
                              title: 'Error',
                              description: 'This document cannot be viewed. ID is missing.',
                              variant: 'destructive'
                            });
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }

                          console.log('Document details:', {
                            id: doc.id,
                            _id: doc._id,
                            documentId,
                            type: typeof documentId
                          });

                          // Add check to ensure documentId is a valid string
                          if (typeof documentId === 'string' && documentId.length > 0) {
                            navigate(`/documentation/${documentId}`);
                          } else {
                            console.error('Invalid document ID:', documentId);
                            toast({
                              title: 'Error',
                              description: 'This document cannot be viewed. Invalid ID format.',
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[#E51636]/10 flex items-center justify-center mt-1">
                              {doc.type === 'review' && <ClipboardList className="w-5 h-5 text-[#E51636]" />}
                              {doc.type === 'disciplinary' && <AlertCircle className="w-5 h-5 text-[#E51636]" />}
                              {doc.type === 'coaching' && <BookOpen className="w-5 h-5 text-[#E51636]" />}
                              {doc.type === 'medical' && <Stethoscope className="w-5 h-5 text-[#E51636]" />}
                              {doc.type === 'conversation' && <MessageSquare className="w-5 h-5 text-[#E51636]" />}
                              {doc.type === 'other' && <File className="w-5 h-5 text-[#E51636]" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                <h4 className="font-medium text-[#27251F] text-lg">{doc.title}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                                    {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-4 h-4 text-[#27251F]/60" />
                                <p className="text-sm text-[#27251F]/60">
                                  {new Date(doc.date).toLocaleDateString()} • By {doc.createdBy}
                                </p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                <p className="text-sm text-[#27251F]/80">{doc.description}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {doc.fileUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-[#E51636] hover:text-[#E51636]/90 hover:bg-[#E51636]/10 border-[#E51636]/20"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent card click
                                      if (doc.fileUrl) {
                                        window.open(doc.fileUrl, '_blank');
                                      } else {
                                        console.error('Document file URL is missing:', doc);
                                        toast({
                                          title: 'Error',
                                          description: 'This document file cannot be viewed. URL is missing.',
                                          variant: 'destructive'
                                        });
                                      }
                                    }}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    View {doc.fileName || 'Document'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {!profile.documentation?.length && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-[#27251F]/60 font-medium">No documents on record</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab Content */}
          <TabsContent value="metrics">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white rounded-[20px] shadow-md overflow-hidden border-none hover:shadow-lg transition-all duration-300">
                  <CardHeader className="bg-[#F9F9F9] border-b border-gray-100 p-4">
                    <CardTitle className="text-[#27251F] text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#E51636]" />
                      Training Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 mb-3">
                        <svg className="w-24 h-24" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-[#E51636]"
                            strokeWidth="8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - (profile.metrics?.trainingCompletion || 0) / 100)}`}
                          />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-[#E51636]">
                          {profile.metrics?.trainingCompletion || 0}%
                        </div>
                      </div>
                      <p className="text-sm text-[#27251F]/60 text-center font-medium">Training Completion</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white rounded-[20px] shadow-md overflow-hidden border-none hover:shadow-lg transition-all duration-300">
                  <CardHeader className="bg-[#F9F9F9] border-b border-gray-100 p-4">
                    <CardTitle className="text-[#27251F] text-base flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#E51636]" />
                      Goal Achievement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 mb-3">
                        <svg className="w-24 h-24" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-[#E51636]"
                            strokeWidth="8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - (profile.metrics?.goalAchievement || 0) / 100)}`}
                          />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-[#E51636]">
                          {profile.metrics?.goalAchievement || 0}%
                        </div>
                      </div>
                      <p className="text-sm text-[#27251F]/60 text-center font-medium">Goal Achievement</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white rounded-[20px] shadow-md overflow-hidden border-none hover:shadow-lg transition-all duration-300">
                  <CardHeader className="bg-[#F9F9F9] border-b border-gray-100 p-4">
                    <CardTitle className="text-[#27251F] text-base flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#E51636]" />
                      Leadership Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 mb-3">
                        <svg className="w-24 h-24" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-[#E51636]"
                            strokeWidth="8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - (profile.metrics?.leadershipScore || 0) / 100)}`}
                          />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-[#E51636]">
                          {profile.metrics?.leadershipScore || 0}%
                        </div>
                      </div>
                      <p className="text-sm text-[#27251F]/60 text-center font-medium">Leadership Score</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white rounded-[20px] shadow-md overflow-hidden border-none">
                <CardHeader className="bg-[#F9F9F9] border-b border-gray-100 p-6">
                  <CardTitle className="text-[#27251F] text-xl flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#E51636]" />
                    Hearts & Hands Assessment
                  </CardTitle>
                  <CardDescription>
                    Employee engagement and skill assessment matrix
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="max-w-[500px] mx-auto">
                    <div className="aspect-square relative bg-white p-4 mt-8 border border-gray-100 rounded-xl shadow-sm">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm bg-[#E51636] text-white px-3 py-1 rounded-full font-medium">
                        Engagement & Commitment
                      </div>

                      <div className="absolute -right-16 sm:-right-32 top-1/2 -translate-y-1/2 text-sm bg-[#E51636] text-white px-3 py-1 rounded-full font-medium rotate-90">
                        Skills & Abilities
                      </div>

                      <div
                        className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 relative"
                        ref={dragContainerRef}
                      >
                        <div className="bg-yellow-100 rounded-tl-lg border border-[#27251F]/10 flex items-center justify-center p-2">
                          <div className="text-xs text-center text-yellow-800 font-medium">High Engagement<br />Low Skills</div>
                        </div>
                        <div className="bg-green-100 rounded-tr-lg border border-[#27251F]/10 flex items-center justify-center p-2">
                          <div className="text-xs text-center text-green-800 font-medium">High Engagement<br />High Skills</div>
                        </div>
                        <div className="bg-red-100 rounded-bl-lg border border-[#27251F]/10 flex items-center justify-center p-2">
                          <div className="text-xs text-center text-red-800 font-medium">Low Engagement<br />Low Skills</div>
                        </div>
                        <div className="bg-yellow-100 rounded-br-lg border border-[#27251F]/10 flex items-center justify-center p-2">
                          <div className="text-xs text-center text-yellow-800 font-medium">Low Engagement<br />High Skills</div>
                        </div>

                        {/* Only make the dot draggable for admins and managers */}
                        {(currentUser?.role === 'admin' || currentUser?._id === profile.manager?._id) ? (
                          <Draggable
                            bounds="parent"
                            nodeRef={draggableRef}
                            position={position}
                            onDrag={(e, data) => {
                              setPosition(data);
                              if (dragContainerRef.current) {
                                const rect = dragContainerRef.current.getBoundingClientRect();
                                const dotSize = 32;
                                const x = Math.max(0, Math.min(Math.round((data.x) / (rect.width - dotSize) * 100), 100));
                                const y = Math.max(0, Math.min(Math.round(100 - (data.y / (rect.height - dotSize) * 100)), 100));
                                setHeartsAndHandsPosition({ x, y });
                              }
                            }}
                            onStop={(e, data) => {
                              if (dragContainerRef.current) {
                                const rect = dragContainerRef.current.getBoundingClientRect();
                                const dotSize = 32;
                                const x = Math.max(0, Math.min(Math.round((data.x) / (rect.width - dotSize) * 100), 100));
                                const y = Math.max(0, Math.min(Math.round(100 - (data.y / (rect.height - dotSize) * 100)), 100));
                                setHeartsAndHandsPosition({ x, y });
                              }
                            }}
                          >
                            <div
                              ref={draggableRef}
                              className="w-8 h-8 bg-[#E51636] rounded-full cursor-move absolute flex items-center justify-center shadow-lg"
                            >
                              <span className="text-xs font-medium text-white">
                                {getUserInitials(profile.name)}
                              </span>
                            </div>
                          </Draggable>
                        ) : (
                          /* Non-draggable dot for team members */
                          <div
                            className="w-8 h-8 bg-[#E51636] rounded-full absolute flex items-center justify-center shadow-lg"
                            style={{
                              left: `${position.x}px`,
                              top: `${position.y}px`
                            }}
                          >
                            <span className="text-xs font-medium text-white">
                              {getUserInitials(profile.name)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Show instructions and save button only for admins and managers */}
                    {(currentUser?.role === 'admin' || currentUser?._id === profile.manager?._id) ? (
                      <div className="mt-6 space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-sm text-[#27251F]/80">
                          <p className="font-medium mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-[#E51636]" />
                            Assessment Instructions
                          </p>
                          <p>Drag the red dot to update the team member's position on the Hearts & Hands quadrant.</p>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={() => updateHeartsAndHandsMutation.mutate(heartsAndHandsPosition)}
                            disabled={updateHeartsAndHandsMutation.isPending}
                            className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                          >
                            {updateHeartsAndHandsMutation.isPending ? (
                              <>
                                <span className="mr-2">Saving...</span>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              </>
                            ) : (
                              'Save Position'
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Informational message for team members */
                      <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                        <p className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Hearts & Hands Assessment</span>
                        </p>
                        <p className="mt-1 pl-6">This assessment shows your current position in the Hearts & Hands quadrant as evaluated by your manager.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}