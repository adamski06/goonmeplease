import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Download } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from '@/hooks/use-toast';
import jarlaLogo from '@/assets/jarla-logo.png';

const AdminSettings = () => {
  const { label, convert } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [minPayout, setMinPayout] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('key', 'min_payout_amount')
        .maybeSingle();
      if (data) setMinPayout(data.value);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('platform_settings')
      .update({ value: minPayout, updated_at: new Date().toISOString() })
      .eq('key', 'min_payout_amount');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Platform settings updated.' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-montserrat font-semibold text-lg">Platform Settings</h2>

      <Card className="border-border">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Minimum Payout Amount (USD)</label>
            <p className="text-xs text-muted-foreground mb-2">
              ≈ {Math.floor(convert(parseFloat(minPayout) || 0))} {label}
            </p>
            <Input
              type="number"
              step="0.5"
              value={minPayout}
              onChange={(e) => setMinPayout(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Launch Screen Download */}
      <Card className="border-border">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">App Launch Screen</label>
            <p className="text-xs text-muted-foreground mb-3">
              White background with centered Jarla logo. Download as PNG for App Store submission.
            </p>
          </div>

          {/* Preview */}
          <div className="border border-border rounded-xl overflow-hidden w-48 aspect-[9/19.5] flex items-center justify-center bg-white mx-auto">
            <img src={jarlaLogo} alt="Jarla" className="w-[60%] object-contain" />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              const canvas = document.createElement('canvas');
              const size = 2732; // Apple's largest launch screen size
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext('2d');
              if (!ctx) return;

              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, size, size);

              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                const logoWidth = size * 0.35;
                const logoHeight = (img.height / img.width) * logoWidth;
                const x = (size - logoWidth) / 2;
                const y = (size - logoHeight) / 2;
                ctx.drawImage(img, x, y, logoWidth, logoHeight);

                canvas.toBlob((blob) => {
                  if (!blob) return;
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'LaunchScreen-2732x2732.png';
                  a.click();
                  URL.revokeObjectURL(url);
                }, 'image/png');
              };
              img.src = jarlaLogo;
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            Download Launch Screen (2732×2732)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
