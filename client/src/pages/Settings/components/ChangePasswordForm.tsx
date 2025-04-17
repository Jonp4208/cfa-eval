import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/axios';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setNotification({
        type: 'error',
        message: 'New passwords do not match'
      });
      return;
    }

    if (newPassword.length < 8) {
      setNotification({
        type: 'error',
        message: 'Password must be at least 8 characters long'
      });
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setNotification({
        type: 'success',
        message: 'Password changed successfully'
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to change password'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div className={cn(
            "flex items-center gap-2 p-4 rounded-lg shadow-lg min-w-[320px]",
            notification.type === 'success' ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
          )}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <p className="flex-1 text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="sr-only" aria-live="polite">
              {notification?.message}
            </div>
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium">Current Password</label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]"
                placeholder="Enter current password"
                aria-describedby="current-password-desc"
              />
              <div id="current-password-desc" className="sr-only">Enter your current password to verify your identity</div>
            </div>

            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]"
                placeholder="Enter new password"
                minLength={8}
                aria-describedby="new-password-desc"
              />
              <div id="new-password-desc" className="text-xs text-gray-500">Password must be at least 8 characters long</div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">Confirm New Password</label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]"
                placeholder="Confirm new password"
                minLength={8}
                aria-describedby="confirm-password-desc"
              />
              <div id="confirm-password-desc" className="text-xs text-gray-500">Re-enter your new password to confirm</div>
            </div>

            <Button
              type="submit"
              variant="red"
              disabled={isLoading}
              className="focus:ring-2 focus:ring-[#E51636] focus:ring-offset-2"
              aria-busy={isLoading}
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}