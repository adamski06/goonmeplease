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

  // Track which tabs have been visited so we only mount them on first visit
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set([location.pathname]));

  const currentPath = TAB_PATHS.includes(location.pathname as any) ? location.pathname : '/user';

  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(currentPath)) return prev;
      const next = new Set(prev);
      next.add(currentPath);
      return next;
    });
  }, [currentPath]);

  useEffect(() => {
    if (!loading && !hasLoaded) {
      setHasLoaded(true);
      // Small delay for fade-in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFadeIn(true);
        });
      });
    }
  }, [loading, hasLoaded]);

  if (loading) {
    return <JarlaLoader />;
  }

  return (
    <div
      className="transition-opacity duration-500 ease-out"
      style={{ opacity: fadeIn ? 1 : 0 }}
    >
      {/* Home */}
      <div style={{ display: currentPath === '/user' ? 'block' : 'none' }}>
        {visitedTabs.has('/user') && <Campaigns />}
      </div>
      {/* Discover */}
      <div style={{ display: currentPath === '/user/discover' ? 'block' : 'none' }}>
        {visitedTabs.has('/user/discover') && <Discover />}
      </div>
      {/* Activity */}
      <div style={{ display: currentPath === '/user/activity' ? 'block' : 'none' }}>
        {visitedTabs.has('/user/activity') && <Activity />}
      </div>
      {/* Alerts */}
      <div style={{ display: currentPath === '/user/alerts' ? 'block' : 'none' }}>
        {visitedTabs.has('/user/alerts') && <Alerts />}
      </div>
      {/* Profile */}
      <div style={{ display: currentPath === '/user/profile' ? 'block' : 'none' }}>
        {visitedTabs.has('/user/profile') && <Profile />}
      </div>
    </div>
  );
};

export default UserLayout;
