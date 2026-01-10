import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Pencil, Forward, Settings, ExternalLink } from 'lucide-react';

interface BusinessProfile {
  id: string;
  company_name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
}

// Analyze image to determine if it needs a background and what color
const analyzeLogoColors = (img: HTMLImageElement): 'white' | 'black' | 'none' => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'white';
  
  const size = 50; // Sample size
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(img, 0, 0, size, size);
  
  try {
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    
    let totalR = 0, totalG = 0, totalB = 0;
    let transparentPixels = 0;
    let pixelCount = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      if (a < 128) {
        transparentPixels++;
      } else {
        totalR += r;
        totalG += g;
        totalB += b;
        pixelCount++;
      }
    }
    
    // If image has transparency, it needs a background
    const hasTransparency = transparentPixels > (size * size * 0.1);
    
    if (pixelCount === 0) return 'white';
    
    // Calculate average brightness
    const avgR = totalR / pixelCount;
    const avgG = totalG / pixelCount;
    const avgB = totalB / pixelCount;
    const brightness = (avgR * 0.299 + avgG * 0.587 + avgB * 0.114);
    
    // If the logo is mostly bright, use white background; if dark, use black
    // We invert the logic - dark logos need light bg, light logos need dark bg
    if (hasTransparency || true) { // Always add background for consistency
      return brightness > 128 ? 'black' : 'white';
    }
    
    return 'none';
  } catch (e) {
    console.error('Error analyzing logo:', e);
    return 'white';
  }
};

const BusinessDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [logoBgColor, setLogoBgColor] = useState<'white' | 'black' | 'none'>('white');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/business/auth');
    }
  }, [user, loading, navigate]);

  // Fetch business profile
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching business profile:', error);
        } else {
          setBusinessProfile(data);
        }
      } catch (error) {
        console.error('Error fetching business profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (user) {
      fetchBusinessProfile();
    }
  }, [user]);

  // Analyze logo colors when profile loads
  useEffect(() => {
    if (businessProfile?.logo_url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const bgColor = analyzeLogoColors(img);
        setLogoBgColor(bgColor);
      };
      img.onerror = () => {
        setLogoBgColor('white'); // Default to white on error
      };
      img.src = businessProfile.logo_url;
    }
  }, [businessProfile?.logo_url]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <BusinessLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </BusinessLayout>
    );
  }

  // Extract the one-liner (first line before any markdown or double newline)
  const getShortDescription = () => {
    if (!businessProfile?.description) return 'Welcome to your business dashboard';
    const desc = businessProfile.description;
    // Get first line, removing any markdown formatting
    const firstLine = desc.split('\n')[0].replace(/\*\*/g, '').trim();
    return firstLine || 'Welcome to your business dashboard';
  };
  
  const shortDescription = getShortDescription();

  return (
    <BusinessLayout>
      <div className="p-8">
        {/* Profile Card - responsive width */}
        <div className="mb-8 opacity-0 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
          <div className="bg-card border border-border rounded-[3px] overflow-hidden w-full">
              {/* Header with logo and name */}
              <div className="p-10 pb-6">
                <div className="flex items-start gap-6">
                  {/* Logo - 3x larger (216px) */}
                  {businessProfile?.logo_url ? (
                    <div 
                      className={`w-[216px] h-[216px] rounded-sm flex items-center justify-center p-4 flex-shrink-0 ${
                        logoBgColor === 'white' ? 'bg-white' : logoBgColor === 'black' ? 'bg-black' : 'bg-white'
                      }`}
                    >
                      <img 
                        src={businessProfile.logo_url} 
                        alt="Company logo" 
                        className="max-h-full max-w-full object-contain" 
                      />
                    </div>
                  ) : (
                    <div className="w-[216px] h-[216px] rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-6xl font-semibold text-muted-foreground">
                        {businessProfile?.company_name?.charAt(0)?.toUpperCase() || 'B'}
                      </span>
                    </div>
                  )}
                  
                  {/* Right side content */}
                  <div className="flex-1">
                    {/* Company name */}
                    <h1 className="text-3xl font-bold text-foreground">
                      {businessProfile?.company_name || 'Your Business'}
                    </h1>
                    
                    {/* Action row: Edit Profile, Share, Settings, Website link */}
                    <div className="flex items-center gap-3 mt-3">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Pencil className="w-4 h-4" />
                        Edit Profile
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Forward className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Settings className="w-4 h-4" />
                      </Button>
                      {businessProfile?.website && (
                        <a 
                          href={businessProfile.website.startsWith('http') ? businessProfile.website : `https://${businessProfile.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>{businessProfile.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      )}
                    </div>
                    
                    {/* Stats - same size for numbers and text */}
                    <div className="flex gap-6 mt-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-foreground">0</span>
                        <span className="text-base text-muted-foreground">Creators</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-foreground">0</span>
                        <span className="text-base text-muted-foreground">Campaigns</span>
                      </div>
                    </div>
                    
                    {/* Description - as wide as action row */}
                    <p className="mt-3 text-sm text-foreground leading-relaxed">
                      {shortDescription}
                    </p>
                    
                    {/* Campaigns section - inside profile area, above divider */}
                    <div className="mt-6">
                      <h3 className="text-xl font-bold text-foreground text-left">Campaigns</h3>
                      <div className="border-t border-border mt-3 pt-4">
                        {/* Add campaign button - larger */}
                        <div 
                          className="w-[256px] aspect-[9/16] bg-muted/30 rounded-[3px] border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => navigate('/business/campaigns/new')}
                        >
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                              <span className="text-2xl text-muted-foreground">+</span>
                            </div>
                            <span className="text-sm text-muted-foreground">New Campaign</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </BusinessLayout>
  );
};

export default BusinessDashboard;
