import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import JarlaLoader from '@/components/JarlaLoader';
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
  const [hasLoaded, setHasLoaded] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  // Mount ALL tabs immediately so they preload
  const currentPath = TAB_PATHS.includes(location.pathname as any) ? location.pathname : '/user';

  // Keep loader visible for a minimum duration to let pages preload
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  const ready = !loading && minTimeElapsed;

  useEffect(() => {
    if (ready && !hasLoaded) {
      setHasLoaded(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFadeIn(true);
        });
      });
    }
  }, [ready, hasLoaded]);

  if (!ready) {
    return <JarlaLoader />;
  }

  if (!isMobile) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center px-8">
        <svg className="h-16 w-16 mb-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12" y2="18" />
        </svg>
        <p className="text-lg font-semibold text-white font-montserrat text-center">This app is mobile only</p>
        <p className="text-sm text-white/50 mt-2 font-jakarta text-center">Open this link on your phone to use the app</p>
      </div>
    );
  }

  return (
    <div
      className="transition-opacity duration-500 ease-out"
      style={{ opacity: fadeIn ? 1 : 0 }}
    >
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
