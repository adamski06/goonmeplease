import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, ExternalLink, RefreshCw, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  rewardAdId: string;
  sheetId: string | null;
  sheetUrl: string | null;
  onUpdated?: (id: string, url: string) => void;
  compact?: boolean;
}

const RewardCouponSheetPanel: React.FC<Props> = ({ rewardAdId, sheetId, sheetUrl, onUpdated, compact }) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState<'create' | 'sync' | null>(null);

  const createSheet = async () => {
    setBusy('create');
    try {
      const { data, error } = await supabase.functions.invoke('reward-sheet-create', { body: { rewardAdId } });
      if (error || data?.error) throw new Error(error?.message || data?.error);
      onUpdated?.(data.spreadsheetId, data.url);
      toast({ title: 'Kalkylark skapat', description: data.sharedWith ? `Delat med ${data.sharedWith}` : 'Du hittar det i Google Drive' });
    } catch (e: any) {
      toast({ title: 'Kunde inte skapa ark', description: e.message, variant: 'destructive' });
    } finally { setBusy(null); }
  };

  const syncSheet = async () => {
    setBusy('sync');
    try {
      const { data, error } = await supabase.functions.invoke('reward-sheet-sync', { body: { rewardAdId } });
      if (error || data?.error) throw new Error(error?.message || data?.error);
      toast({ title: 'Synkat', description: `${data.added} nya · ${data.total} totalt · ${data.unclaimed} tillgängliga` });
    } catch (e: any) {
      toast({ title: 'Synk misslyckades', description: e.message, variant: 'destructive' });
    } finally { setBusy(null); }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {sheetUrl ? (
          <>
            <Button size="sm" variant="outline" onClick={() => window.open(sheetUrl, '_blank')}>
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> Öppna
            </Button>
            <Button size="sm" variant="outline" onClick={syncSheet} disabled={busy === 'sync'}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${busy === 'sync' ? 'animate-spin' : ''}`} /> Synka
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={createSheet} disabled={busy === 'create'}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Skapa ark
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-semibold text-foreground">Kupong-kalkylark</h3>
      </div>
      {sheetUrl ? (
        <>
          <p className="text-xs text-muted-foreground">
            Klistra in koder i kolumn A. När en kreatör låser upp en kod markeras raden som <span className="font-mono">USED</span> automatiskt.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => window.open(sheetUrl, '_blank')} className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> Öppna kalkylark
            </Button>
            <Button size="sm" variant="outline" onClick={syncSheet} disabled={busy === 'sync'} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${busy === 'sync' ? 'animate-spin' : ''}`} /> Synka koder
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Skapa ett kalkylark som Jarla äger och delar med dig. Du fyller på med koder — synka när som helst för att importera dem.
          </p>
          <Button size="sm" onClick={createSheet} disabled={busy === 'create'} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Skapa Google-kalkylark
          </Button>
        </>
      )}
    </div>
  );
};

export default RewardCouponSheetPanel;
