import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import PageHeader from '@/components/PageHeader';
import { MessageSquare, LayoutDashboard } from 'lucide-react';

export default function TeamSurveys() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { hasActiveSubscription, subscriptionStatus, loading, refreshSubscription } = useSubscription();

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const handleNavigate = (path: string) => {
    navigate(`/team-surveys/${path}`);
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Team Experience Surveys"
          subtitle={`CFA #${user?.store?.storeNumber} - Anonymous Team Feedback`}
          icon={<MessageSquare className="h-5 w-5" />}
          actions={
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full md:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Back Home</span>
            </button>
          }
        />

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
