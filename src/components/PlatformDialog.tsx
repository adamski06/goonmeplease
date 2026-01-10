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
        <div className="h-full flex overflow-hidden">
          {/* Left Side - Platform Selection (1/3 width) */}
          <div className="w-1/3 h-full flex flex-col border-r border-border shrink-0">
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

            {/* Platform Selection */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center">
              <div className="w-full max-w-md">
                <p className="text-sm text-muted-foreground text-center mb-6">Select Platform</p>
                <div className="space-y-3">
                  {platforms.map(({ id, name, logo }) => {
                    const isSelected = selectedPlatform === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSelect(id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-[4px] border transition-all duration-200 ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50 hover:bg-muted/30'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-[4px] overflow-hidden flex-shrink-0">
                          <img 
                            src={logo} 
                            alt={name} 
                            className={`w-full h-full object-cover ${
                              id === 'instagram' ? 'scale-125' : id === 'youtube' ? 'scale-[1.15]' : ''
                            }`}
                          />
                        </div>
                        <span className={`text-lg font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Preview/Info (2/3 width) */}
          <div className="w-2/3 h-full p-8 flex flex-col items-center justify-center bg-muted/30 overflow-hidden">
            {selectedPlatform ? (
              <div className="text-center">
                <div className="w-32 h-32 rounded-[4px] overflow-hidden mx-auto mb-6">
                  <img 
                    src={platforms.find(p => p.id === selectedPlatform)?.logo} 
                    alt={platforms.find(p => p.id === selectedPlatform)?.name}
                    className={`w-full h-full object-cover ${
                      selectedPlatform === 'instagram' ? 'scale-125' : selectedPlatform === 'youtube' ? 'scale-[1.15]' : ''
                    }`}
                  />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {platforms.find(p => p.id === selectedPlatform)?.name}
                </h2>
                <p className="text-muted-foreground">
                  Create content for {platforms.find(p => p.id === selectedPlatform)?.name}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 rounded-[4px] bg-muted/50 mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl text-muted-foreground">?</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Select a Platform</h2>
                <p className="text-muted-foreground">
                  Choose where creators will post content
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlatformDialog;
