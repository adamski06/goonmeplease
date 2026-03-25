import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { ChevronLeft, ChevronRight, LogOut, Shield, HelpCircle, FileText, MessageCircle, ExternalLink, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    navigate('/user/auth');
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
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
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', action: () => navigate('/user/edit-profile') },
        { icon: Bell, label: 'Notifications', action: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: MessageCircle, label: 'Contact Support', action: () => navigate('/user/support') },
        { icon: HelpCircle, label: 'Help Center', action: () => {} },
      ],
    },
    {
      title: 'Legal',
      items: [
        { icon: Shield, label: 'Privacy Policy', action: () => window.open('https://jarla.org/privacy', '_blank'), external: true },
        { icon: FileText, label: 'Terms of Service', action: () => window.open('https://jarla.org/terms', '_blank'), external: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="flex flex-col border-b border-black/10 safe-area-top">
        <div className="flex items-center px-4 py-3 relative">
          <button onClick={() => navigate('/user/profile')} className="p-1 -ml-1">
            <ChevronLeft className="h-6 w-6 text-black" />
          </button>
          <span className="text-base font-semibold text-black flex-1 text-center pr-6">Settings</span>
        </div>
      </div>

      {/* Account info */}
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-black/5 flex items-center justify-center">
            <User className="h-5 w-5 text-black/40" />
          </div>
          <div>
            <p className="text-sm font-semibold text-black font-montserrat">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-black/50 font-jakarta">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Settings sections */}
      <div className="px-4 space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-black/40 uppercase tracking-wider font-montserrat mb-2 px-1">
              {section.title}
            </h3>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              {section.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${
                    idx < section.items.length - 1 ? 'border-b border-black/5' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5 text-black/40" />
                  <span className="text-sm text-black font-jakarta flex-1">{item.label}</span>
                  {(item as any).external ? (
                    <ExternalLink className="h-4 w-4 text-black/20" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-black/20" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.1) 100%)',
            border: '1px solid rgba(239,68,68,0.1)',
          }}
        >
          <LogOut className="h-5 w-5 text-red-500/70" />
          <span className="text-sm font-medium text-red-600 font-jakarta">Sign Out</span>
        </button>

        {/* Delete account */}
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(239,68,68,0.03) 0%, rgba(239,68,68,0.06) 100%)',
            border: '1px solid rgba(239,68,68,0.08)',
          }}
        >
          <Trash2 className="h-5 w-5 text-red-400/60" />
          <span className="text-sm text-red-500/80 font-jakarta">Delete Account</span>
        </button>

        <p className="text-center text-xs text-black/30 font-jakarta pt-2 pb-8">
          Version 1.0.0
        </p>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="mx-4 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-montserrat">Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="font-jakarta text-sm space-y-2">
              <p>This will permanently delete your account and all associated data including:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Your profile and personal information</li>
                <li>All content submissions and earnings history</li>
                <li>Connected TikTok accounts</li>
              </ul>
              <p className="font-medium text-destructive">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-jakarta">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-jakarta"
            >
              {deleting ? 'Deleting...' : 'Delete My Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
