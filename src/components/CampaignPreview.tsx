import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

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
}

const CampaignPreview: React.FC<CampaignPreviewProps> = ({
  formData,
  requirements,
  businessProfile,
}) => {
  // Placeholder for paid out amount (would come from real data)
  const paidOut = 0;

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-sm font-medium text-muted-foreground mb-4">Campaign Preview</h2>
      
      <Card className="flex-1 bg-card/50 backdrop-blur-sm border-border rounded-[4px] overflow-hidden flex flex-col relative">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 pb-20">
          {/* Header: Logo + Title */}
          <div className="flex items-start gap-3 mb-6">
            {businessProfile?.logo_url ? (
              <img 
                src={businessProfile.logo_url} 
                alt="Company logo" 
                className="h-10 w-10 object-cover rounded-sm flex-shrink-0" 
              />
            ) : (
              <div className="h-10 w-10 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-muted-foreground">
                  {businessProfile?.company_name?.charAt(0)?.toUpperCase() || 'B'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-lg">
                {formData.title || 'Campaign Title'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {businessProfile?.company_name || 'Your Business'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {formData.description || 'Campaign description will appear here...'}
            </p>
          </div>

          {/* Requirements */}
          {requirements.filter(r => r.trim()).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Requirements</p>
              <ul className="space-y-1.5">
                {requirements.filter(r => r.trim()).map((req, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Fixed Bottom Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black text-white px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 mb-0.5">Earn up to</p>
            <p className="text-lg font-bold">
              {formData.total_budget > 0 ? `$${formData.total_budget.toLocaleString()}` : '$0'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60 mb-0.5">Paid out</p>
            <p className="text-lg font-bold">
              ${paidOut.toLocaleString()} <span className="text-white/60 font-normal text-sm">/ ${formData.total_budget > 0 ? formData.total_budget.toLocaleString() : '0'}</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CampaignPreview;
