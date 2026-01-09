import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { supabase } from '@/integrations/supabase/client';

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
                <div className="flex items-center gap-5">
                  {businessProfile?.logo_url ? (
                    <div 
                      className={`w-[72px] h-[72px] rounded-sm flex items-center justify-center p-2 ${
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
                    <div className="w-[72px] h-[72px] rounded-sm bg-muted flex items-center justify-center">
                      <span className="text-3xl font-semibold text-muted-foreground">
                        {businessProfile?.company_name?.charAt(0)?.toUpperCase() || 'B'}
                      </span>
                    </div>
                  )}
                  <h1 className="text-3xl font-bold text-foreground">
                    {businessProfile?.company_name || 'Your Business'}
                  </h1>
                </div>
                
                {/* Description */}
                <p className="mt-5 text-base text-muted-foreground leading-relaxed">
                  {shortDescription}
                </p>
              </div>
              
              {/* Campaigns section */}
              <div className="border-t border-border px-10 py-6">
                <h3 className="text-base font-medium text-foreground mb-4">Campaigns</h3>
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
    </BusinessLayout>
  );
};

export default BusinessDashboard;
