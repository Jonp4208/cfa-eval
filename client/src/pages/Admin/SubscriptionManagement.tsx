import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  RefreshCw,
  Save,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';
import adminService, { SubscriptionFeatures, StoreSubscription } from '@/services/adminService';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';

export default function SubscriptionManagementPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // State for UI
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [applyImmediately, setApplyImmediately] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'expired' | 'trial' | 'none'>('active');

  // Check if user is Jonathon Pope
  const isJonathonPope = user?.email === 'jonp4208@gmail.com';

  // Fetch subscription data
  const {
    data,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['store-subscription', storeId],
    queryFn: () => storeId ? adminService.getStoreSubscription(storeId) : null,
    enabled: !!storeId && isJonathonPope
  });

  // Local state for features
  const [features, setFeatures] = useState<SubscriptionFeatures | null>(null);

  // Initialize features from data when it loads
  React.useEffect(() => {
    if (data?.subscription?.features) {
      setFeatures(data.subscription.features);
    }
  }, [data]);

  // Update subscription features mutation
  const updateFeaturesMutation = useMutation({
    mutationFn: ({ features, applyImmediately }: { features: SubscriptionFeatures, applyImmediately: boolean }) =>
      adminService.updateStoreSubscriptionFeatures(storeId!, features, applyImmediately),
    onSuccess: () => {
      toast({
        title: 'Subscription Updated',
        description: applyImmediately
          ? 'The subscription features have been updated immediately.'
          : 'The subscription changes will take effect at the next billing date.',
        variant: 'default'
      });
      setConfirmDialogOpen(false);
      setSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ['store-subscription', storeId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update subscription: ${error.response?.data?.message || error.message}`,
        variant: 'destructive'
      });
      setSubmitting(false);
    }
  });

  // Update subscription status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: 'active' | 'expired' | 'trial' | 'none') =>
      adminService.updateStoreSubscriptionStatus(storeId!, status),
    onSuccess: () => {
      toast({
        title: 'Subscription Status Updated',
        description: `The subscription status has been updated to ${selectedStatus}.`,
        variant: 'default'
      });
      setStatusDialogOpen(false);
      setSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ['store-subscription', storeId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update subscription status: ${error.response?.data?.message || error.message}`,
        variant: 'destructive'
      });
      setSubmitting(false);
    }
  });

  // Handle feature toggle
  const handleToggleFeature = (feature: keyof SubscriptionFeatures, enabled: boolean) => {
    if (!features) return;

    // Log the current state and the change being made
    console.log(`Toggling ${feature} to ${enabled}`);
    console.log('Current features:', features);

    setFeatures(prev => {
      if (!prev) return null;

      // Create a new object with all existing features and the updated one
      const updatedFeatures = {
        ...prev,
        [feature]: enabled
      };

      console.log('Updated features:', updatedFeatures);
      return updatedFeatures;
    });
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Handle submit changes
  const handleSubmitChanges = () => {
    setConfirmDialogOpen(true);
  };

  // Handle confirm changes
  const handleConfirmChanges = async () => {
    if (!features || !storeId) return;

    // Ensure all features are included in the object
    const completeFeatures: SubscriptionFeatures = {
      fohTasks: features.fohTasks ?? true,
      setups: features.setups ?? true,
      kitchen: features.kitchen ?? true,
      documentation: features.documentation ?? true,
      training: features.training ?? true,
      evaluations: features.evaluations ?? true,
      leadership: features.leadership ?? true,
      leadershipPlans: features.leadershipPlans ?? true
    };

    setSubmitting(true);
    updateFeaturesMutation.mutate({ features: completeFeatures, applyImmediately });
  };

  // Handle status change
  const handleStatusChange = () => {
    if (data) {
      setSelectedStatus(data.subscription.subscriptionStatus);
      setStatusDialogOpen(true);
    }
  };

  // Handle confirm status change
  const handleConfirmStatusChange = async () => {
    if (!storeId) return;

    setSubmitting(true);
    updateStatusMutation.mutate(selectedStatus);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Define the subscription sections
  const subscriptionSections = [
    { key: 'fohTasks', label: 'FOH Tasks', description: 'Front of house task management and checklists' },
    { key: 'setups', label: 'Setup Sheet', description: 'Setup sheet templates and management' },
    { key: 'kitchen', label: 'Kitchen', description: 'Kitchen management, waste tracking, and checklists' },
    { key: 'documentation', label: 'Documentation', description: 'Employee documentation and records' },
    { key: 'training', label: 'Training', description: 'Employee training plans and progress tracking' },
    { key: 'evaluations', label: 'Evaluations', description: 'Employee evaluations and performance reviews' },
    { key: 'leadership', label: 'Leadership', description: 'Leadership development plans and tracking' }
  ];

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

  // If no storeId, show error
  if (!storeId) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600">Error</h2>
              <p className="mt-2">No store ID provided.</p>
              <Button
                className="mt-4"
                onClick={() => navigate('/admin/stores')}
              >
                Back to Stores
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/stores')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stores
        </Button>
        <h1 className="text-2xl font-bold">
          {data?.store?.name ? `${data.store.name} Subscription` : 'Store Subscription'}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
          className="ml-auto"
        >
          {refreshing || isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ) : data ? (
        <div className="space-y-6">
          {/* Subscription Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>
                Current subscription status and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {data.subscription.subscriptionStatus === 'active' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {data.subscription.subscriptionStatus === 'trial' && (
                      <Clock className="h-5 w-5 text-blue-500" />
                    )}
                    {data.subscription.subscriptionStatus === 'expired' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    {data.subscription.subscriptionStatus === 'none' && (
                      <AlertCircle className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="font-medium capitalize">{data.subscription.subscriptionStatus} Subscription</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStatusChange}
                  >
                    Change Status
                  </Button>
                </div>

                {data.subscription.currentPeriod && (
                  <div className="text-sm text-gray-500">
                    <p>Current period: {formatDate(data.subscription.currentPeriod.startDate)} - {formatDate(data.subscription.currentPeriod.endDate)}</p>
                  </div>
                )}

                {data.subscription.subscriptionStatus === 'expired' && (
                  <div className="mt-2 bg-red-50 border border-red-200 p-3 rounded-md">
                    <div className="flex items-center text-red-700 mb-1">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="font-medium">Expired Subscription</span>
                    </div>
                    <p className="text-sm text-red-700">
                      This store's subscription has expired. All features are currently disabled.
                      Change the status to "Active" to restore access.
                    </p>
                  </div>
                )}

                {data.subscription.subscriptionStatus === 'none' && (
                  <div className="mt-2 bg-gray-50 border border-gray-200 p-3 rounded-md">
                    <div className="flex items-center text-gray-700 mb-1">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="font-medium">No Subscription</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      This store has no active subscription. All features are currently disabled.
                      Change the status to "Active" to enable access.
                    </p>
                  </div>
                )}

                {data.subscription.pendingChanges && data.subscription.pendingChanges.hasChanges && (
                  <div className="mt-2 bg-amber-50 border border-amber-200 p-3 rounded-md">
                    <div className="flex items-center text-amber-700 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">Pending Changes</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      This store has subscription changes that will take effect on {formatDate(data.subscription.pendingChanges.effectiveDate)}.
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-md mt-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Current Monthly Cost</h3>
                      <p className="text-sm text-gray-500">Based on enabled sections</p>
                    </div>
                    <div className="text-xl font-bold">{formatCurrency(data.calculatedCost)}</div>
                  </div>

                  {data.pendingCost !== undefined && data.pendingCost !== data.calculatedCost && (
                    <div className="flex justify-between items-center mt-2 text-amber-700">
                      <div>
                        <h3 className="font-medium">Future Monthly Cost</h3>
                        <p className="text-sm">Effective {formatDate(data.subscription.pendingChanges?.effectiveDate || '')}</p>
                      </div>
                      <div className="text-lg font-bold">{formatCurrency(data.pendingCost)}</div>
                    </div>
                  )}

                  <div className="mt-2 text-sm text-gray-500">
                    <p>Each section: {formatCurrency(data.subscription.pricing?.sectionPrice || 50)} | Maximum: {formatCurrency(data.subscription.pricing?.maxPrice || 200)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Sections</CardTitle>
              <CardDescription>
                Enable or disable sections for this store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptionSections.map((section) => (
                  <div
                    key={section.key}
                    className="flex justify-between items-center p-3 bg-white border rounded-md"
                  >
                    <div>
                      <p className="font-medium">{section.label}</p>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                    <div className="flex items-center">
                      <Switch
                        id={`toggle-${section.key}`}
                        checked={features?.[section.key as keyof SubscriptionFeatures] || false}
                        onCheckedChange={(checked) => handleToggleFeature(section.key as keyof SubscriptionFeatures, checked)}
                        disabled={isLoading}
                        className="data-[state=checked]:bg-[#E51636]"
                      />
                      <Label htmlFor={`toggle-${section.key}`} className="ml-2">
                        {features?.[section.key as keyof SubscriptionFeatures] ? 'Enabled' : 'Disabled'}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center">
                <Switch
                  id="apply-immediately"
                  checked={applyImmediately}
                  onCheckedChange={setApplyImmediately}
                  className="data-[state=checked]:bg-[#E51636]"
                />
                <Label htmlFor="apply-immediately" className="ml-2">
                  Apply changes immediately
                </Label>
              </div>
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium">
                    Total: {formatCurrency(data.calculatedCost)}/month
                  </span>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSubmitChanges}
                  disabled={isLoading}
                  className="whitespace-nowrap"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Confirmation Dialog */}
          <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Subscription Changes</DialogTitle>
                <DialogDescription>
                  {applyImmediately
                    ? "These changes will be applied immediately."
                    : "These changes will take effect at the end of the current billing period."}

                  {data.subscription.currentPeriod && !applyImmediately && (
                    <span className="block mt-2 font-medium">
                      Effective date: {formatDate(data.subscription.currentPeriod.endDate)}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <h3 className="font-medium mb-2">Changes Summary:</h3>
                <ul className="space-y-1 text-sm">
                  {subscriptionSections.map(section => {
                    const currentValue = features?.[section.key as keyof SubscriptionFeatures] || false;
                    const originalValue = data.subscription.features[section.key as keyof SubscriptionFeatures];

                    // Only show if there's a change from the original state
                    if (currentValue !== originalValue) {
                      return (
                        <li key={section.key} className="flex items-center">
                          <span className={currentValue ? 'text-green-600' : 'text-red-600'}>
                            {section.label}: {currentValue ? 'Enabled' : 'Disabled'}
                          </span>
                        </li>
                      );
                    }
                    return null;
                  }).filter(Boolean)}
                </ul>

                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">New Monthly Cost:</span>
                    <span className="font-bold">{formatCurrency(data.calculatedCost)}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmChanges}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Confirm Changes'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Status Change Dialog */}
          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Subscription Status</DialogTitle>
                <DialogDescription>
                  Select the new subscription status for this store.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="subscription-status">Subscription Status</Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={(value: 'active' | 'expired' | 'trial' | 'none') => setSelectedStatus(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md mt-2">
                    <h3 className="text-sm font-medium mb-1">Status Descriptions:</h3>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li><strong>Active:</strong> Full paid subscription with access to all enabled features</li>
                      <li><strong>Trial:</strong> Temporary access to all features for evaluation</li>
                      <li><strong>Expired:</strong> Subscription has ended but data is preserved</li>
                      <li><strong>None:</strong> No subscription, limited or no access to features</li>
                    </ul>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmStatusChange}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600">Error</h2>
              <p className="mt-2">Failed to load subscription data.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
