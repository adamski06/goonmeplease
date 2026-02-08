import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import defaultAvatar from '@/assets/default-avatar.png';

interface BottomNavProps {
  variant?: 'light' | 'dark';
  onAuthRequired?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ variant = 'light', onAuthRequired }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile();

  const firstName = profile?.full_name?.split(' ')[0] || 'User';
  const currentPath = location.pathname;

  const isDark = variant === 'dark';
  const activeColor = isDark ? 'text-white' : 'text-black';
  const inactiveColor = isDark ? 'text-white/50' : 'text-black/40';

  const isActive = (path: string) => currentPath === path;

  const handleProtectedNav = (path: string) => {
    if (!user && onAuthRequired) {
      onAuthRequired();
    } else {
      navigate(path);
    }
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 px-4 pt-2 pb-2 h-20 safe-area-bottom ${
        isDark ? 'bg-black border-t border-white/10' : 'bg-white border-t border-black/10'
      }`}
    >
      <div className="flex items-start justify-between h-full">
        {/* Home */}
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center gap-1 pt-1 w-12"
        >
          <svg
            className={`h-6 w-6 ${isActive('/') ? activeColor : inactiveColor}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z" />
          </svg>
          <span className={`text-[10px] ${isActive('/') ? `font-semibold ${activeColor}` : inactiveColor}`}>
            Home
          </span>
        </button>

        {/* Discover */}
        <button
          onClick={() => navigate('/discover')}
          className="flex flex-col items-center gap-1 pt-1 w-12"
        >
          <svg
            className={`h-6 w-6 ${isActive('/discover') ? activeColor : inactiveColor}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon
              points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
              fill="currentColor"
              stroke="none"
            />
          </svg>
          <span className={`text-[10px] ${isActive('/discover') ? `font-semibold ${activeColor}` : inactiveColor}`}>
            Discover
          </span>
        </button>

        {/* Action */}
        <button
          onClick={() => handleProtectedNav('/activity')}
          className="flex flex-col items-center gap-1 pt-1 w-12"
        >
          <svg
            className={`h-6 w-6 ${isActive('/activity') ? activeColor : inactiveColor}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4 4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4ZM10 8C9.5 7.7 9 8 9 8.5V15.5C9 16 9.5 16.3 10 16L16 12.5C16.5 12.2 16.5 11.8 16 11.5L10 8Z"
            />
          </svg>
          <span className={`text-[10px] ${isActive('/activity') ? `font-semibold ${activeColor}` : inactiveColor}`}>
            Action
          </span>
        </button>

        {/* Alerts - always outline style, just changes color */}
        <button
          onClick={() => handleProtectedNav('/alerts')}
          className="flex flex-col items-center gap-1 pt-1 w-12"
        >
          <svg
            className={`h-6 w-6 ${isActive('/alerts') ? activeColor : inactiveColor}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className={`text-[10px] ${isActive('/alerts') ? `font-semibold ${activeColor}` : inactiveColor}`}>
            Alerts
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={() => handleProtectedNav('/profile')}
          className="flex flex-col items-center gap-1 pt-1 w-12"
        >
          {user ? (
            <Avatar className={`h-6 w-6 ${isActive('/profile') ? 'ring-2 ring-black' : ''}`}>
              <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
              <AvatarFallback
                className={`text-[10px] font-medium ${
                  isDark ? 'bg-white/20 text-white' : 'bg-black/10 text-black'
                }`}
              >
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User className={`h-6 w-6 ${inactiveColor}`} />
          )}
          <span className={`text-[10px] ${isActive('/profile') ? `font-semibold ${activeColor}` : inactiveColor}`}>
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
