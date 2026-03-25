import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Shield, HelpCircle, FileText, LogOut, Pencil, Sun, Moon, Trash2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
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

const BusinessSettings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/business/auth');
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      await supabase.auth.signOut();
      navigate('/');
      toast({ title: 'Account deleted', description: 'Your account and data have been permanently deleted.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to delete account.', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeleteInput('');
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: Pencil, label: 'Edit Profile', action: () => navigate('/business/edit-profile') },
        { icon: Bell, label: 'Notifications', action: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', action: () => {} },
      ],
    },
    {
      title: 'Legal',
      items: [
        { icon: Shield, label: 'Privacy Policy', action: () => window.open('https://jarla.org/privacy', '_blank') },
        { icon: FileText, label: 'Terms of Service', action: () => window.open('https://jarla.org/terms', '_blank') },
      ],
    },
  ];

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground font-montserrat mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Appearance */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-montserrat mb-2 px-1">
            Appearance
          </h3>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
              border: '1px solid hsl(var(--border))',
              boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6)',
            }}
          >
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-accent/40 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-sm text-foreground font-jakarta flex-1">
                {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </span>
            </button>
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-montserrat mb-2 px-1">
              {section.title}
            </h3>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                border: '1px solid hsl(var(--border))',
                boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6)',
              }}
            >
              {section.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-accent/40 transition-colors ${
                    idx < section.items.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground font-jakarta flex-1">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors hover:opacity-90"
          style={{
            background: 'linear-gradient(180deg, hsl(0 84% 60% / 0.06) 0%, hsl(0 84% 60% / 0.10) 100%)',
            border: '1px solid hsl(0 84% 60% / 0.15)',
          }}
        >
          <LogOut className="h-5 w-5 text-destructive/70" />
          <span className="text-sm font-medium text-destructive font-jakarta">Sign Out</span>
        </button>

        <button
          onClick={() => setShowDeleteDialog(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors hover:opacity-90"
          style={{
            background: 'linear-gradient(180deg, hsl(0 84% 60% / 0.03) 0%, hsl(0 84% 60% / 0.06) 100%)',
            border: '1px solid hsl(0 84% 60% / 0.1)',
          }}
        >
          <Trash2 className="h-5 w-5 text-destructive/50" />
          <span className="text-sm text-destructive/70 font-jakarta">Delete Account</span>
        </button>

        <p className="text-center text-xs text-muted-foreground font-jakarta pt-2">Version 1.0.0</p>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setDeleteInput(''); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-montserrat">Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="font-jakarta text-sm space-y-2" asChild>
              <div>
                <p>This will permanently delete your account and all associated data including:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Your business profile and company information</li>
                  <li>All campaigns, deals, and reward ads</li>
                  <li>All submission data</li>
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

export default BusinessSettings;
