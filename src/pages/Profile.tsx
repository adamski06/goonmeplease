import React, { useEffect, useState, useRef } from 'react';
import JarlaLoader from '@/components/JarlaLoader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Pencil, X, Clock } from 'lucide-react';
import ProfileEditContent from '@/components/ProfileEditContent';
import WithdrawContent from '@/components/WithdrawContent';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';

const ProfilePage: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice, label, convert } = useCurrency();

  // Creator stats
  const [totalVideos, setTotalVideos] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [balance, setBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [nextPayoutDate, setNextPayoutDate] = useState<string | null>(null);

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

  // Auto-open profile edit if navigated with ?edit=true
  useEffect(() => {
    if (searchParams.get('edit') === 'true' && !profileExpanded && !loading && user) {
      openProfile();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, loading, user]);

  // Fetch real creator stats from submissions + balance
  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data } = await supabase
        .from('content_submissions')
        .select('current_views')
        .eq('creator_id', user.id);
      if (data) {
        setTotalVideos(data.length);
        setTotalViews(data.reduce((sum, s) => sum + (s.current_views || 0), 0));
      }

      // Fetch next payout date from approved submissions
      const { data: pendingSubs } = await supabase
        .from('content_submissions')
        .select('payout_available_at')
        .eq('creator_id', user.id)
        .eq('status', 'approved')
        .not('payout_available_at', 'is', null)
        .order('payout_available_at', { ascending: true })
        .limit(1);
      if (pendingSubs && pendingSubs.length > 0 && (pendingSubs[0] as any).payout_available_at) {
        setNextPayoutDate((pendingSubs[0] as any).payout_available_at);
      }

      // Fetch earnings - only count earnings from approved/paid submissions
      // Submissions under review should NOT count toward balance or earnings
      const { data: approvedSubs } = await supabase
        .from('content_submissions')
        .select('id')
        .eq('creator_id', user.id)
        .in('status', ['approved', 'paid']);

      const approvedSubIds = (approvedSubs || []).map(s => s.id);

      if (approvedSubIds.length > 0) {
        const { data: allEarnings } = await supabase
          .from('earnings')
          .select('amount, is_paid')
          .eq('creator_id', user.id)
          .in('submission_id', approvedSubIds);
        
        if (allEarnings) {
          const total = allEarnings.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
          const paidOut = allEarnings.filter(e => e.is_paid).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
          const unclaimed = total - paidOut;
          setTotalEarnings(total);
          setBalance(0);
          setPendingBalance(unclaimed);
        }
      } else {
        setTotalEarnings(0);
        setBalance(0);
        setPendingBalance(0);
      }
    };
    fetchStats();
  }, [user]);

  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  // Loading handled by UserLayout

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
                <span className="text-lg font-bold text-black font-montserrat">{totalVideos}</span>
                <span className="text-xs text-black/50 font-jakarta">Videos made</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-black font-montserrat">{totalViews.toLocaleString()}</span>
                <span className="text-xs text-black/50 font-jakarta">Total views</span>
              </div>
            </div>
          </div>
        </div>

      </div>


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
