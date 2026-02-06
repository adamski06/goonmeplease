import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bookmark, Plus, User } from 'lucide-react';
import tiktokIcon from '@/assets/tiktok-icon.png';
import tiktokPlatformLogo from '@/assets/platforms/tiktok.png';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import defaultAvatar from '@/assets/default-avatar.png';
import { campaigns, Campaign } from '@/data/campaigns';

const Discover: React.FC = () => {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isClosingDetail, setIsClosingDetail] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showPicture, setShowPicture] = useState(false);
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const savedScrollPosition = useRef<number>(0);

  const handleSelectCampaign = (campaign: Campaign) => {
    if (featuredScrollRef.current) {
      savedScrollPosition.current = featuredScrollRef.current.scrollTop;
    }
    setShowPicture(false);
    setSelectedCampaign(campaign);
  };

  const handleBackFromDetail = () => {
    if (isClosingDetail) return;
    setIsClosingDetail(true);
    setTimeout(() => {
      setSelectedCampaign(null);
      setIsClosingDetail(false);
      setShowPicture(false);
      requestAnimationFrame(() => {
        if (featuredScrollRef.current) {
          featuredScrollRef.current.scrollTop = savedScrollPosition.current;
        }
      });
    }, 400);
  };

  // Fetch user favorites
  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        const { data } = await supabase
          .from('favorites')
          .select('campaign_id')
          .eq('user_id', user.id);
        if (data) {
          setFavorites(data.map(f => f.campaign_id));
        }
      };
      fetchFavorites();
    }
  }, [user]);

  const toggleFavorite = async (campaignId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    
    if (favorites.includes(campaignId)) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('campaign_id', campaignId);
      setFavorites(favorites.filter(id => id !== campaignId));
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, campaign_id: campaignId });
      setFavorites([...favorites, campaignId]);
    }
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* White background */}
      <div className="absolute inset-0 bg-white" />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pt-2 pb-2 h-20 safe-area-bottom bg-white border-t border-black/10">
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
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className="h-6 w-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
            </svg>
            <span className="text-[10px] font-semibold text-black">Discover</span>
          </button>
          <button 
            onClick={() => user ? navigate('/activity') : setShowAuthPrompt(true)}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className="h-6 w-6 text-black/40" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M4 4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4ZM10 8C9.5 7.7 9 8 9 8.5V15.5C9 16 9.5 16.3 10 16L16 12.5C16.5 12.2 16.5 11.8 16 11.5L10 8Z" />
            </svg>
            <span className="text-[10px] text-black/40">Action</span>
          </button>
          <button className="flex flex-col items-center gap-1 pt-1 w-12">
            <svg className="h-6 w-6 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="text-[10px] text-black/40">Alerts</span>
          </button>
          <button 
            onClick={() => user ? navigate('/profile') : setShowAuthPrompt(true)}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            {user ? (
              <Avatar className="h-6 w-6">
                <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
                <AvatarFallback className="text-[10px] font-medium bg-black/10 text-black">
                  {firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-6 w-6 text-black/40" />
            )}
            <span className="text-[10px] text-black/40">Profile</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        {/* Expanded campaign detail */}
        {selectedCampaign && (
          <div className="fixed inset-0 z-40">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              style={{
                opacity: isClosingDetail ? 0 : 1,
                transition: 'opacity 0.4s ease-out',
              }}
              onClick={handleBackFromDetail}
            />

            <style>{`
              @keyframes pill-slide-up {
                0% {
                  transform: translateY(100%);
                }
                100% {
                  transform: translateY(0);
                }
              }
              @keyframes pill-slide-down {
                0% {
                  transform: translateY(0);
                }
                100% {
                  transform: translateY(100%);
                }
              }
            `}</style>

            {/* Full white pill - same placement as Home (CampaignCard) */}
            <div
              className="absolute left-3 right-3 bottom-[92px] rounded-[48px] overflow-hidden z-[60]"
              style={{
                maxHeight: 'calc(100dvh - 148px)',
                background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,1) 100%)',
                border: '1.5px solid rgba(255,255,255,0.8)',
                boxShadow:
                  '0 -8px 40px rgba(0,0,0,0.25), 0 12px 40px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
                animation: isClosingDetail
                  ? 'pill-slide-down 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards'
                  : 'pill-slide-up 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100dvh - 148px)' }}>
                {/* Drag handle indicator */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-black/20 rounded-full" />
                </div>

                {/* Header with brand - logo left of name */}
                <div className="flex items-center gap-3 px-5 pt-2 pb-3 border-b border-black/10">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={selectedCampaign.logo}
                      alt={selectedCampaign.brand}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-base font-bold text-black font-montserrat flex-1">
                    {selectedCampaign.brand}
                  </h2>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {/* Show Picture toggle pill */}
                  {!showPicture ? (
                    <button
                      onClick={() => setShowPicture(true)}
                      className="w-full mb-4 h-10 rounded-full text-xs font-semibold text-black/60 font-montserrat flex items-center justify-center gap-1.5"
                      style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
                        border: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      Show picture
                    </button>
                  ) : (
                    <div className="mb-4 overflow-hidden rounded-xl animate-fade-in">
                      <div className="mx-auto w-full max-w-[220px] aspect-[9/16] overflow-hidden rounded-xl">
                        <img
                          src={selectedCampaign.image}
                          alt={selectedCampaign.brand}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-black font-medium font-jakarta leading-relaxed mb-5">
                    {selectedCampaign.description}
                  </p>

                  {/* Requirements - glass effect */}
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <h3 className="text-sm font-semibold text-black mb-2 font-montserrat">Requirements</h3>
                    <ul className="space-y-1.5">
                      {selectedCampaign.guidelines.map((guideline, idx) => (
                        <li key={idx} className="text-sm text-black/80 font-jakarta flex items-start gap-2">
                          <span className="text-black/40">•</span>
                          {guideline}
                        </li>
                      ))}
                    </ul>

                    {/* Example images */}
                    {selectedCampaign.exampleImages && selectedCampaign.exampleImages.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {selectedCampaign.exampleImages.slice(0, 2).map((img, i) => (
                          <div key={i} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={img} alt={`Example ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Details - green glass effect */}
                  <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-2xl p-4 mb-4 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                    <h3 className="text-sm font-semibold text-white mb-2 font-montserrat">Payment Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/80 font-jakarta">Max earnings</span>
                        <span className="text-sm font-bold text-white font-montserrat">
                          {selectedCampaign.maxEarnings.toLocaleString()} sek
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/80 font-jakarta">Rate per 1K views</span>
                        <span className="text-sm font-bold text-white font-montserrat">
                          {selectedCampaign.ratePerThousand} sek
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/80 font-jakarta">Platform</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-white font-montserrat">TikTok</span>
                          <div className="w-4 h-4 rounded-full overflow-hidden">
                            <img src={tiktokPlatformLogo} alt="TikTok" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed CTA at bottom - blue Submit, white glass Save */}
                <div className="px-5 py-5 flex items-center justify-center gap-3 flex-shrink-0">
                  <button
                    className="h-12 px-8 text-sm font-bold rounded-full flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)',
                      border: '1.5px solid rgba(60,60,60,0.6)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2)',
                      color: 'white',
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Submit Content
                  </button>
                  <button
                    onClick={(e) => toggleFavorite(selectedCampaign.id, e)}
                    className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.85) 100%)',
                      border: '1.5px solid rgba(255,255,255,0.9)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <Bookmark
                      className={`h-5 w-5 ${favorites.includes(selectedCampaign.id) ? 'fill-black text-black' : 'text-black/50'}`}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header Bar with safe area */}
        <div className="flex flex-col border-b border-black/10 bg-white safe-area-top">
          <div className="flex items-center justify-center px-4 py-3">
            <span className="text-base font-semibold text-black">Discover</span>
          </div>
        </div>

        {/* Browse Mode - Grid Layout */}
        <div ref={featuredScrollRef} className="relative flex-1 overflow-y-auto pt-4 pb-24 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
          <div className="px-3">
            <div className="grid grid-cols-2 gap-2.5">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => handleSelectCampaign(campaign)}
                  className="relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-all w-full rounded-[32px] aspect-[9/16]"
                >
                  {/* Full image background */}
                  <img src={campaign.image} alt={campaign.brand} className="absolute inset-0 w-full h-full object-cover rounded-[32px]" />
                  
                  {/* Noise overlay */}
                  <div 
                    className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none rounded-[32px]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                  />
                  
                  {/* Top shadow gradient for text readability */}
                  <div className="absolute inset-x-0 top-0 h-[80px] bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none rounded-t-[32px]" />
                  
                  {/* Brand name + logo at top - logo on left */}
                  <div className="absolute top-3 left-3 right-3 flex items-center gap-2">
                    <div className="h-[22px] w-[22px] rounded-full overflow-hidden border border-white/30 flex-shrink-0">
                      <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-white font-montserrat drop-shadow-md">{campaign.brand}</span>
                  </div>
                  
                  {/* Description text above pill */}
                  <div className="absolute inset-x-0 bottom-[62px] px-3">
                    <div className="absolute inset-x-0 bottom-[-14px] h-[90px] bg-gradient-to-t from-black/70 via-black/40 to-transparent pointer-events-none" />
                    <p className="relative text-sm font-medium text-white font-jakarta line-clamp-2 drop-shadow-lg">
                      {campaign.description}
                    </p>
                  </div>
                  
                  {/* Bottom pill */}
                  <div 
                    className="absolute bottom-2 left-2 right-2 h-[52px] rounded-[26px] px-3 flex items-center justify-between"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
                      border: '1.5px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 -4px 20px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)',
                    }}
                  >
                    {/* Green earnings pill */}
                    <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-[16px] px-3 py-1.5 flex items-baseline gap-0.5 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                      <span className="text-sm font-bold text-white font-montserrat">
                        {campaign.maxEarnings.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-semibold text-white/80 font-montserrat">
                        sek
                      </span>
                    </div>

                    {/* TikTok icon */}
                    <div className="bg-gradient-to-b from-gray-700 to-gray-900 rounded-full h-[32px] w-[32px] flex items-center justify-center border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                      <img src={tiktokIcon} alt="TikTok" className="w-4 h-4 object-contain" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Auth Prompt Dialog */}
      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className="sm:max-w-sm bg-white border-0 rounded-[24px] p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-black">Join Jarla</DialogTitle>
          </DialogHeader>
          <p className="text-center text-black/60 text-sm mb-6">
            Create an account to save campaigns, track your submissions, and start earning.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                setShowAuthPrompt(false);
                navigate('/auth?mode=signup');
              }}
              className="w-full py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-black/80 transition-colors"
            >
              Create account
            </button>
            <button 
              onClick={() => {
                setShowAuthPrompt(false);
                navigate('/auth?mode=login');
              }}
              className="w-full py-3 border border-black/20 text-black rounded-full text-sm font-medium hover:bg-black/5 transition-colors"
            >
              Log in
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discover;
