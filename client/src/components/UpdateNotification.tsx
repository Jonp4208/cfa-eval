import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Listen for service worker update events
    const handleUpdateFound = () => {
      console.log('Update available event received');
      setUpdateAvailable(true);
    };

    // Check if there's already a waiting service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && registration.waiting) {
          setUpdateAvailable(true);
        }
      });
    }

    // Listen for the custom event from our service worker
    window.addEventListener('swUpdateAvailable', handleUpdateFound);

    return () => {
      window.removeEventListener('swUpdateAvailable', handleUpdateFound);
    };
  }, []);

  const handleUpdate = () => {
    // Use the global function we defined to update the service worker
    if (window.updateServiceWorker) {
      window.updateServiceWorker();
    } else {
      // Fallback if the function isn't available
      window.location.reload();
    }
  };

  if (!updateAvailable) return null;

  return (
    <>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/50 z-[9999]" />

      {/* Update notification dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-[10000] pb-20 md:pb-0 ios-header-padding">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-sm w-full mx-4 animate-in fade-in-0 zoom-in-95">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-7 w-7 text-blue-600" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">App Update Available</h2>

            <p className="text-gray-600 mb-6">
              A new version of the app is available. Please update now to get the latest features and improvements.
            </p>

            <Button
              onClick={handleUpdate}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Update Now
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
