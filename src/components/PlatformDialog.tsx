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
  const [localSelection, setLocalSelection] = React.useState<Platform | null>(selectedPlatform || 'tiktok');

  React.useEffect(() => {
    if (open) {
      setLocalSelection(selectedPlatform || 'tiktok');
    }
  }, [open, selectedPlatform]);

  const handleConfirm = () => {
    if (localSelection) {
      onPlatformChange(localSelection);
      onOpenChange(false);
    }
  };

  const selectedPlatformData = platforms.find(p => p.id === localSelection);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh] p-0 rounded-lg border border-border bg-background [&>button]:hidden overflow-hidden">
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header - arrow in top left, heading at top */}
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {selectedPlatformData && (
              <h1 className="text-4xl font-bold text-foreground">
                {selectedPlatformData.name}
              </h1>
            )}
            <div className="w-8" /> {/* Spacer for centering */}
          </div>

          {/* Main content area - empty */}
          <div className="flex-1" />

          {/* Platform logos - compact box lower down */}
          <div className="px-16 pb-8 flex justify-center">
            <div className="border border-input rounded-[4px] p-4 flex gap-6">
              {/* TikTok - selectable */}
              <button
                type="button"
                onClick={() => setLocalSelection('tiktok')}
                className="flex flex-col items-center gap-2 transition-all duration-150 opacity-100"
              >
                <div className={`w-12 h-12 rounded-[4px] overflow-hidden transition-all ${
                  localSelection === 'tiktok' ? 'ring-1 ring-primary/50 ring-offset-1' : ''
                }`}>
                  <img 
                    src={tiktokLogo} 
                    alt="TikTok" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`text-xs ${localSelection === 'tiktok' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  TikTok
                </span>
              </button>

              {/* Other platforms - faded with coming soon overlay */}
              <div className="relative flex gap-6">
                {platforms.filter(p => p.id !== 'tiktok').map(({ id, name, logo }) => (
                  <div
                    key={id}
                    className="flex flex-col items-center gap-2 opacity-30"
                  >
                    <div className="w-12 h-12 rounded-[4px] overflow-hidden">
                      <img 
                        src={logo} 
                        alt={name} 
                        className={`w-full h-full object-cover ${
                          id === 'instagram' ? 'scale-125' : id === 'youtube' ? 'scale-[1.15]' : ''
                        }`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {name}
                    </span>
                  </div>
                ))}
                {/* Coming soon overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm text-muted-foreground font-medium">
                    Coming soon
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Continue button - no border */}
          <div className="p-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!localSelection}>
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlatformDialog;
