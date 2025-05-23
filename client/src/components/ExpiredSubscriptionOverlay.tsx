import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';

interface ExpiredSubscriptionOverlayProps {
  onClose: () => void; // Keeping for future reference but not using it
}

const ExpiredSubscriptionOverlay: React.FC<ExpiredSubscriptionOverlayProps> = ({ onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, store } = useAuth();

  const [requestSent, setRequestSent] = useState(false);

  const handleRequestReactivation = async () => {
    try {
      setIsSubmitting(true);

      // Collect whatever information we have
      const requestData = {
        storeId: store?._id || '',
        storeName: store?.name || '',
        storeNumber: store?.storeNumber || '',
        userName: user?.name || '',
        userEmail: user?.email || ''
      };

      console.log('Sending reactivation request with data:', requestData);

      // Send email to Jonathon
      await api.post('/api/admin/request-reactivation', requestData);

      toast({
        title: 'Request Sent',
        description: 'Your reactivation request has been sent. We will contact you shortly.',
        variant: 'default'
      });

      // Mark as sent but don't close the overlay
      setRequestSent(true);
    } catch (error: any) {
      console.error('Error sending reactivation request:', error);

      // Extract error message if available
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'Failed to send reactivation request';

      toast({
        title: 'Error',
        description: `${errorMessage}. Please try again or contact support directly at Jonathon@ld-growth.com.`,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl border-2 border-red-500">

        <div className="flex flex-col items-center text-center">
          {!requestSent ? (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Expired</h2>

              <p className="text-gray-700 mb-6">
                Your subscription has expired. All features are currently disabled.
                You must request reactivation to restore access to the system.
              </p>

              <p className="text-sm text-red-600 mb-6">
                <strong>Note:</strong> This is the only way to regain access to the system.
                Your request will be sent to the system administrator for approval.
              </p>

              <div className="w-full">
                <Button
                  variant="default"
                  className="w-full bg-[#E51636] hover:bg-[#C41230] font-bold py-3 text-lg"
                  onClick={handleRequestReactivation}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending Request...' : 'Request Reactivation'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent</h2>

              <p className="text-gray-700 mb-6">
                Your reactivation request has been sent to the system administrator.
                We will contact you shortly to restore your access.
              </p>

              <p className="text-sm text-gray-600 mb-6">
                You may close this window, but you will need to wait for your subscription
                to be reactivated before you can use the system again.
              </p>

              <p className="text-sm text-gray-500 mb-6">
                If you don't hear back within 24 hours, please contact support at:
                <br />
                <a href="mailto:jonp4208@gmail.com" className="text-blue-600 hover:underline">
                  jonp4208@gmail.com
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpiredSubscriptionOverlay;
