import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Pencil } from 'lucide-react';
import defaultAvatar from '@/assets/default-avatar.png';

const ProfilePage: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const firstName = profile?.full_name?.split(' ')[0] || 'User';

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
        <div className="flex items-center justify-center px-4 py-3 relative">
          <span className="text-base font-semibold text-black">
            {profile?.username ? `@${profile.username}` : profile?.full_name || 'Profile'}
          </span>
          <button onClick={() => {}} className="absolute right-4 p-2">
            <Settings className="h-6 w-6 text-black" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-5 space-y-4">
        {/* Profile Node */}
        <div
          className="rounded-[32px] p-5 relative"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Edit profile button - top right */}
          <button
            className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.85) 100%)',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Pencil className="h-3.5 w-3.5 text-black/60" />
          </button>

          {/* Centered avatar */}
          <div className="flex flex-col items-center">
            <Avatar className="h-[100px] w-[100px] mb-3">
              <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
              <AvatarFallback className="bg-black/10 text-black text-2xl font-medium">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-base font-bold text-black font-montserrat">{profile?.full_name || 'User'}</h2>
            {profile?.username && (
              <p className="text-sm text-black/50 font-jakarta mt-0.5">@{profile.username}</p>
            )}
            {profile?.bio && (
              <p className="text-sm text-black/70 font-jakarta leading-relaxed mt-2 text-center">{profile.bio}</p>
            )}
            
            {/* Stats - centered */}
            <div className="flex gap-8 mt-4">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-black font-montserrat">0</span>
                <span className="text-xs text-black/50 font-jakarta">Videos made</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-black font-montserrat">0</span>
                <span className="text-xs text-black/50 font-jakarta">Total views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Node - green */}
        <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-[32px] p-5 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
          <h3 className="text-sm font-semibold text-white mb-3 font-montserrat">Earnings</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80 font-jakarta">Total earned</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white font-montserrat">0</span>
                <span className="text-sm text-white/80 font-montserrat">sek</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80 font-jakarta">Pending</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-white font-montserrat">0</span>
                <span className="text-sm text-white/80 font-montserrat">sek</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80 font-jakarta">Paid out</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-white font-montserrat">0</span>
                <span className="text-sm text-white/80 font-montserrat">sek</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10 px-4 pt-2 pb-2 h-20 safe-area-bottom">
        <div className="flex items-start justify-between h-full">
          <button 
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className="h-6 w-6 text-black/40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z" />
            </svg>
            <span className="text-[10px] text-black/40">Home</span>
          </button>
          <button 
            onClick={() => navigate('/discover')}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className="h-6 w-6 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
            </svg>
            <span className="text-[10px] text-black/40">Discover</span>
          </button>
          <button 
            onClick={() => navigate('/activity')}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className="h-6 w-6 text-black/40" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M4 4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4ZM10 8C9.5 7.7 9 8 9 8.5V15.5C9 16 9.5 16.3 10 16L16 12.5C16.5 12.2 16.5 11.8 16 11.5L10 8Z" />
            </svg>
            <span className="text-[10px] text-black/40">Action</span>
          </button>
          <button 
            onClick={() => navigate('/alerts')}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className="h-6 w-6 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="text-[10px] text-black/40">Alerts</span>
          </button>
          <button className="flex flex-col items-center gap-1 pt-1 w-12">
            <Avatar className="h-6 w-6 ring-2 ring-black">
              <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
              <AvatarFallback className="bg-black/10 text-black text-[10px] font-medium">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-semibold text-black">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ProfilePage;
