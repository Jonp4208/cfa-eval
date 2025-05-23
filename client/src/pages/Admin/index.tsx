import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Building,
  Plus,
  RefreshCw,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Star,
  UserPlus,
  ShieldCheck,
  Mail,
  Copy,
  Eye,
  Edit,
  KeyRound,
  MoreHorizontal,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import adminService, { Store, NewStoreData, StoreUser, NewUserData } from '@/services/adminService';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Store management state
  const [showAddStoreDialog, setShowAddStoreDialog] = useState(false);
  const [newStoreData, setNewStoreData] = useState<NewStoreData>({
    storeNumber: '',
    name: '',
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
    adminEmail: '',
    adminName: '',
    adminPassword: ''
  });

  // User management state
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState<NewUserData>({
    name: '',
    email: '',
    position: 'Team Member',
    departments: ['Front Counter'],
    isAdmin: false,
    generatePassword: true,
    password: ''
  });
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // Email and password reset state
  const [selectedUser, setSelectedUser] = useState<StoreUser | null>(null);
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  // Subscription status dialog state
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const [selectedSubscriptionStore, setSelectedSubscriptionStore] = useState<Store | null>(null)
  const [newSubscriptionStatus, setNewSubscriptionStatus] = useState<'active' | 'expired' | 'trial' | 'none' | ''>('')

  // Check if user is Jonathon Pope
  const isJonathonPope = user?.email === 'jonp4208@gmail.com';

  // Fetch stores
  const { data: stores, isLoading, refetch } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: adminService.getAllStores,
    enabled: isJonathonPope // Only fetch if user is Jonathon Pope
  });

  // Add store mutation
  const addStoreMutation = useMutation({
    mutationFn: adminService.addStore,
    onSuccess: () => {
      toast({
        title: 'Store Added',
        description: 'The store has been added successfully.',
        variant: 'default'
      });
      setShowAddStoreDialog(false);
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      // Reset form
      setNewStoreData({
        storeNumber: '',
        name: '',
        storeAddress: '',
        storePhone: '',
        storeEmail: '',
        adminEmail: '',
        adminName: '',
        adminPassword: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to add store: ${error.response?.data?.message || error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Update store status mutation
  const updateStoreStatusMutation = useMutation({
    mutationFn: ({ storeId, status }: { storeId: string, status: 'active' | 'inactive' }) =>
      adminService.updateStoreStatus(storeId, status),
    onSuccess: () => {
      toast({
        title: 'Store Status Updated',
        description: 'The store status has been updated successfully.',
        variant: 'default'
      });
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update store status: ${error.response?.data?.message || error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Get store users query
  const {
    data: storeUsersData,
    isLoading: isLoadingUsers,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['store-users', selectedStoreId],
    queryFn: () => selectedStoreId ? adminService.getStoreUsers(selectedStoreId) : null,
    enabled: !!selectedStoreId && showUsersDialog
  });

  // Add user to store mutation
  const addUserMutation = useMutation({
    mutationFn: ({ storeId, userData }: { storeId: string, userData: NewUserData }) =>
      adminService.addStoreUser(storeId, userData),
    onSuccess: (data) => {
      toast({
        title: 'User Added',
        description: `${data.user.name} has been added successfully.`,
        variant: 'default'
      });

      // If a password was generated, save it to show to the user
      if (data.generatedPassword) {
        setGeneratedPassword(data.generatedPassword);
      } else {
        setGeneratedPassword(null);
      }

      // Reset form but don't close dialog yet if we need to show the password
      setNewUserData({
        name: '',
        email: '',
        position: 'Team Member',
        departments: ['Front Counter'],
        isAdmin: false,
        generatePassword: true,
        password: ''
      });

      // Refresh the users list
      queryClient.invalidateQueries({ queryKey: ['store-users', selectedStoreId] });

      // Only close dialog if no password was generated
      if (!data.generatedPassword) {
        setShowAddUserDialog(false);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to add user: ${error.response?.data?.message || error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Update user email mutation
  const updateEmailMutation = useMutation({
    mutationFn: ({ storeId, userId, email }: { storeId: string, userId: string, email: string }) =>
      adminService.updateUserEmail(storeId, userId, email),
    onSuccess: (data) => {
      toast({
        title: 'Email Updated',
        description: `${data.user.name}'s email has been updated successfully.`,
        variant: 'default'
      });
      setShowChangeEmailDialog(false);
      setNewEmail('');
      setSelectedUser(null);

      // Refresh the users list
      queryClient.invalidateQueries({ queryKey: ['store-users', selectedStoreId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update email: ${error.response?.data?.message || error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Reset user password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ storeId, userId }: { storeId: string, userId: string }) =>
      adminService.resetUserPassword(storeId, userId),
    onSuccess: (data) => {
      toast({
        title: 'Password Reset',
        description: `${data.user.name}'s password has been reset and emailed successfully.`,
        variant: 'default'
      });
      setShowResetPasswordDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to reset password: ${error.response?.data?.message || error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Update subscription status mutation
  const updateSubscriptionStatusMutation = useMutation({
    mutationFn: ({ storeId, subscriptionStatus }: { storeId: string, subscriptionStatus: 'active' | 'expired' | 'trial' | 'none' }) =>
      adminService.updateStoreSubscriptionStatus(storeId, subscriptionStatus),
    onSuccess: () => {
      toast({
        title: 'Subscription Status Updated',
        description: 'The subscription status has been updated successfully.',
        variant: 'default'
      })
      setShowSubscriptionDialog(false)
      setSelectedSubscriptionStore(null)
      setNewSubscriptionStatus('')
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update subscription status: ${error.response?.data?.message || error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Handle store form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStoreData(prev => ({ ...prev, [name]: value }));
  };

  // Handle store form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStoreMutation.mutate(newStoreData);
  };

  // Handle store status change
  const handleStatusChange = (storeId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (confirm(`Are you sure you want to change this store's status to ${newStatus}?`)) {
      updateStoreStatusMutation.mutate({ storeId, status: newStatus as 'active' | 'inactive' });
    }
  };

  // Handle opening the users dialog
  const handleViewUsers = (storeId: string) => {
    setSelectedStoreId(storeId);
    setShowUsersDialog(true);
  };

  // Handle opening the add user dialog
  const handleAddUserClick = () => {
    setShowAddUserDialog(true);
    setGeneratedPassword(null);
  };

  // Handle user form input changes
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes for user form
  const handleSelectChange = (name: string, value: string) => {
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes for user form
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setNewUserData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle departments selection
  const handleDepartmentChange = (department: string, checked: boolean) => {
    setNewUserData(prev => {
      if (checked) {
        return { ...prev, departments: [...prev.departments, department] };
      } else {
        return { ...prev, departments: prev.departments.filter(d => d !== department) };
      }
    });
  };

  // Handle user form submission
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStoreId) {
      addUserMutation.mutate({
        storeId: selectedStoreId,
        userData: newUserData
      });
    }
  };

  // Handle copying password to clipboard
  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast({
        title: 'Password Copied',
        description: 'The password has been copied to your clipboard.',
        variant: 'default'
      });
    }
  };

  // Close the add user dialog and reset the form
  const handleCloseAddUserDialog = () => {
    setShowAddUserDialog(false);
    setGeneratedPassword(null);
    setNewUserData({
      name: '',
      email: '',
      position: 'Team Member',
      departments: ['Front Counter'],
      isAdmin: false,
      generatePassword: true,
      password: ''
    });
  };

  // Handle opening the change email dialog
  const handleChangeEmail = (user: StoreUser) => {
    setSelectedUser(user);
    setNewEmail(user.email);
    setShowChangeEmailDialog(true);
  };

  // Handle opening the reset password dialog
  const handleResetPassword = (user: StoreUser) => {
    setSelectedUser(user);
    setShowResetPasswordDialog(true);
  };

  // Handle email change submission
  const handleEmailChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && selectedStoreId) {
      updateEmailMutation.mutate({
        storeId: selectedStoreId,
        userId: selectedUser._id,
        email: newEmail
      });
    }
  };

  // Handle password reset confirmation
  const handlePasswordResetConfirm = () => {
    if (selectedUser && selectedStoreId) {
      resetPasswordMutation.mutate({
        storeId: selectedStoreId,
        userId: selectedUser._id
      });
    }
  };

  function handleOpenSubscriptionDialog(store: Store) {
    setSelectedSubscriptionStore(store)
    setNewSubscriptionStatus(store.subscription?.status || 'none')
    setShowSubscriptionDialog(true)
  }

  function handleConfirmSubscriptionStatus() {
    if (selectedSubscriptionStore && newSubscriptionStatus) {
      updateSubscriptionStatusMutation.mutate({
        storeId: selectedSubscriptionStore._id,
        subscriptionStatus: newSubscriptionStatus
      })
    }
  }

  // If user is not Jonathon Pope, show access denied
  if (!isJonathonPope) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
              <p className="mt-2">This page is restricted to authorized personnel only.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4">
          <CardTitle className="text-2xl font-bold">Store Management</CardTitle>
          <div className="flex space-x-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={() => setShowAddStoreDialog(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="sm:inline">Add Store</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading stores...</div>
          ) : stores && stores.length > 0 ? (
            <>
              {/* Desktop view - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-2">Store #</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Address</th>
                      <th className="text-center p-2">Users</th>
                      <th className="text-center p-2">Created</th>
                      <th className="text-center p-2">Subscription</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store: Store) => (
                      <tr key={store._id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{store.storeNumber}</td>
                        <td className="p-2">{store.name}</td>
                        <td className="p-2">{store.storeAddress}</td>
                        <td className="p-2 text-center">{store.userCount || 0}</td>
                        <td className="p-2 text-center">
                          {store.createdAt ? format(new Date(store.createdAt), 'MMM d, yyyy') : 'N/A'}
                        </td>
                        <td className="p-2 text-center">
                          {store.subscription ? (
                            <Badge
                              variant={
                                store.subscription.status === 'active' ? 'default' :
                                store.subscription.status === 'trial' ? 'secondary' :
                                'outline'
                              }
                              className="cursor-pointer"
                              onClick={() => handleOpenSubscriptionDialog(store)}
                            >
                              {store.subscription.status}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="cursor-pointer" onClick={() => handleOpenSubscriptionDialog(store)}>none</Badge>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <Badge
                            variant={store.status === 'active' ? 'success' : 'destructive'}
                            className="cursor-pointer"
                            onClick={() => handleStatusChange(store._id, store.status || 'active')}
                          >
                            {store.status || 'active'}
                          </Badge>
                        </td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Users"
                              onClick={() => handleViewUsers(store._id)}
                            >
                              <Users className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Manage Subscription"
                              onClick={() => navigate(`/admin/stores/${store._id}/subscription`)}
                            >
                              <CreditCard className="h-4 w-4 text-purple-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={store.status === 'inactive' ? 'Activate Store' : 'Deactivate Store'}
                              onClick={() => handleStatusChange(store._id, store.status || 'active')}
                            >
                              {store.status === 'inactive' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile view - Cards */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {stores.map((store: Store) => (
                  <div key={store._id} className="bg-card border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{store.name}</h3>
                        <p className="text-sm text-muted-foreground">#{store.storeNumber}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View Users"
                          onClick={() => handleViewUsers(store._id)}
                        >
                          <Users className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Manage Subscription"
                          onClick={() => navigate(`/admin/stores/${store._id}/subscription`)}
                        >
                          <CreditCard className="h-4 w-4 text-purple-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={store.status === 'inactive' ? 'Activate Store' : 'Deactivate Store'}
                          onClick={() => handleStatusChange(store._id, store.status || 'active')}
                        >
                          {store.status === 'inactive' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm mb-2">
                      <p className="text-muted-foreground">{store.storeAddress}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Users:</span> {store.userCount || 0}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span> {store.createdAt ? format(new Date(store.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-muted-foreground mr-2">Subscription:</span>
                        {store.subscription ? (
                          <Badge
                            variant={
                              store.subscription.status === 'active' ? 'default' :
                              store.subscription.status === 'trial' ? 'secondary' :
                              'outline'
                            }
                            className="cursor-pointer"
                            onClick={() => handleOpenSubscriptionDialog(store)}
                          >
                            {store.subscription.status}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="cursor-pointer" onClick={() => handleOpenSubscriptionDialog(store)}>none</Badge>
                        )}
                      </div>
                      <div>
                        <Badge
                          variant={store.status === 'active' ? 'success' : 'destructive'}
                          className="cursor-pointer"
                          onClick={() => handleStatusChange(store._id, store.status || 'active')}
                        >
                          {store.status || 'active'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No stores found. Add your first store to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Store Dialog */}
      <Dialog open={showAddStoreDialog} onOpenChange={setShowAddStoreDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Store</DialogTitle>
            <DialogDescription>
              Enter the details for the new store and its admin user.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeNumber">Store Number *</Label>
                  <Input
                    id="storeNumber"
                    name="storeNumber"
                    value={newStoreData.storeNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Store Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newStoreData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address *</Label>
                <Input
                  id="storeAddress"
                  name="storeAddress"
                  value={newStoreData.storeAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Store Phone</Label>
                  <Input
                    id="storePhone"
                    name="storePhone"
                    value={newStoreData.storePhone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    name="storeEmail"
                    type="email"
                    value={newStoreData.storeEmail}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Name *</Label>
                <Input
                  id="adminName"
                  name="adminName"
                  value={newStoreData.adminName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <Input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  value={newStoreData.adminEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Admin Password *</Label>
                <Input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  value={newStoreData.adminPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddStoreDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addStoreMutation.isPending}>
                {addStoreMutation.isPending ? 'Adding...' : 'Add Store'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Store Users Dialog */}
      <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {storeUsersData?.store.name} (#{storeUsersData?.store.storeNumber}) Users
            </DialogTitle>
            <DialogDescription>
              Manage users and admins for this store.
            </DialogDescription>
          </DialogHeader>

          {isLoadingUsers ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <Tabs defaultValue="admins" className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admins">
                  Admins ({storeUsersData?.admins.length || 0})
                </TabsTrigger>
                <TabsTrigger value="users">
                  Users ({storeUsersData?.users.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admins" className="mt-4">
                {storeUsersData?.admins && storeUsersData.admins.length > 0 ? (
                  <>
                    {/* Desktop view for admins */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Position</th>
                            <th className="text-center p-2">Status</th>
                            <th className="text-right p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {storeUsersData.admins.map((admin) => (
                            <tr key={admin._id} className="border-b hover:bg-muted/50">
                              <td className="p-2">{admin.name}</td>
                              <td className="p-2">{admin.email}</td>
                              <td className="p-2">{admin.position}</td>
                              <td className="p-2 text-center">
                                <Badge
                                  variant={admin.status === 'active' ? 'success' : 'destructive'}
                                >
                                  {admin.status}
                                </Badge>
                              </td>
                              <td className="p-2 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleChangeEmail(admin)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Change Email
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleResetPassword(admin)}>
                                      <KeyRound className="h-4 w-4 mr-2" />
                                      Reset Password
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile view for admins */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                      {storeUsersData.admins.map((admin) => (
                        <div key={admin._id} className="bg-card border rounded-lg p-3 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{admin.name}</h3>
                              <p className="text-sm text-muted-foreground">{admin.email}</p>
                              <p className="text-sm mt-1">{admin.position}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge
                                variant={admin.status === 'active' ? 'success' : 'destructive'}
                              >
                                {admin.status}
                              </Badge>
                              <div className="flex gap-1 mt-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleChangeEmail(admin)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleResetPassword(admin)}
                                >
                                  <KeyRound className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No admins found for this store.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="users" className="mt-4">
                {storeUsersData?.users && storeUsersData.users.length > 0 ? (
                  <>
                    {/* Desktop view for users */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Position</th>
                            <th className="text-left p-2">Departments</th>
                            <th className="text-center p-2">Status</th>
                            <th className="text-right p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {storeUsersData.users.map((user) => (
                            <tr key={user._id} className="border-b hover:bg-muted/50">
                              <td className="p-2">{user.name}</td>
                              <td className="p-2">{user.email}</td>
                              <td className="p-2">{user.position}</td>
                              <td className="p-2">{user.departments.join(', ')}</td>
                              <td className="p-2 text-center">
                                <Badge
                                  variant={user.status === 'active' ? 'success' : 'destructive'}
                                >
                                  {user.status}
                                </Badge>
                              </td>
                              <td className="p-2 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleChangeEmail(user)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Change Email
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                      <KeyRound className="h-4 w-4 mr-2" />
                                      Reset Password
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile view for users */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                      {storeUsersData.users.map((user) => (
                        <div key={user._id} className="bg-card border rounded-lg p-3 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{user.name}</h3>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <p className="text-sm mt-1">{user.position}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge
                                variant={user.status === 'active' ? 'success' : 'destructive'}
                              >
                                {user.status}
                              </Badge>
                              <div className="flex gap-1 mt-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleChangeEmail(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleResetPassword(user)}
                                >
                                  <KeyRound className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Departments:</span> {user.departments.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No users found for this store.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowUsersDialog(false)}
            >
              Close
            </Button>
            <Button
              onClick={handleAddUserClick}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={handleCloseAddUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {generatedPassword ? 'User Added Successfully' : 'Add New User'}
            </DialogTitle>
            <DialogDescription>
              {generatedPassword
                ? 'Please save this password. It will not be shown again.'
                : `Add a new user to ${storeUsersData?.store.name}.`}
            </DialogDescription>
          </DialogHeader>

          {generatedPassword ? (
            <div className="py-4">
              <div className="mb-4">
                <Label>Generated Password</Label>
                <div className="flex mt-1">
                  <Input
                    value={generatedPassword}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    className="ml-2"
                    onClick={handleCopyPassword}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Make sure to save this password or share it with the user. It cannot be retrieved later.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseAddUserDialog}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleAddUserSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newUserData.name}
                      onChange={handleUserInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newUserData.email}
                      onChange={handleUserInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select
                    value={newUserData.position}
                    onValueChange={(value) => handleSelectChange('position', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Team Member">Team Member</SelectItem>
                      <SelectItem value="Trainer">Trainer</SelectItem>
                      <SelectItem value="Leader">Leader</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Departments *</Label>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dept-front-counter"
                        checked={newUserData.departments.includes('Front Counter')}
                        onCheckedChange={(checked) =>
                          handleDepartmentChange('Front Counter', checked as boolean)
                        }
                      />
                      <Label htmlFor="dept-front-counter" className="cursor-pointer">Front Counter</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dept-drive-thru"
                        checked={newUserData.departments.includes('Drive Thru')}
                        onCheckedChange={(checked) =>
                          handleDepartmentChange('Drive Thru', checked as boolean)
                        }
                      />
                      <Label htmlFor="dept-drive-thru" className="cursor-pointer">Drive Thru</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dept-kitchen"
                        checked={newUserData.departments.includes('Kitchen')}
                        onCheckedChange={(checked) =>
                          handleDepartmentChange('Kitchen', checked as boolean)
                        }
                      />
                      <Label htmlFor="dept-kitchen" className="cursor-pointer">Kitchen</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dept-everything"
                        checked={newUserData.departments.includes('Everything')}
                        onCheckedChange={(checked) =>
                          handleDepartmentChange('Everything', checked as boolean)
                        }
                      />
                      <Label htmlFor="dept-everything" className="cursor-pointer">Everything</Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAdmin"
                    checked={newUserData.isAdmin}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('isAdmin', checked as boolean)
                    }
                  />
                  <Label htmlFor="isAdmin" className="cursor-pointer">Make this user an admin</Label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="generatePassword"
                        checked={newUserData.generatePassword}
                        onCheckedChange={(checked) => {
                          handleCheckboxChange('generatePassword', checked as boolean);
                          if (checked) {
                            setNewUserData(prev => ({ ...prev, password: '' }));
                          }
                        }}
                      />
                      <Label htmlFor="generatePassword" className="text-sm cursor-pointer">Generate password</Label>
                    </div>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newUserData.password}
                    onChange={handleUserInputChange}
                    disabled={newUserData.generatePassword}
                    required={!newUserData.generatePassword}
                  />
                  {newUserData.generatePassword && (
                    <p className="text-xs text-muted-foreground">
                      A secure password will be generated automatically.
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseAddUserDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addUserMutation.isPending}>
                  {addUserMutation.isPending ? 'Adding...' : 'Add User'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog open={showChangeEmailDialog} onOpenChange={setShowChangeEmailDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
            <DialogDescription>
              Update the email address for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailChangeSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">New Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowChangeEmailDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateEmailMutation.isPending}>
                {updateEmailMutation.isPending ? 'Updating...' : 'Update Email'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Alert Dialog */}
      <AlertDialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a new password for {selectedUser?.name} and send it to their email address ({selectedUser?.email}).
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePasswordResetConfirm}
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subscription Status Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Subscription Status</DialogTitle>
            <DialogDescription>
              Select the new subscription status for {selectedSubscriptionStore?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmSubscriptionStatus}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newSubscriptionStatus">New Subscription Status</Label>
                <Select
                  value={newSubscriptionStatus}
                  onValueChange={(value) => setNewSubscriptionStatus(value as 'active' | 'expired' | 'trial' | 'none' | '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subscription status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateSubscriptionStatusMutation.isPending}>
                {updateSubscriptionStatusMutation.isPending ? 'Updating...' : 'Update Subscription Status'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
