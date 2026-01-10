import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft } from 'lucide-react';

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: number;
  onBudgetChange: (budget: number) => void;
}

const paymentTiers = [
  { payout: 100, views: 3500 },
  { payout: 1000, views: 20000 },
];

// Snap to nearest 5000
const snapToFiveThousand = (value: number): number => {
  return Math.round(value / 5000) * 5000;
};

const BudgetDialog: React.FC<BudgetDialogProps> = ({
  open,
  onOpenChange,
  budget,
  onBudgetChange,
}) => {
  const [localBudget, setLocalBudget] = useState(budget);
  const [displayBudget, setDisplayBudget] = useState(budget);
  const [animatedBudget, setAnimatedBudget] = useState(budget);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);
  const animationRef = useRef<number>();

  // Constants
  const minBudget = 20000; // Minimum budget (gives 15k creator pool at 25% fee)
  const maxBudget = 500000;
  const minLog = Math.log(minBudget);
  const maxLog = Math.log(maxBudget);

  const budgetToSlider = (budget: number) => {
    const clampedBudget = Math.max(minBudget, Math.min(maxBudget, budget));
    return ((Math.log(clampedBudget) - minLog) / (maxLog - minLog)) * 100;
  };

  const sliderToBudget = (sliderValue: number) => {
    const logValue = minLog + (sliderValue / 100) * (maxLog - minLog);
    return Math.exp(logValue);
  };

  // Animate to target value
  const animateTo = (target: number) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    const start = animatedBudget;
    const startTime = performance.now();
    const duration = 200; // 200ms animation
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      
      setAnimatedBudget(current);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (open) {
      const initialBudget = Math.max(minBudget, budget || minBudget);
      setLocalBudget(initialBudget);
      setDisplayBudget(initialBudget);
      setAnimatedBudget(initialBudget);
    }
  }, [open, budget]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const currentTier = paymentTiers[selectedTier];
  
  // Fee calculation: 25% at 20k, drops faster initially, 10% at 500k
  // Using exponential decay for faster initial drop
  const t = (animatedBudget - minBudget) / (maxBudget - minBudget);
  const maxFee = 25;
  const minFee = 10;
  // Exponential decay - drops faster at beginning
  const calculatedFeePercent = maxFee * Math.pow(minFee / maxFee, Math.pow(t, 0.6));
  const feePercent = Math.round(calculatedFeePercent * 10) / 10;
  
  const poolRatio = 1 - (feePercent / 100);
  const rawCreatorPool = animatedBudget * poolRatio;
  
  // Creator pool: minimum 15k, snaps to 5k increments
  const creatorPool = isDragging 
    ? Math.max(15000, Math.round(rawCreatorPool))
    : Math.max(15000, snapToFiveThousand(rawCreatorPool));
  
  // Budget snaps to 5k increments
  const displayedBudget = isDragging 
    ? Math.round(animatedBudget) 
    : snapToFiveThousand(animatedBudget);
  
  const jarlaFeeAmount = displayedBudget - creatorPool;
  const guaranteedCreators = Math.floor(creatorPool / currentTier.payout);
  const guaranteedViews = guaranteedCreators * currentTier.views;


  const handleConfirm = () => {
    onBudgetChange(snapToFiveThousand(localBudget));
    onOpenChange(false);
  };

  const presetBudgets = [15000, 25000, 50000, 100000, 250000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh] p-0 rounded-lg border border-border bg-background [&>button]:hidden overflow-hidden">
        <div className="h-full flex overflow-hidden">
          {/* Left Side - Budget Controls (1/3 width, full height) */}
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

            {/* Budget Controls */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-8">
              {/* Total Budget Node */}
              <div className="w-full max-w-md">
                <Label className="text-sm text-muted-foreground block text-center mb-3">Total Budget</Label>
                <div className="p-6 bg-background rounded-[4px] border border-border">
                  <div className="flex items-baseline justify-center mb-4">
                    <div className="flex items-baseline">
                      <Input
                        type="number"
                        min={minBudget}
                        step={5000}
                        value={displayedBudget}
                        onChange={(e) => {
                          const val = Math.max(minBudget, parseInt(e.target.value) || minBudget);
                          setDisplayBudget(val);
                          setAnimatedBudget(val);
                          setLocalBudget(val);
                        }}
                        className="text-4xl font-bold text-right w-[180px] h-14 border-none shadow-none bg-transparent focus-visible:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-2xl font-medium text-muted-foreground ml-2 shrink-0">SEK</span>
                    </div>
                  </div>

                  {/* Slider */}
                  <Slider
                    value={[budgetToSlider(animatedBudget)]}
                    onValueChange={(value) => {
                      setIsDragging(true);
                      const newBudget = sliderToBudget(value[0]);
                      setDisplayBudget(newBudget);
                      setAnimatedBudget(newBudget);
                    }}
                    onValueCommit={(value) => {
                      setIsDragging(false);
                      const rawBudget = sliderToBudget(value[0]);
                      const snappedBudget = snapToFiveThousand(rawBudget);
                      setLocalBudget(snappedBudget);
                      // Animate to snapped value
                      animateTo(snappedBudget);
                    }}
                    min={0}
                    max={100}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>20,000 SEK</span>
                    <span>500,000 SEK</span>
                  </div>
                </div>
              </div>

              {/* Payment Tiers */}
              <div className="w-full max-w-md space-y-3">
                <Label className="text-sm text-muted-foreground">Creator Payment Tier</Label>
                <div className="flex gap-2">
                  {paymentTiers.map((tier, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant={selectedTier === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTier(index)}
                      className="flex-1 flex-col h-auto py-3"
                    >
                      <span className="font-bold">{tier.payout} SEK</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>
                Confirm Budget
              </Button>
            </div>
          </div>

          {/* Right Side - Guaranteed Results (2/3 width, full height) */}
          <div className="w-2/3 h-full p-8 flex flex-col bg-muted/30 overflow-hidden">
            {/* First Row - Creator Pool */}
            <div className="p-8 bg-black rounded-[4px] border border-border shrink-0 mb-4 flex flex-col items-start justify-center">
              <p className="text-sm text-white/70 mb-2">Creator Pool</p>
              <p className="text-5xl font-bold text-white">{creatorPool.toLocaleString()} SEK</p>
            </div>

            {/* Second Row - Views and Creators */}
            <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
              {/* Views */}
              <div className="p-8 bg-background rounded-[4px] border border-border flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground mb-2">Guaranteed Views</p>
                <p className="text-6xl font-bold text-foreground">{guaranteedViews.toLocaleString()}+</p>
              </div>

              {/* Creators */}
              <div className="p-8 bg-background rounded-[4px] border border-border flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground mb-2">Creators</p>
                <p className="text-6xl font-bold text-foreground">{guaranteedCreators}+</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetDialog;
