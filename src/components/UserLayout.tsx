import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Campaigns from '@/pages/Campaigns';
import Discover from '@/pages/Discover';
import Activity from '@/pages/Activity';
import Alerts from '@/pages/Alerts';
import Profile from '@/pages/Profile';

const TAB_PATHS = ['/user', '/user/discover', '/user/activity', '/user/alerts', '/user/profile'] as const;

const UserLayout: React.FC = () => {
  const { loading } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Mount ALL tabs immediately so they preload
  const currentPath = TAB_PATHS.includes(location.pathname as any) ? location.pathname : '/user';

  const ready = !loading;

  if (!ready) {
    // Blank screen — Suspense fallback already showed the loader
    return <div className="h-screen w-screen bg-black" />;
  }


  return (
    <div>
      {/* Home */}
      <div style={{ display: currentPath === '/user' ? 'block' : 'none' }}>
        <Campaigns />
      </div>
      {/* Discover */}
      <div style={{ display: currentPath === '/user/discover' ? 'block' : 'none' }}>
        <Discover />
      </div>
      {/* Activity */}
      <div style={{ display: currentPath === '/user/activity' ? 'block' : 'none' }}>
        <Activity />
      </div>
      {/* Alerts */}
      <div style={{ display: currentPath === '/user/alerts' ? 'block' : 'none' }}>
        <Alerts />
      </div>
      {/* Profile */}
      <div style={{ display: currentPath === '/user/profile' ? 'block' : 'none' }}>
        <Profile />
      </div>
    </div>
  );
};

export default UserLayout;
