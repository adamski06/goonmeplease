import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Video, Image, Calendar, Smartphone, Monitor } from 'lucide-react';

// Platform logo imports
import tiktokLogo from '@/assets/platforms/tiktok.png';
import instagramLogo from '@/assets/platforms/instagram.png';
import youtubeLogo from '@/assets/platforms/youtube.png';
import facebookLogo from '@/assets/platforms/facebook.png';
import linkedinLogo from '@/assets/platforms/linkedin.png';

const platformLogos: Record<string, string> = {
  tiktok: tiktokLogo,
  instagram: instagramLogo,
  youtube: youtubeLogo,
  facebook: facebookLogo,
  linkedin: linkedinLogo,
};

const platformNames: Record<string, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
};

interface CampaignPreviewProps {
  formData: {
    brand_name: string;
    title: string;
    description: string;
    deadline: string;
    total_budget: number;
  };
  requirements: string[];
  selectedPlatforms: string[];
  businessProfile: { company_name: string; logo_url: string | null } | null;
  campaignVideoPreview?: string;
  requirementImages?: string[];
}

const CampaignPreview: React.FC<CampaignPreviewProps> = ({
  formData,
  requirements,
  selectedPlatforms,
  businessProfile,
  campaignVideoPreview,
  requirementImages = [],
}) => {
  const [viewMode, setViewMode] = useState<'phone' | 'desktop'>('desktop');
  // Placeholder for paid out amount (would come from real data)
  const paidOut = 0;

  return (
    <div className="flex flex-col h-full">
      {/* Centered Preview header with view toggle */}
      <div className="flex justify-center mb-2">
        <div className="flex items-center gap-2 backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface rounded-[3px] px-3 py-1.5 border border-black/10 dark:border-white/20">
          <span className="text-sm font-medium text-muted-foreground">Preview</span>
          <div className="w-px h-4 bg-border" />
          <button
            type="button"
            onClick={() => setViewMode('phone')}
            className={`p-1.5 rounded-[2px] transition-colors ${
              viewMode === 'phone' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Smartphone className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`p-1.5 rounded-[2px] transition-colors ${
              viewMode === 'desktop' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center min-h-0">
        <Card 
          className={`bg-card border-border rounded-[4px] flex flex-col relative transition-all duration-300 ease-out ${
            viewMode === 'phone' ? 'w-[380px]' : 'w-full'
          } h-full`}
        >
          {/* Scrollable Content */}
          <div className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30 ${viewMode === 'phone' ? 'p-6' : 'p-8'}`} style={{ paddingBottom: '100px' }}>
          {/* Title and Platform badges */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground text-2xl">
              {formData.title || 'Campaign Title'}
            </h3>
            
            {selectedPlatforms.length > 0 && (
              <div className="flex gap-4">
                {selectedPlatforms.map((platform) => (
                  <div 
                    key={platform}
                    className="flex items-center gap-2"
                  >
                    <img 
                      src={platformLogos[platform]} 
                      alt={platformNames[platform]} 
                      className="w-12 h-12 object-cover rounded-[4px]"
                    />
                    <span className="text-lg font-medium text-foreground">
                      {platformNames[platform]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-base text-muted-foreground leading-relaxed">
              {formData.description || "We're looking for authentic creators to showcase our product in their daily routine. Create engaging content that highlights the key features while keeping it natural and relatable to your audience. Be creative and have fun with it!"}
            </p>
          </div>

          {/* Campaign Video Placeholder */}
          <div className="mb-8">
            <p className="text-sm font-medium text-foreground mb-3">Video</p>
            {campaignVideoPreview ? (
              <div className="aspect-[9/16] max-w-[200px] bg-muted rounded-[4px] overflow-hidden">
                <video 
                  src={campaignVideoPreview} 
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              </div>
            ) : (
              <div className="aspect-[9/16] max-w-[200px] bg-muted/50 rounded-[4px] flex flex-col items-center justify-center border border-dashed border-border">
                <Video className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Video placeholder</span>
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="mb-8">
            <p className="text-sm font-medium text-foreground mb-3">Requirements</p>
            {requirements.filter(r => r.trim()).length > 0 ? (
              <ul className="space-y-2 mb-4">
                {requirements.filter(r => r.trim()).map((req, i) => (
                  <li key={i} className="text-base text-muted-foreground flex items-start gap-3">
                    <span className="text-foreground mt-1">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2 mb-4">
                <li className="text-base text-muted-foreground/50 flex items-start gap-3">
                  <span className="text-foreground/50 mt-1">•</span>
                  <span>Product must be visible for at least 3 seconds in the video</span>
                </li>
                <li className="text-base text-muted-foreground/50 flex items-start gap-3">
                  <span className="text-foreground/50 mt-1">•</span>
                  <span>Include the brand name or hashtag in your caption</span>
                </li>
                <li className="text-base text-muted-foreground/50 flex items-start gap-3">
                  <span className="text-foreground/50 mt-1">•</span>
                  <span>Video must be original content, no reposts or duets</span>
                </li>
              </ul>
            )}

            {/* Reference Images */}
            <p className="text-sm font-medium text-foreground mb-3">Reference Images</p>
            {requirementImages.length > 0 ? (
              <div className="flex gap-3 flex-wrap">
                {requirementImages.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    alt={`Reference ${i + 1}`} 
                    className="h-20 w-20 object-cover rounded-[4px]"
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 w-20 bg-muted/50 rounded-[4px] flex items-center justify-center border border-dashed border-border">
                    <Image className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deadline */}
          <div className="mb-6">
            <p className="text-sm font-medium text-foreground mb-2">Deadline</p>
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span>
                {formData.deadline 
                  ? new Date(formData.deadline).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'No deadline set'}
              </span>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-black text-white flex items-center justify-between rounded-t-xl ${
          viewMode === 'phone' ? 'px-5 py-4' : 'px-8 py-5'
        }`}>
          <div>
            <p className={`text-white/60 mb-1 ${viewMode === 'phone' ? 'text-xs' : 'text-sm'}`}>Earn up to</p>
            <p className={`font-bold ${viewMode === 'phone' ? 'text-xl' : 'text-2xl'}`}>
              {formData.total_budget > 0 ? `$${formData.total_budget.toLocaleString()}` : '$0'}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-white/60 mb-1 ${viewMode === 'phone' ? 'text-xs' : 'text-sm'}`}>Paid out</p>
            <p className={`font-bold ${viewMode === 'phone' ? 'text-xl' : 'text-2xl'}`}>
              ${paidOut.toLocaleString()} <span className={`text-white/60 font-normal ${viewMode === 'phone' ? 'text-sm' : 'text-base'}`}>/ ${formData.total_budget > 0 ? formData.total_budget.toLocaleString() : '0'}</span>
            </p>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default CampaignPreview;
