import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity, ArrowLeft, Clock, Eye, Video, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jarlaLogo from '@/assets/jarla-logo.png';
import defaultAvatar from '@/assets/default-avatar.png';
import nikeLogo from '@/assets/logos/nike.png';
import spotifyLogo from '@/assets/logos/spotify.png';
import samsungLogo from '@/assets/logos/samsung.png';
import redbullLogo from '@/assets/logos/redbull.png';
import adobeLogo from '@/assets/logos/adobe.png';

// Extended mock campaign data
const campaignsData = [
  { 
    id: 1, 
    brand: 'Nike', 
    description: 'Show off your workout routine with our new collection', 
    logo: nikeLogo,
    contentType: 'Workout/Fitness video',
    productVisibility: 'Product must be clearly visible for at least 3 seconds',
    videoLength: '15-60 seconds',
    guidelines: [
      'Wear Nike apparel or shoes throughout the video',
      'Show yourself actively working out',
      'Include the hashtag #JustDoIt',
      'No competitor brands visible'
    ],
    tiers: [
      { minViews: 0, maxViews: 10000, rate: 50 },
      { minViews: 10000, maxViews: 100000, rate: 40 },
      { minViews: 100000, maxViews: null, rate: 30 }
    ],
    maxEarnings: 1000
  },
  { 
    id: 2, 
    brand: 'Spotify', 
    description: 'Share your favorite playlist moment', 
    logo: spotifyLogo,
    contentType: 'Music/Lifestyle video',
    productVisibility: 'Show Spotify app on screen for at least 2 seconds',
    videoLength: '10-30 seconds',
    guidelines: [
      'Play music through Spotify app visibly',
      'Show genuine reaction to the music',
      'Mention discovering new music',
      'Use trending sounds when possible'
    ],
    tiers: [
      { minViews: 0, maxViews: 5000, rate: 35 },
      { minViews: 5000, maxViews: 50000, rate: 28 },
      { minViews: 50000, maxViews: null, rate: 20 }
    ],
    maxEarnings: 1000
  },
  { 
    id: 3, 
    brand: 'Samsung', 
    description: 'Unbox and review the new Galaxy phone', 
    logo: samsungLogo,
    contentType: 'Unboxing/Tech Review',
    productVisibility: 'Product must be the main focus throughout',
    videoLength: '30-90 seconds',
    guidelines: [
      'Show complete unboxing experience',
      'Highlight at least 3 key features',
      'Share your genuine first impressions',
      'Include the phone in good lighting'
    ],
    tiers: [
      { minViews: 0, maxViews: 20000, rate: 72 },
      { minViews: 20000, maxViews: 200000, rate: 55 },
      { minViews: 200000, maxViews: null, rate: 40 }
    ],
    maxEarnings: 1000
  },
  { 
    id: 4, 
    brand: 'Red Bull', 
    description: 'Capture your most extreme moment', 
    logo: redbullLogo,
    contentType: 'Extreme Sports/Adventure',
    productVisibility: 'Red Bull can visible at start or end',
    videoLength: '15-45 seconds',
    guidelines: [
      'Feature an adrenaline-pumping activity',
      'Keep it safe but exciting',
      'Show the Red Bull can naturally',
      'High energy editing preferred'
    ],
    tiers: [
      { minViews: 0, maxViews: 15000, rate: 45 },
      { minViews: 15000, maxViews: 150000, rate: 35 },
      { minViews: 150000, maxViews: null, rate: 25 }
    ],
    maxEarnings: 1000
  },
  { 
    id: 5, 
    brand: 'Adobe', 
    description: 'Create something amazing with our tools', 
    logo: adobeLogo,
    contentType: 'Creative Process/Tutorial',
    productVisibility: 'Show Adobe software interface clearly',
    videoLength: '20-60 seconds',
    guidelines: [
      'Demonstrate a creative workflow',
      'Show before/after if applicable',
      'Mention which Adobe tool you\'re using',
      'Make it inspirational for other creators'
    ],
    tiers: [
      { minViews: 0, maxViews: 10000, rate: 60 },
      { minViews: 10000, maxViews: 100000, rate: 45 },
      { minViews: 100000, maxViews: null, rate: 35 }
    ],
    maxEarnings: 1000
  },
];

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const campaign = campaignsData.find(c => c.id === Number(id));

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Campaign not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Radial Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 200% 150% at 50% 100%, hsl(220, 40%, 80%) 0%, hsl(210, 30%, 85%) 25%, hsl(200, 20%, 90%) 40%, white 65%)'
        }}
      />
      <div className="noise-layer absolute inset-0 pointer-events-none opacity-50" />
      
      {/* Left Sidebar */}
      <aside className="w-64 flex flex-col relative z-10">
        {/* Logo */}
        <div className="px-6 py-4">
          <button onClick={() => navigate('/')} className="relative h-8 w-[120px]">
            <div 
              className="absolute inset-0 bg-foreground"
              style={{
                WebkitMaskImage: `url(${jarlaLogo})`,
                maskImage: `url(${jarlaLogo})`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'left center',
                maskPosition: 'left center'
              }} 
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col justify-center px-4 gap-1">
          <button 
            onClick={() => navigate('/campaigns')}
            className="text-2xl font-bold text-foreground hover:bg-gradient-to-r hover:from-blue-900 hover:to-blue-400 hover:bg-clip-text hover:text-transparent px-3 py-2 text-left transition-all flex items-center gap-3 group"
          >
            <svg className="h-6 w-6 group-hover:text-blue-800" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
                fill="currentColor"
              />
              <rect x="10.5" y="15" width="3" height="6" rx="0.5" fill="hsl(210, 30%, 88%)" />
            </svg>
            Home
          </button>
          <button 
            onClick={() => navigate('/activity')}
            className="text-2xl font-bold text-foreground hover:bg-gradient-to-r hover:from-blue-900 hover:to-blue-400 hover:bg-clip-text hover:text-transparent px-3 py-2 text-left transition-all flex items-center gap-3 group"
          >
            <Activity className="h-6 w-6 group-hover:text-blue-800" />
            Activity
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="text-2xl font-bold text-foreground hover:bg-gradient-to-r hover:from-blue-900 hover:to-blue-400 hover:bg-clip-text hover:text-transparent px-3 py-2 text-left transition-all flex items-center gap-3 group"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
              <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            My Page
          </button>
        </nav>

        {/* Profile at bottom */}
        <div className="mt-auto px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
              <AvatarFallback className="bg-muted text-foreground font-medium">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-foreground">{firstName}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/campaigns')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to campaigns</span>
          </button>

          {/* Hero Section */}
          <div className="flex items-start gap-8 mb-12">
            <div className="w-32 h-32 rounded-2xl bg-white shadow-lg flex items-center justify-center border border-border/50 p-4 flex-shrink-0">
              <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">{campaign.brand}</h1>
              <p className="text-xl text-muted-foreground">{campaign.description}</p>
            </div>
          </div>

          {/* Content Requirements */}
          <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Content Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Content Type</p>
                  <p className="font-semibold text-foreground">{campaign.contentType}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Product Visibility</p>
                  <p className="font-semibold text-foreground">{campaign.productVisibility}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Video Length</p>
                  <p className="font-semibold text-foreground">{campaign.videoLength}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Guidelines */}
          <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Guidelines</h2>
            <ul className="space-y-3">
              {campaign.guidelines.map((guideline, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-foreground">{guideline}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Inspiration Section */}
          <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Inspiration</h2>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="aspect-[9/16] bg-black/5 rounded-xl border border-border/30 flex items-center justify-center"
                >
                  <span className="text-muted-foreground text-sm">Example {i}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Reward Breakdown */}
          <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Reward Structure</h2>
            <div className="space-y-4">
              {campaign.tiers.map((tier, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-border/30"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {tier.minViews.toLocaleString()} - {tier.maxViews ? tier.maxViews.toLocaleString() : '∞'} views
                    </p>
                    <p className="text-sm text-muted-foreground">Tier {idx + 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{tier.rate} sek</p>
                    <p className="text-sm text-muted-foreground">per 1000 views</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground">Maximum earnings</p>
              <p className="text-3xl font-bold text-foreground">{campaign.maxEarnings.toLocaleString()} sek</p>
            </div>
          </section>

          {/* CTA */}
          <Button 
            size="lg" 
            className="w-full py-6 text-lg font-bold rounded-full"
          >
            Submit Content for This Campaign
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CampaignDetail;
