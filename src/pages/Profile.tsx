import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Pencil, X } from 'lucide-react';
import ProfileEditContent from '@/components/ProfileEditContent';
import WithdrawContent from '@/components/WithdrawContent';
import BottomNav from '@/components/BottomNav';

const ProfilePage: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  // Earnings expansion state
  const earningsRef = useRef<HTMLDivElement>(null);
  const [earningsExpanded, setEarningsExpanded] = useState(false);
  const [earningsClosing, setEarningsClosing] = useState(false);
  const [earningsReady, setEarningsReady] = useState(false);
  const [earningsStartTop, setEarningsStartTop] = useState(0);
  const [earningsStartBottom, setEarningsStartBottom] = useState(0);

  // Profile expansion state
  const profileRef = useRef<HTMLDivElement>(null);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [profileClosing, setProfileClosing] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [profileStartTop, setProfileStartTop] = useState(0);
  const [profileStartBottom, setProfileStartBottom] = useState(0);
  const [withdrawMode, setWithdrawMode] = useState(false);
  const [withdrawSliding, setWithdrawSliding] = useState(false);
  const [withdrawSlidingBack, setWithdrawSlidingBack] = useState(false);

  const openEarnings = () => {
    if (earningsRef.current) {
      const rect = earningsRef.current.getBoundingClientRect();
      setEarningsStartTop(rect.top);
      setEarningsStartBottom(window.innerHeight - rect.bottom);
    }
    setEarningsExpanded(true);
    setEarningsReady(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setEarningsReady(true);
      });
    });
  };

  const closeEarnings = () => {
    if (!earningsExpanded || earningsClosing) return;
    // Re-capture position for accurate close animation
    if (earningsRef.current) {
      const rect = earningsRef.current.getBoundingClientRect();
      setEarningsStartTop(rect.top);
      setEarningsStartBottom(window.innerHeight - rect.bottom);
    }
    setEarningsReady(false);
    setEarningsClosing(true);
    setTimeout(() => {
      setEarningsExpanded(false);
      setEarningsClosing(false);
      setWithdrawMode(false);
      setWithdrawSliding(false);
      setWithdrawSlidingBack(false);
    }, 520);
  };

  const openProfile = () => {
    if (profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setProfileStartTop(rect.top);
      setProfileStartBottom(window.innerHeight - rect.bottom);
    }
    setProfileExpanded(true);
    setProfileReady(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setProfileReady(true);
      });
    });
  };

  const closeProfile = () => {
    if (!profileExpanded || profileClosing) return;
    // Re-capture position for accurate close animation
    if (profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setProfileStartTop(rect.top);
      setProfileStartBottom(window.innerHeight - rect.bottom);
    }
    setProfileReady(false);
    setProfileClosing(true);
    setTimeout(() => {
      setProfileExpanded(false);
      setProfileClosing(false);
    }, 520);
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/user/auth');
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
          <button onClick={() => navigate('/user/settings')} className="absolute right-4 p-2">
            <Settings className="h-6 w-6 text-black" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-5 space-y-4">
        {/* Profile Node */}
        <div
          ref={profileRef}
          className="rounded-[48px] p-5 relative"
          style={{
            visibility: profileExpanded ? 'hidden' : 'visible',
            background: 'linear-gradient(180deg, rgb(240,240,240) 0%, rgb(230,230,230) 100%)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Edit profile button - top right */}
          <button
            onClick={openProfile}
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
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={firstName} />
              ) : null}
              <AvatarFallback
                className="text-2xl font-medium font-montserrat"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 100%)',
                  color: 'rgba(0,0,0,0.4)',
                }}
              >
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

        {/* Earnings Node - inline placeholder */}
        <div
          ref={earningsRef}
          onClick={() => !earningsExpanded && openEarnings()}
          className="rounded-[48px] overflow-hidden cursor-pointer"
          style={{
            height: '110px',
            visibility: earningsExpanded ? 'hidden' : 'visible',
            background: 'linear-gradient(180deg, rgba(5,150,105,1) 0%, rgba(6,95,70,1) 100%)',
            border: '1px solid rgba(52,211,153,0.4)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)',
          }}
        >
          <div className="p-6">
            <p className="text-sm font-bold text-white font-jakarta mb-1">Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white font-montserrat tracking-tight">4 350</span>
              <span className="text-xl text-white/70 font-montserrat">sek</span>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings expanded overlay - fixed, animates from captured position */}
      {earningsExpanded && (
        <div
          onClick={closeEarnings}
          className="fixed left-3 right-3 z-50 rounded-[48px] overflow-hidden cursor-pointer"
          style={{
            top: earningsReady ? '80px' : `${earningsStartTop}px`,
            bottom: earningsReady ? '88px' : `${earningsStartBottom}px`,
            transition: 'top 0.5s cubic-bezier(0.32, 0.72, 0, 1), bottom 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
            background: 'linear-gradient(180deg, rgba(5,150,105,1) 0%, rgba(6,95,70,1) 100%)',
            border: '1.5px solid rgba(52,211,153,0.4)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.25), 0 12px 40px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.1)',
          }}
        >
          {/* Collapsed content - fades out as node expands */}
          <div
            className="absolute inset-x-0 top-0 p-6 pointer-events-none"
            style={{
              opacity: earningsReady && !earningsClosing ? 0 : 1,
              transition: 'opacity 0.25s ease-out',
            }}
          >
            <p className="text-sm font-bold text-white font-jakarta mb-1">Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white font-montserrat tracking-tight">4 350</span>
              <span className="text-xl text-white/70 font-montserrat">sek</span>
            </div>
          </div>

          {/* Expanded content - fades in */}
          <div
            className="h-full flex flex-col overflow-hidden relative"
            style={{
              opacity: earningsReady && !earningsClosing ? 1 : 0,
              transition: earningsReady ? 'opacity 0.35s ease-out 0.1s' : 'opacity 0.25s ease-out',
            }}
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (withdrawMode) {
                  // Go back from withdraw to balance view
                  setWithdrawSlidingBack(true);
                  setTimeout(() => {
                    setWithdrawMode(false);
                    setWithdrawSlidingBack(false);
                  }, 300);
                } else {
                  closeEarnings();
                }
              }}
              className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <X className="h-4 w-4 text-white" />
            </button>

            {/* Balance view */}
            <div
              className="absolute inset-0 flex flex-col"
              style={{
                transform: !withdrawMode && !withdrawSliding ? 'translateX(0)' : 'translateX(-100%)',
                opacity: !withdrawMode && !withdrawSliding ? 1 : 0,
                transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
                pointerEvents: !withdrawMode ? 'auto' : 'none',
              }}
            >
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col items-center mt-4">
                  <p className="text-sm font-bold text-white/70 font-jakarta mb-2">Your Balance</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold text-white font-montserrat tracking-tight">4 350</span>
                    <span className="text-2xl text-white/60 font-montserrat">sek</span>
                  </div>
                </div>

                <div className="w-full space-y-3 mt-8">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm text-white/60 font-jakarta">Total earned</span>
                    <span className="text-sm font-semibold text-white font-montserrat">4 350 sek</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm text-white/60 font-jakarta">Pending</span>
                    <span className="text-sm font-semibold text-white font-montserrat">850 sek</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm text-white/60 font-jakarta">Withdrawn</span>
                    <span className="text-sm font-semibold text-white font-montserrat">0 sek</span>
                  </div>
                </div>

                <div className="flex-1" />
              </div>

              {/* Fixed withdraw button at bottom - pill shaped */}
              <div className="px-6 py-5 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setWithdrawSliding(true);
                    setTimeout(() => {
                      setWithdrawMode(true);
                      setWithdrawSliding(false);
                    }, 300);
                  }}
                  className="w-full py-4 rounded-full text-base font-bold font-montserrat transition-all active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.9) 100%)',
                    color: '#065f46',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,1)',
                  }}
                >
                  Withdraw
                </button>
              </div>
            </div>

            {/* Withdraw view */}
            <div
              className="absolute inset-0"
              style={{
                transform: withdrawMode && !withdrawSlidingBack ? 'translateX(0)' : 'translateX(100%)',
                opacity: withdrawMode && !withdrawSlidingBack ? 1 : 0,
                transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
                pointerEvents: withdrawMode ? 'auto' : 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <WithdrawContent
                balance={4350}
                onBack={() => {
                  setWithdrawSlidingBack(true);
                  setTimeout(() => {
                    setWithdrawMode(false);
                    setWithdrawSlidingBack(false);
                  }, 300);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Profile expanded overlay - fixed, animates from captured position */}
      {profileExpanded && (
        <div
          className="fixed left-3 right-3 z-50 rounded-[48px] overflow-hidden"
          style={{
            top: profileReady ? '80px' : `${profileStartTop}px`,
            bottom: profileReady ? '88px' : `${profileStartBottom}px`,
            transition: 'top 0.5s cubic-bezier(0.32, 0.72, 0, 1), bottom 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
            background: 'linear-gradient(180deg, rgb(240,240,240) 0%, rgb(230,230,230) 100%)',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.15), 0 12px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          {/* Collapsed content - fades out as node expands */}
          <div
            className="absolute inset-x-0 top-0 p-5 pointer-events-none"
            style={{
              opacity: profileReady && !profileClosing ? 0 : 1,
              transition: 'opacity 0.25s ease-out',
            }}
          >
            <div className="flex flex-col items-center">
              <Avatar className="h-[100px] w-[100px] mb-3">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={firstName} />
                ) : null}
                <AvatarFallback
                  className="text-2xl font-medium font-montserrat"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 100%)',
                    color: 'rgba(0,0,0,0.4)',
                  }}
                >
                  {firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-base font-bold text-black font-montserrat">{profile?.full_name || 'User'}</h2>
            </div>
          </div>

          {/* Expanded content - fades in */}
          <div
            className="h-full flex flex-col overflow-hidden"
            style={{
              opacity: profileReady && !profileClosing ? 1 : 0,
              transition: profileReady ? 'opacity 0.35s ease-out 0.1s' : 'opacity 0.25s ease-out',
            }}
          >
            <ProfileEditContent onSaved={closeProfile} />
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
