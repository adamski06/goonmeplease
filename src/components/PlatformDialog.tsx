import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Platform logo imports
import tiktokLogo from '@/assets/platforms/tiktok.png';
import instagramLogo from '@/assets/platforms/instagram.png';
import youtubeLogo from '@/assets/platforms/youtube.png';

type Platform = 'tiktok' | 'instagram' | 'youtube';

const platforms: { id: Platform; name: string; logo: string }[] = [
  { id: 'tiktok', name: 'TikTok', logo: tiktokLogo },
  { id: 'instagram', name: 'Instagram', logo: instagramLogo },
  { id: 'youtube', name: 'YouTube', logo: youtubeLogo },
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

          {/* Main content area - empty/clean */}
          <div className="flex-1" />

          {/* Bottom - Platform logos in horizontal row */}
          <div className="p-8 flex justify-center gap-8">
            {platforms.map(({ id, name, logo }) => {
              const isSelected = selectedPlatform === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelect(id)}
                  className={`w-32 h-32 rounded-[4px] overflow-hidden transition-all duration-150 ${
                    isSelected 
                      ? 'ring-2 ring-primary ring-offset-2' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={logo} 
                    alt={name} 
                    className={`w-full h-full object-cover ${
                      id === 'instagram' ? 'scale-125' : id === 'youtube' ? 'scale-[1.15]' : ''
                    }`}
                  />
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
