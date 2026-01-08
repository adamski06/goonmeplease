import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign } from 'lucide-react';

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
  selectedPlatforms,
  businessProfile,
  campaignVideoPreview,
}) => {
  const hasContent = formData.title || formData.description || formData.total_budget > 0;

  return (
    <div className="sticky top-8">
      <h2 className="text-sm font-medium text-muted-foreground mb-4">Campaign Preview</h2>
      
      <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px] overflow-hidden">
        {/* Video Preview */}
        {campaignVideoPreview ? (
          <div className="aspect-video bg-muted">
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
          <div className="aspect-video bg-muted/50 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Video preview</span>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {businessProfile?.logo_url ? (
              <img 
                src={businessProfile.logo_url} 
                alt="Company logo" 
                className="h-8 w-8 object-cover rounded-sm" 
              />
            ) : (
              <div className="h-8 w-8 rounded-sm bg-muted flex items-center justify-center">
                <span className="text-sm font-semibold text-muted-foreground">
                  {businessProfile?.company_name?.charAt(0)?.toUpperCase() || 'B'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {businessProfile?.company_name || 'Your Business'}
              </p>
              <h3 className="font-semibold text-foreground truncate">
                {formData.title || 'Campaign Title'}
              </h3>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {formData.description || 'Campaign description will appear here...'}
          </p>

          {/* Platforms */}
          {selectedPlatforms.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedPlatforms.map((platform) => (
                <Badge key={platform} variant="secondary" className="text-xs capitalize">
                  {platform}
                </Badge>
              ))}
            </div>
          )}

          {/* Requirements */}
          {requirements.filter(r => r.trim()).length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Requirements</p>
              <ul className="space-y-1">
                {requirements.filter(r => r.trim()).slice(0, 3).map((req, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span className="line-clamp-1">{req}</span>
                  </li>
                ))}
                {requirements.filter(r => r.trim()).length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{requirements.filter(r => r.trim()).length - 3} more
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Budget & Deadline */}
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            {formData.total_budget > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                <span>${formData.total_budget.toLocaleString()}</span>
              </div>
            )}
            {formData.deadline && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(formData.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!hasContent && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Fill in the form to see your campaign preview
        </p>
      )}
    </div>
  );
};

export default CampaignPreview;
