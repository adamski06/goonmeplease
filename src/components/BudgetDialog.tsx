import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Users, Eye, Sparkles } from 'lucide-react';

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: number;
  onBudgetChange: (budget: number) => void;
}

const jarlaPricingPlans = [
  { name: 'Free', price: 0, feePercent: 50 },
  { name: 'Pro', price: 5000, feePercent: 25 },
  { name: 'Business', price: 9000, feePercent: 12.5 },
];

const paymentTiers = [
  { payout: 100, views: 3000 },
  { payout: 500, views: 15000 },
];

const BudgetDialog: React.FC<BudgetDialogProps> = ({
  open,
  onOpenChange,
  budget,
  onBudgetChange,
}) => {
  const [localBudget, setLocalBudget] = useState(budget);
  const [selectedTier, setSelectedTier] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(0);

  // Exponential scale helpers
  const minBudget = 15000;
  const maxBudget = 500000;
  const minLog = Math.log(minBudget);
  const maxLog = Math.log(maxBudget);

  const budgetToSlider = (budget: number) => {
    return ((Math.log(budget) - minLog) / (maxLog - minLog)) * 100;
  };

  const sliderToBudget = (sliderValue: number) => {
    const logValue = minLog + (sliderValue / 100) * (maxLog - minLog);
    return Math.round(Math.exp(logValue) / 1000) * 1000; // Round to nearest 1000
  };

  useEffect(() => {
    if (open) {
      setLocalBudget(budget || 15000);
    }
  }, [open, budget]);

  const currentTier = paymentTiers[selectedTier];
  const currentPlan = jarlaPricingPlans[selectedPlan];
  const budgetAfterFee = localBudget * (1 - currentPlan.feePercent / 100);
  const guaranteedCreators = Math.floor(budgetAfterFee / currentTier.payout);
  const guaranteedViews = guaranteedCreators * currentTier.views;

  const handleConfirm = () => {
    onBudgetChange(localBudget);
    onOpenChange(false);
  };

  const presetBudgets = [15000, 25000, 50000, 100000, 250000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 rounded-lg border border-border bg-background [&>button]:hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Set Campaign Budget</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content - Split Layout */}
          <div className="flex-1 overflow-y-auto">
            <div className="h-full grid grid-cols-1 md:grid-cols-2">
              {/* Left Side - Budget Controls */}
              <div className="p-8 flex flex-col items-center justify-center space-y-8 border-r border-border">
                {/* Jarla Pricing Plans */}
                <div className="w-full max-w-md space-y-3">
                  <Label className="text-sm text-muted-foreground">Jarla Plan</Label>
                  <div className="flex gap-2">
                    {jarlaPricingPlans.map((plan, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={selectedPlan === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPlan(index)}
                        className="flex-1 flex-col h-auto py-3"
                      >
                        <span className="font-bold">{plan.name}</span>
                        <span className="text-xs opacity-70">
                          {plan.price === 0 ? 'Free' : `${plan.price.toLocaleString()} SEK/mo`}
                        </span>
                        <span className="text-xs opacity-70">{plan.feePercent}% fee</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <Label className="text-sm text-muted-foreground">Total Budget</Label>
                  <div className="flex items-baseline justify-center gap-2">
                    <Input
                      type="number"
                      min={15000}
                      step={1000}
                      value={localBudget}
                      onChange={(e) => setLocalBudget(Math.max(15000, parseInt(e.target.value) || 15000))}
                      className="text-4xl font-bold text-center w-48 h-16 border-none shadow-none bg-transparent focus-visible:ring-0 p-0"
                    />
                    <span className="text-2xl font-medium text-muted-foreground">SEK</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Budget for creators: {budgetAfterFee.toLocaleString()} SEK ({100 - currentPlan.feePercent}%)
                  </p>
                </div>

                {/* Slider */}
                <div className="w-full max-w-md">
                  <Slider
                    value={[budgetToSlider(localBudget)]}
                    onValueChange={(value) => setLocalBudget(sliderToBudget(value[0]))}
                    min={0}
                    max={100}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>15,000 SEK</span>
                    <span>500,000 SEK</span>
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

              {/* Right Side - Guaranteed Results */}
              <div className="p-8 flex flex-col justify-center space-y-6 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Guaranteed Results</h3>
                </div>

                {/* Views */}
                <div className="p-6 bg-background rounded-lg border border-border space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">
                        {guaranteedViews.toLocaleString()}+
                      </p>
                      <p className="text-sm text-muted-foreground">Guaranteed Views</p>
                    </div>
                  </div>
                </div>

                {/* Creators */}
                <div className="p-6 bg-background rounded-lg border border-border space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">
                        {guaranteedCreators}+
                      </p>
                      <p className="text-sm text-muted-foreground">Creators</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {currentTier.payout} SEK per {currentTier.views.toLocaleString()} views • {currentPlan.feePercent}% Jarla fee
                </p>
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
      </DialogContent>
    </Dialog>
  );
};

export default BudgetDialog;
