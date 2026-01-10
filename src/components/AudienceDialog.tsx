import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import { AUDIENCE_TYPES } from '@/data/audienceTypes';

// Group audience types by category
const audienceCategories = [
  { id: 'demographics', name: 'Demographics', icon: '👤' },
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'health', name: 'Health & Fitness', icon: '💪' },
  { id: 'fashion', name: 'Fashion & Beauty', icon: '👗' },
  { id: 'food', name: 'Food & Beverage', icon: '🍕' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'creative', name: 'Creative', icon: '🎨' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🏠' },
  { id: 'sustainability', name: 'Sustainability', icon: '🌱' },
];

// Simplified regions for the world map
const regions = [
  { id: 'global', name: 'Global', emoji: '🌍' },
  { id: 'europe', name: 'Europe', emoji: '🇪🇺' },
  { id: 'north-america', name: 'North America', emoji: '🇺🇸' },
  { id: 'south-america', name: 'South America', emoji: '🇧🇷' },
  { id: 'asia', name: 'Asia', emoji: '🇯🇵' },
  { id: 'africa', name: 'Africa', emoji: '🇿🇦' },
  { id: 'oceania', name: 'Oceania', emoji: '🇦🇺' },
  { id: 'middle-east', name: 'Middle East', emoji: '🇦🇪' },
];

interface AudienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRegions: string[];
  selectedAudiences: string[];
  onRegionsChange: (regions: string[]) => void;
  onAudiencesChange: (audiences: string[]) => void;
}

const AudienceDialog: React.FC<AudienceDialogProps> = ({
  open,
  onOpenChange,
  selectedRegions,
  selectedAudiences,
  onRegionsChange,
  onAudiencesChange,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [localRegions, setLocalRegions] = useState<string[]>(selectedRegions);
  const [localAudiences, setLocalAudiences] = useState<string[]>(selectedAudiences);

  useEffect(() => {
    if (open) {
      setLocalRegions(selectedRegions);
      setLocalAudiences(selectedAudiences);
      setStep(1);
    }
  }, [open, selectedRegions, selectedAudiences]);

  const toggleRegion = (regionId: string) => {
    setLocalRegions(prev => 
      prev.includes(regionId) 
        ? prev.filter(r => r !== regionId)
        : [...prev, regionId]
    );
  };

  const toggleAudience = (audience: string) => {
    setLocalAudiences(prev => 
      prev.includes(audience) 
        ? prev.filter(a => a !== audience)
        : [...prev, audience]
    );
  };

  const handleConfirm = () => {
    onRegionsChange(localRegions);
    onAudiencesChange(localAudiences);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onOpenChange(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh] p-0 rounded-lg border border-border bg-background [&>button]:hidden overflow-hidden">
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-4xl font-bold text-foreground">
              {step === 1 ? (localRegions.length > 0 ? regions.find(r => r.id === localRegions[0])?.name || 'Location' : '') : (localAudiences.length > 0 ? localAudiences[0] : '')}
            </h1>
            <div className="w-8" />
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto">
            {step === 1 ? (
              /* Step 1: World Map / Regions */
              <div className="h-full flex flex-col items-center justify-center p-8">
                {/* Simple region grid as map placeholder */}
                <div className="grid grid-cols-4 gap-6 max-w-4xl">
                  {regions.map((region) => {
                    const isSelected = localRegions.includes(region.id);
                    return (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() => toggleRegion(region.id)}
                        className={`flex flex-col items-center gap-3 p-6 rounded-[4px] border transition-all duration-150 ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <span className="text-4xl">{region.emoji}</span>
                        <span className={`text-sm ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {region.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Step 2: Audience Types */
              <div className="h-full p-8">
                <div className="max-w-4xl mx-auto">
                  {/* Category pills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {audienceCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className="px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:border-primary/50 transition-colors"
                      >
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                  
                  {/* Audience chips */}
                  <div className="flex flex-wrap gap-2">
                    {AUDIENCE_TYPES.slice(0, 60).map((audience) => {
                      const isSelected = localAudiences.includes(audience);
                      return (
                        <button
                          key={audience}
                          type="button"
                          onClick={() => toggleAudience(audience)}
                          className={`px-3 py-1.5 rounded-[4px] border text-sm transition-all duration-150 ${
                            isSelected 
                              ? 'border-primary bg-primary text-primary-foreground' 
                              : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                          }`}
                        >
                          {audience}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 flex justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Step {step} of 2
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleNext}>
                {step === 2 ? 'Continue' : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudienceDialog;
