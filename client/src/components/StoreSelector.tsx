import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import adminService from '@/services/adminService';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building } from 'lucide-react';

export default function StoreSelector() {
  const { user, switchStore } = useAuth();
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  // Only fetch stores if the user is Jonathon Pope
  const isJonathonPope = user?.email === 'jonp4208@gmail.com';

  const { data: stores, isLoading } = useQuery({
    queryKey: ['admin-stores-selector'],
    queryFn: adminService.getAllStores,
    enabled: isJonathonPope // Only fetch if user is Jonathon Pope
  });

  // Set the initial selected store
  useEffect(() => {
    if (user?.store?._id) {
      setSelectedStoreId(user.store._id);
    }
  }, [user]);

  // Handle store change
  const handleStoreChange = async (storeId: string) => {
    if (storeId === selectedStoreId) return;

    try {
      // Show loading toast
      const loadingToast = toast({
        title: 'Switching Store...',
        description: 'Please wait while we update your store',
      });

      // Switch store
      await switchStore(storeId);

      // Show success toast with auto-refresh message
      toast({
        title: 'Store Changed',
        description: 'Successfully switched store. Refreshing page...',
      });

      // Give the toast a moment to display before refreshing
      setTimeout(() => {
        // Refresh the page to ensure all data is updated
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to switch store:', error);
      toast({
        title: 'Error',
        description: 'Failed to switch store. Please try again.',
        variant: 'destructive',
      });
      // Reset to the current store
      setSelectedStoreId(user?.store?._id || '');
    }
  };

  // Only render for Jonathon Pope
  if (!isJonathonPope || !stores || stores.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <Building className="h-4 w-4 text-gray-500" />
      <Select
        value={selectedStoreId}
        onValueChange={handleStoreChange}
        disabled={isLoading}
      >
        <SelectTrigger className="h-8 w-full border-none bg-transparent hover:bg-gray-100 focus:ring-0 focus:ring-offset-0 focus:outline-none">
          <SelectValue placeholder="Select store" />
        </SelectTrigger>
        <SelectContent>
          {stores.map((store) => (
            <SelectItem key={store._id} value={store._id}>
              {store.name} (#{store.storeNumber})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
