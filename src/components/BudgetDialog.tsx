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

const BudgetDialog: React.FC<BudgetDialogProps> = ({
  open,
  onOpenChange,
  budget,
  onBudgetChange,
}) => {
  const [localBudget, setLocalBudget] = useState(budget);

  useEffect(() => {
    if (open) {
      setLocalBudget(budget || 10000);
    }
  }, [open, budget]);

  const guaranteedViews = Math.floor((localBudget / 10000) * 100000);
  const guaranteedCreators = Math.floor((localBudget / 10000) * 10);

  const handleConfirm = () => {
    onBudgetChange(localBudget);
    onOpenChange(false);
  };

  const presetBudgets = [10000, 25000, 50000, 100000, 250000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen p-0 rounded-none border-none bg-background">
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-8 space-y-10">
              {/* Budget Input Section */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <Label className="text-sm text-muted-foreground">Total Budget</Label>
                  <div className="flex items-baseline justify-center gap-2">
                    <Input
                      type="number"
                      min={10000}
                      step={1000}
                      value={localBudget}
                      onChange={(e) => setLocalBudget(Math.max(10000, parseInt(e.target.value) || 10000))}
                      className="text-4xl font-bold text-center w-48 h-16 border-none shadow-none bg-transparent focus-visible:ring-0"
                    />
                    <span className="text-2xl font-medium text-muted-foreground">SEK</span>
                  </div>
                </div>

                {/* Slider */}
                <div className="px-4">
                  <Slider
                    value={[localBudget]}
                    onValueChange={(value) => setLocalBudget(value[0])}
                    min={10000}
                    max={500000}
                    step={5000}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>10,000 SEK</span>
                    <span>500,000 SEK</span>
                  </div>
                </div>

                {/* Preset Buttons */}
                <div className="flex flex-wrap justify-center gap-2">
                  {presetBudgets.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant={localBudget === preset ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLocalBudget(preset)}
                      className="rounded-full"
                    >
                      {preset.toLocaleString()} SEK
                    </Button>
                  ))}
                </div>
              </div>

              {/* Guaranteed Results Section */}
              <div className="bg-muted/50 rounded-xl p-8 space-y-6">
                <div className="flex items-center gap-2 justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Guaranteed Results</h3>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  {/* Views */}
                  <div className="text-center space-y-2 p-6 bg-background rounded-lg">
                    <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Eye className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-4xl font-bold text-foreground">
                      {guaranteedViews.toLocaleString()}+
                    </p>
                    <p className="text-sm text-muted-foreground">Guaranteed Views</p>
                  </div>

                  {/* Creators */}
                  <div className="text-center space-y-2 p-6 bg-background rounded-lg">
                    <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-4xl font-bold text-foreground">
                      {guaranteedCreators}+
                    </p>
                    <p className="text-sm text-muted-foreground">Creators</p>
                  </div>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  Based on 10,000 SEK = 100,000+ views • 10+ creators
                </p>
              </div>

              {/* Minimum notice */}
              <p className="text-center text-sm text-muted-foreground">
                Minimum budget: 10,000 SEK
              </p>
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
