import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';

const Alerts: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/user/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-black/40">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header with safe area */}
      <div className="flex flex-col border-b border-black/10 safe-area-top">
        <div className="flex items-center justify-center px-4 py-3">
          <span className="text-base font-semibold text-black">Alerts</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <p className="text-black/40">No alerts yet</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Alerts;
