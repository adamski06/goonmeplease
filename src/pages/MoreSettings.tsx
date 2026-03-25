import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

const MoreSettings: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      await signOut();
      navigate('/');
      toast({ title: 'Account deleted', description: 'Your account and data have been permanently deleted.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to delete account. Please try again.', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeleteInput('');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 animate-slide-in-right">
      <div className="flex flex-col border-b border-black/10 safe-area-top">
        <div className="flex items-center px-4 py-3 relative">
          <button onClick={() => navigate('/user/settings')} className="p-1 -ml-1">
            <ChevronLeft className="h-6 w-6 text-black" />
          </button>
          <span className="text-base font-semibold text-black flex-1 text-center pr-6">More</span>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-4">
        <h3 className="text-xs font-semibold text-black/40 uppercase tracking-wider font-montserrat mb-2 px-1">
          Danger Zone
        </h3>

        <button
          onClick={() => setShowDeleteDialog(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(239,68,68,0.04) 0%, rgba(239,68,68,0.08) 100%)',
            border: '1px solid rgba(239,68,68,0.1)',
          }}
        >
          <Trash2 className="h-5 w-5 text-red-400/70" />
          <span className="text-sm text-red-500/80 font-jakarta">Delete Account</span>
        </button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setDeleteInput(''); }}>
        <AlertDialogContent className="mx-4 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-montserrat">Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="font-jakarta text-sm space-y-2" asChild>
              <div>
                <p>This will permanently delete your account and all associated data including:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Your profile and personal information</li>
                  <li>All content submissions and earnings history</li>
                  <li>Connected TikTok accounts</li>
                </ul>
                <p className="font-medium text-destructive">This action cannot be undone.</p>
                <p className="mt-3">Type <span className="font-mono font-bold">DELETE</span> to confirm:</p>
                <Input
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE"
                  className="mt-2 font-mono"
                  autoComplete="off"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-jakarta">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting || deleteInput !== 'DELETE'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-jakarta disabled:opacity-40"
            >
              {deleting ? 'Deleting...' : 'Delete My Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MoreSettings;
