import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Platform logo imports
import tiktokLogo from '@/assets/platforms/tiktok.png';
import instagramLogo from '@/assets/platforms/instagram.png';
import youtubeLogo from '@/assets/platforms/youtube.png';
import facebookLogo from '@/assets/platforms/facebook.png';
import linkedinLogo from '@/assets/platforms/linkedin.png';

type Platform = 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'linkedin';

const platforms: { id: Platform; name: string; logo: string }[] = [
  { id: 'tiktok', name: 'TikTok', logo: tiktokLogo },
  { id: 'instagram', name: 'Instagram', logo: instagramLogo },
  { id: 'youtube', name: 'YouTube', logo: youtubeLogo },
  { id: 'facebook', name: 'Facebook', logo: facebookLogo },
  { id: 'linkedin', name: 'LinkedIn', logo: linkedinLogo },
];

interface PlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlatform: Platform | null;
  onPlatformChange: (platform: Platform) => void;
}

const PlatformDialog: React.FC<PlatformDialogProps> = ({
  open,
  onOpenChange,
  selectedPlatform,
  onPlatformChange,
}) => {
  const handleSelect = (platform: Platform) => {
    onPlatformChange(platform);
    onOpenChange(false);
  };

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh] p-0 rounded-lg border border-border bg-background [&>button]:hidden overflow-hidden">
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header - arrow in top left */}
          <div className="flex items-center justify-start p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Main content area - show selected platform heading */}
          <div className="flex-1 flex items-center justify-center">
            {selectedPlatformData && (
              <h1 className="text-6xl font-bold text-foreground">
                {selectedPlatformData.name}
              </h1>
            )}
          </div>

          {/* Platform logos - moved up with more spacing */}
          <div className="pb-32 flex justify-center gap-12">
            {platforms.map(({ id, name, logo }) => {
              const isSelected = selectedPlatform === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelect(id)}
                  className={`flex flex-col items-center gap-3 transition-all duration-150 ${
                    isSelected 
                      ? 'opacity-100' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`w-[90px] h-[90px] rounded-[4px] overflow-hidden ${
                    isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}>
                    <img 
                      src={logo} 
                      alt={name} 
                      className={`w-full h-full object-cover ${
                        id === 'instagram' ? 'scale-125' : id === 'youtube' ? 'scale-[1.15]' : ''
                      }`}
                    />
                  </div>
                  <span className={`text-sm ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlatformDialog;
