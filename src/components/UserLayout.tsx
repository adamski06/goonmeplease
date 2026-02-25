import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import JarlaLoader from '@/components/JarlaLoader';
import Campaigns from '@/pages/Campaigns';
import Discover from '@/pages/Discover';
import Activity from '@/pages/Activity';
import Alerts from '@/pages/Alerts';
import Profile from '@/pages/Profile';

const TAB_PATHS = ['/user', '/user/discover', '/user/activity', '/user/alerts', '/user/profile'] as const;

const UserLayout: React.FC = () => {
  const { loading } = useAuth();
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
