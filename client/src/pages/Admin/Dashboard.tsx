import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  FileText,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Shield,
  TrendingUp,
  DollarSign,
  Activity,
  Store,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  Eye,
  Edit,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import adminService from '@/services/adminService';
import invoiceService from '@/services/invoiceService';
import { format } from 'date-fns';
import StoreSelector from '@/components/StoreSelector';
import PageHeader, { headerButtonClass } from '@/components/PageHeader';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is Jonathon Pope
  const isJonathonPope = user?.email === 'jonp4208@gmail.com';

  // Fetch admin data
  const { data: stores, isLoading: storesLoading, refetch: refetchStores } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: adminService.getAllStores,
    enabled: isJonathonPope
  });

  const { data: invoices, isLoading: invoicesLoading, refetch: refetchInvoices } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: () => invoiceService.getAllInvoices(),
    enabled: isJonathonPope
  });

  // Calculate metrics
  const totalStores = stores?.length || 0;
  const activeStores = stores?.filter(store => store.subscription?.status === 'active').length || 0;
  const totalUsers = stores?.reduce((sum, store) => sum + (store.userCount || 0), 0) || 0;
  const pendingInvoices = invoices?.filter(invoice => invoice.status === 'pending').length || 0;
  const totalRevenue = invoices?.filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0) || 0;

  // Handle refresh all data
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStores(), refetchInvoices()]);
    } finally {
      setRefreshing(false);
    }
  };

  // If user is not Jonathon Pope, show access denied
  if (!isJonathonPope) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
              <p className="mt-2 text-gray-600">This admin dashboard is restricted to authorized personnel only.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Use PageHeader component */}
        <PageHeader
          title="Admin Dashboard"
          subtitle="Manage stores, users, and system settings"
          icon={<ShieldCheck className="h-5 w-5" />}
          actions={
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <div className="flex items-center gap-3">
                <StoreSelector />
                <Button
                  className={headerButtonClass}
                  onClick={handleRefreshAll}
                  disabled={refreshing || storesLoading || invoicesLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          }
        />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Stores</p>
                <p className="text-2xl font-bold text-red-700">{totalStores}</p>
              </div>
              <Store className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Stores</p>
                <p className="text-2xl font-bold text-green-700">{activeStores}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-700">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending Invoices</p>
                <p className="text-2xl font-bold text-yellow-700">{pendingInvoices}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Revenue</p>
                <p className="text-2xl font-bold text-purple-700">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Store Management */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/stores')}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Building className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Store Management</CardTitle>
                <p className="text-sm text-gray-600">Manage stores and users</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Stores:</span>
                <span className="font-medium">{totalStores}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active Subscriptions:</span>
                <span className="font-medium text-green-600">{activeStores}</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Stores
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Invoice Management */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/invoices')}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Invoice Management</CardTitle>
                <p className="text-sm text-gray-600">Create and manage invoices</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pending:</span>
                <span className="font-medium text-yellow-600">{pendingInvoices}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Revenue:</span>
                <span className="font-medium text-green-600">${totalRevenue.toLocaleString()}</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Manage Invoices
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* System Analytics */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">System Analytics</CardTitle>
                <p className="text-sm text-gray-600">Cross-store insights</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Users:</span>
                <span className="font-medium">{totalUsers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Growth Rate:</span>
                <span className="font-medium text-green-600">+12%</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline" disabled>
              <TrendingUp className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Store Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stores */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Stores</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/stores')}>
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {storesLoading ? (
              <div className="text-center py-4 text-gray-500">Loading stores...</div>
            ) : stores && stores.length > 0 ? (
              <div className="space-y-3">
                {stores.slice(0, 5).map((store) => (
                  <div key={store._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{store.name}</h4>
                      <p className="text-sm text-gray-600">#{store.storeNumber} • {store.userCount || 0} users</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          store.subscription?.status === 'active' ? 'default' :
                          store.subscription?.status === 'trial' ? 'secondary' :
                          'outline'
                        }
                      >
                        {store.subscription?.status || 'none'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/stores/${store._id}/subscription`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No stores found</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/invoices')}>
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="text-center py-4 text-gray-500">Loading invoices...</div>
            ) : invoices && invoices.length > 0 ? (
              <div className="space-y-3">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">#{invoice.invoiceNumber}</h4>
                      <p className="text-sm text-gray-600">
                        {invoice.clientName} • {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${invoice.total.toLocaleString()}</span>
                      <Badge
                        variant={
                          invoice.status === 'paid' ? 'default' :
                          invoice.status === 'pending' ? 'secondary' :
                          'outline'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No invoices found</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <p className="text-sm text-gray-600">Common administrative tasks</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/admin/stores')}
            >
              <Plus className="h-6 w-6 text-red-500" />
              <span className="font-medium">Add New Store</span>
              <span className="text-xs text-gray-500">Create a new store</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/admin/invoices')}
            >
              <FileText className="h-6 w-6 text-blue-500" />
              <span className="font-medium">Create Invoice</span>
              <span className="text-xs text-gray-500">Generate new invoice</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/admin/stores')}
            >
              <UserCheck className="h-6 w-6 text-green-500" />
              <span className="font-medium">Manage Users</span>
              <span className="text-xs text-gray-500">Add or edit users</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/admin/stores')}
            >
              <CreditCard className="h-6 w-6 text-purple-500" />
              <span className="font-medium">Subscriptions</span>
              <span className="text-xs text-gray-500">Manage subscriptions</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
