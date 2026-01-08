import React from 'react';
import { Card } from '@/components/ui/card';
import { Video, Image, Calendar } from 'lucide-react';

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
  businessProfile,
  campaignVideoPreview,
  requirementImages = [],
}) => {
  // Placeholder for paid out amount (would come from real data)
  const paidOut = 0;

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-base font-medium text-muted-foreground mb-4">Campaign Preview</h2>
      
      <Card className="flex-1 bg-card border-border rounded-[4px] overflow-hidden flex flex-col relative">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 pb-24">
          {/* Title */}
          <div className="mb-8">
            <h3 className="font-bold text-foreground text-2xl">
              {formData.title || 'Campaign Title'}
            </h3>
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-base text-muted-foreground leading-relaxed">
              {formData.description || "We're looking for authentic creators to showcase our product in their daily routine. Create engaging content that highlights the key features while keeping it natural and relatable to your audience. Be creative and have fun with it!"}
            </p>
          </div>

          {/* Campaign Video Placeholder */}
          <div className="mb-8">
            <p className="text-sm font-medium text-foreground mb-3">Campaign Video</p>
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
        <div className="absolute bottom-0 left-0 right-0 bg-black text-white px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60 mb-1">Earn up to</p>
            <p className="text-2xl font-bold">
              {formData.total_budget > 0 ? `$${formData.total_budget.toLocaleString()}` : '$0'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/60 mb-1">Paid out</p>
            <p className="text-2xl font-bold">
              ${paidOut.toLocaleString()} <span className="text-white/60 font-normal text-base">/ ${formData.total_budget > 0 ? formData.total_budget.toLocaleString() : '0'}</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CampaignPreview;
