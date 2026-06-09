import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Building2, ChevronRight, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ campaigns: 0, deals: 0, rewards: 0 });
  const [confirmDelete, setConfirmDelete] = useState<{ userId: string; companyName: string } | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const load = async () => {
    const [biz, camp, dl, rw] = await Promise.all([
      supabase.from('business_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('campaigns').select('id', { count: 'exact', head: true }),
      supabase.from('deals').select('id', { count: 'exact', head: true }),
      supabase.from('reward_ads').select('id', { count: 'exact', head: true }),
    ]);
    setBusinesses(biz.data || []);
    setStats({ campaigns: camp.count || 0, deals: dl.count || 0, rewards: rw.count || 0 });
    setLoading(false);
  };

  const deleteCompany = async () => {
    if (!confirmDelete) return;

    setDeletingCompany(confirmDelete.userId);
    try {
      const { error } = await supabase.functions.invoke('delete-account', {
        body: { target_user_id: confirmDelete.userId },
      });

      if (error) throw error;

      toast({ title: 'Company deleted' });
      setConfirmDelete(null);
      await load();
    } catch (e: any) {
      toast({ title: 'Failed to delete company', description: e.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setDeletingCompany(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Spread Ads', value: stats.campaigns },
          { label: 'Deals', value: stats.deals },
          { label: 'Rewards', value: stats.rewards },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold font-montserrat">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="font-montserrat font-semibold text-lg">Businesses ({businesses.length})</h2>

      <div className="space-y-2">
        {businesses.map((b) => (
          <Card
            key={b.id}
            className="border-border cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate(`/admin/business/${b.user_id}`)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              {b.logo_url ? (
                <img src={b.logo_url} alt="" className="h-10 w-10 rounded-full object-cover bg-muted" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{b.company_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {b.industry || 'No industry'} · {b.website || 'No website'} · Joined {format(new Date(b.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={deletingCompany === b.user_id}
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete({ userId: b.user_id, companyName: b.company_name });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}

        {businesses.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No businesses yet</p>
        )}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this company?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {confirmDelete?.companyName ? `"${confirmDelete.companyName}"` : 'this company'} and all of its ads, submissions, and account data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={deleteCompany}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
