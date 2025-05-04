import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  UserX,
  ClipboardList,
  Filter,
  Search,
  Loader2,
  Mail,
  Bell,
  ChevronLeft,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import disciplinaryService, { DisciplinaryIncident } from '@/services/disciplinaryService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';

export default function DisciplinaryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [incidents, setIncidents] = useState<DisciplinaryIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    open: 0,
    followUps: 0,
    resolved: 0,
    repeat: 0
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await disciplinaryService.getAllIncidents();
      console.log('Raw data from server:', data);

      // Log any null incidents
      const nullIncidents = data.filter(incident => !incident || !incident._id);
      if (nullIncidents.length > 0) {
        console.warn('Found null or invalid incidents:', nullIncidents);
      }

      setIncidents(data);

      // Debug logging
      console.log('All incidents:', data.map(i => ({
        id: i._id,
        status: i.status,
        type: i.type,
        severity: i.severity,
        description: i.description
      })));

      // Calculate stats
      const openIncidents = data.filter(i => i.status === 'Open' || i.status === 'Pending Acknowledgment' || i.status === 'In Progress' || i.status === 'Pending Follow-up');
      console.log('Open incidents:', openIncidents.map(i => ({
        id: i._id,
        status: i.status,
        type: i.type,
        severity: i.severity,
        description: i.description
      })));

      const stats = {
        open: openIncidents.length,
        followUps: data.filter(i => new Date(i.followUpDate) >= new Date()).length,
        resolved: data.filter(i => i.status === 'Resolved').length,
        repeat: data.filter(i => i.previousIncidents).length
      };
      console.log('Calculated stats:', stats);
      setStats(stats);
    } catch (error) {
      toast.error('Failed to load incidents');
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredIncidents = () => {
    // Filter out null or undefined incidents and those with missing required data
    let filtered = incidents.filter(incident =>
      incident != null &&
      incident._id != null &&
      incident.status != null
    );

    // Filter out incidents that have passed their fall-off date
    filtered = filtered.filter(incident => {
      if (!incident.fallOffDate) return true; // Keep incidents with no fall-off date
      const fallOffDate = new Date(incident.fallOffDate);
      const today = new Date();
      return fallOffDate >= today;
    });

    // Add debug logging for filtered incidents
    console.log('Filtered incidents after null check:', filtered.map(i => ({
      id: i._id,
      status: i.status,
      supervisor: i.supervisor?._id,
      employee: i.employee?._id
    })));

    console.log('Initial incidents for filtering:', filtered.map(i => ({
      id: i._id,
      status: i.status,
      type: i.type,
      severity: i.severity,
      description: i.description
    })));

    // Status filter
    switch (filter) {
      case 'all':
        // Don't filter, show all incidents
        break;
      case 'open':
        filtered = filtered.filter(i => i.status === 'Open' || i.status === 'Pending Acknowledgment');
        break;
      case 'in-progress':
        filtered = filtered.filter(i => i.status === 'In Progress' || i.status === 'Pending Follow-up');
        break;
      case 'followup':
        filtered = filtered.filter(i => new Date(i.followUpDate) >= new Date());
        break;
      case 'resolved':
        filtered = filtered.filter(i => i.status === 'Resolved');
        break;
    }

    console.log('After status filtering:', filtered.map(i => ({
      id: i._id,
      status: i.status,
      type: i.type,
      severity: i.severity,
      description: i.description
    })));

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.employee?.name.toLowerCase().includes(query) ||
        i.employee?.position.toLowerCase().includes(query) ||
        i.employee?.department.toLowerCase().includes(query) ||
        i.type.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query)
      );
      console.log('After search filtering:', filtered.map(i => ({
        id: i._id,
        status: i.status,
        type: i.type,
        severity: i.severity,
        description: i.description
      })));
    }

    return filtered;
  };

  const handleNewIncident = () => {
    navigate('/disciplinary/new');
  };

  const handleViewDetails = (id: string) => {
    navigate(`/disciplinary/${id}`);
  };

  const handleAcknowledge = async (incidentId: string) => {
    navigate(`/disciplinary/${incidentId}`);
  };

  const handleSendUnacknowledgedNotification = async (e: React.MouseEvent, incidentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await disciplinaryService.sendUnacknowledgedNotification(incidentId);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-50 text-green-600 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center border border-green-100';
      notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="font-medium">Acknowledgement reminder sent successfully</span>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 3000);
    } catch (error: any) {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-50 text-red-600 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center border border-red-100';
      notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span class="font-medium">${error.response?.data?.message || 'Failed to send notification'}</span>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Team Discipline"
          subtitle="Track and manage team member disciplinary actions"
          actions={
            (user?.position === 'Leader' || user?.position === 'Director') && (
              <button
                onClick={handleNewIncident}
                className="w-full bg-white hover:bg-gray-50 text-[#E51636] flex items-center justify-center gap-2 py-2 md:py-2.5 px-3 md:px-4 rounded-[6px] md:rounded-[8px] transition-colors"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base font-medium">New Discipline</span>
              </button>
            )
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white rounded-[20px] hover:shadow-lg transition-all">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <p className="text-[#27251F]/60 font-medium">Open Incidents</p>
                  <h3 className="text-3xl font-bold text-[#27251F]">{stats.open}</h3>
                </div>
                <div className="h-12 w-12 bg-[#E51636]/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-[#E51636]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[20px] hover:shadow-lg transition-all">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <p className="text-[#27251F]/60 font-medium">Follow-ups Due</p>
                  <h3 className="text-3xl font-bold text-[#27251F]">{stats.followUps}</h3>
                </div>
                <div className="h-12 w-12 bg-[#E51636]/10 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#E51636]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[20px] hover:shadow-lg transition-all">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <p className="text-[#27251F]/60 font-medium">Resolved This Month</p>
                  <h3 className="text-3xl font-bold text-[#27251F]">{stats.resolved}</h3>
                </div>
                <div className="h-12 w-12 bg-[#E51636]/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-[#E51636]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[20px] hover:shadow-lg transition-all">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <p className="text-[#27251F]/60 font-medium">Repeat Incidents</p>
                  <h3 className="text-3xl font-bold text-[#27251F]">{stats.repeat}</h3>
                </div>
                <div className="h-12 w-12 bg-[#E51636]/10 rounded-xl flex items-center justify-center">
                  <UserX className="h-6 w-6 text-[#E51636]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters Card */}
        <Card className="bg-white rounded-[20px] shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#27251F]/40" />
                <Input
                  type="text"
                  placeholder="Search by employee, position, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 w-full bg-white border-[#27251F]/10 placeholder:text-[#27251F]/40 focus-visible:ring-[#E51636]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  className={`h-10 px-4 rounded-full ${
                    filter === 'all'
                      ? 'bg-[#E51636] hover:bg-[#E51636]/90 text-white'
                      : 'border-[#27251F]/10 hover:bg-[#27251F]/5'
                  }`}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'open' ? 'default' : 'outline'}
                  onClick={() => setFilter('open')}
                  className={`h-10 px-4 rounded-full ${
                    filter === 'open'
                      ? 'bg-[#E51636] hover:bg-[#E51636]/90 text-white'
                      : 'border-[#27251F]/10 hover:bg-[#27251F]/5'
                  }`}
                >
                  Open
                </Button>
                <Button
                  variant={filter === 'in-progress' ? 'default' : 'outline'}
                  onClick={() => setFilter('in-progress')}
                  className={`h-10 px-4 rounded-full ${
                    filter === 'in-progress'
                      ? 'bg-[#E51636] hover:bg-[#E51636]/90 text-white'
                      : 'border-[#27251F]/10 hover:bg-[#27251F]/5'
                  }`}
                >
                  In Progress
                </Button>
                <Button
                  variant={filter === 'resolved' ? 'default' : 'outline'}
                  onClick={() => setFilter('resolved')}
                  className={`h-10 px-4 rounded-full ${
                    filter === 'resolved'
                      ? 'bg-[#E51636] hover:bg-[#E51636]/90 text-white'
                      : 'border-[#27251F]/10 hover:bg-[#27251F]/5'
                  }`}
                >
                  Resolved
                </Button>
              </div>

              {(user?.position === 'Leader' || user?.position === 'Director') && (
                <Button
                  onClick={handleNewIncident}
                  className="sm:ml-auto w-full sm:w-auto bg-[#E51636] hover:bg-[#E51636]/90 text-white h-10 px-4 rounded-xl mt-2 sm:mt-0"
                >
                  New Discipline
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        <div className="space-y-4">
          {getFilteredIncidents()
            .filter(incident => incident != null && incident._id != null)
            .map((incident) => (
            <Card key={incident._id} className="bg-white rounded-[20px] shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-[#27251F]">
                      {incident.employee?.name || 'Unknown Employee'}
                    </h3>
                    <p className="text-sm text-[#27251F]/60">
                      {incident.employee?.position || 'Unknown Position'} • {incident.employee?.department || 'Unknown Department'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {incident.status === 'Pending Acknowledgment' && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100">
                        <span className="text-sm text-orange-800">Pending Acknowledgment</span>
                        {(user?._id === incident.supervisor?._id || user?.position === 'Director') && incident.supervisor && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0.5 rounded-full text-orange-800 hover:text-orange-900 hover:bg-orange-200"
                            onClick={(e) => handleSendUnacknowledgedNotification(e, incident._id)}
                            title="Send acknowledgement reminder"
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    {incident.status !== 'Pending Acknowledgment' && (
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        incident.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                        incident.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {incident.status}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      incident.severity === 'Minor' ? 'bg-gray-100 text-gray-800' :
                      incident.severity === 'Moderate' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {incident.severity}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-[#27251F] mb-2">Description</h4>
                    <p className="text-[#27251F]/60">{incident.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#27251F] mb-2">Action Taken</h4>
                    <p className="text-[#27251F]/60">{incident.actionTaken}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-[#27251F]/60">
                    <span>Issued by: {incident.createdBy?.name || 'Unknown'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Manager: {incident.supervisor?.name || 'Unknown'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Date: {new Date(incident.date).toLocaleDateString()}</span>
                    {incident.fallOffDate && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span>Falls off: {new Date(incident.fallOffDate).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    {incident.employee?._id && user?._id === incident.employee._id &&
                     incident.status === 'Pending Acknowledgment' && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex items-center gap-2 flex-1 sm:flex-initial justify-center h-10 px-4 rounded-xl bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcknowledge(incident._id);
                        }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Acknowledge
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 flex-1 sm:flex-initial justify-center h-10 px-4 rounded-xl border-gray-200 hover:bg-gray-100"
                      onClick={() => handleViewDetails(incident._id)}
                    >
                      <FileText className="w-4 h-4" />
                      View Details
                    </Button>
                    {incident.status === 'Resolved' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full text-[#E51636] hover:text-[#E51636] hover:bg-[#E51636]/10 active:scale-95 transition-transform duration-100"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await disciplinaryService.sendEmail(incident._id);
                            const notification = document.createElement('div');
                            notification.className = 'fixed top-4 right-4 bg-green-50 text-green-600 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center border border-green-100';
                            notification.innerHTML = `
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span class="font-medium">Email sent successfully</span>
                            `;
                            document.body.appendChild(notification);
                            setTimeout(() => {
                              notification.remove();
                            }, 3000);
                          } catch (error: any) {
                            const notification = document.createElement('div');
                            notification.className = 'fixed top-4 right-4 bg-red-50 text-red-600 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center border border-red-100';
                            notification.innerHTML = `
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span class="font-medium">${error.response?.data?.message || 'Failed to send email'}</span>
                            `;
                            document.body.appendChild(notification);
                            setTimeout(() => {
                              notification.remove();
                            }, 3000);
                          }
                        }}
                        title="Send incident details to store email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {getFilteredIncidents().length === 0 && (
            <Card className="bg-white rounded-[20px] shadow-md">
              <CardContent className="p-12 text-center">
                <p className="text-[#27251F]/60">No incidents found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}