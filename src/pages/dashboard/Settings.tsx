import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Link as LinkIcon, Trash2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddTikTokOpen, setIsAddTikTokOpen] = useState(false);
  const [tiktokUsername, setTiktokUsername] = useState('');
  const [tiktokUserId, setTiktokUserId] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: tiktokAccounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ['tiktok-accounts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tiktok_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { full_name?: string; username?: string; bio?: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Profile updated!' });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addTiktokMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('tiktok_accounts')
        .insert({
          user_id: user?.id,
          tiktok_username: tiktokUsername.replace('@', ''),
          tiktok_user_id: tiktokUserId || tiktokUsername.replace('@', ''),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'TikTok account added!' });
      setIsAddTikTokOpen(false);
      setTiktokUsername('');
      setTiktokUserId('');
      queryClient.invalidateQueries({ queryKey: ['tiktok-accounts', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add account',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteTiktokMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from('tiktok_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'TikTok account removed' });
      queryClient.invalidateQueries({ queryKey: ['tiktok-accounts', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to remove account',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile and connected accounts
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-white border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-lg bg-muted text-foreground">
                {user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">Email address</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Choose a username"
            />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          <Button 
            onClick={() => updateProfileMutation.mutate(formData)}
            disabled={updateProfileMutation.isPending}
            className="rounded-full"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* TikTok Accounts */}
      <Card className="bg-white border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <LinkIcon className="h-5 w-5" />
                TikTok Accounts
              </CardTitle>
              <CardDescription>
                Connect your TikTok accounts to submit content
              </CardDescription>
            </div>
            <Dialog open={isAddTikTokOpen} onOpenChange={setIsAddTikTokOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full">Add Account</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add TikTok Account</DialogTitle>
                  <DialogDescription>
                    Enter your TikTok username to link your account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>TikTok Username</Label>
                    <Input
                      value={tiktokUsername}
                      onChange={(e) => setTiktokUsername(e.target.value)}
                      placeholder="@yourusername"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>TikTok User ID (optional)</Label>
                    <Input
                      value={tiktokUserId}
                      onChange={(e) => setTiktokUserId(e.target.value)}
                      placeholder="Your TikTok user ID"
                    />
                    <p className="text-xs text-muted-foreground">
                      You can find this in your TikTok account settings
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddTikTokOpen(false)} className="rounded-full">
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => addTiktokMutation.mutate()}
                    disabled={!tiktokUsername || addTiktokMutation.isPending}
                    className="rounded-full"
                  >
                    {addTiktokMutation.isPending ? 'Adding...' : 'Add Account'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loadingAccounts ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-muted rounded" />
              ))}
            </div>
          ) : tiktokAccounts && tiktokAccounts.length > 0 ? (
            <div className="space-y-3">
              {tiktokAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white font-bold">
                      {account.tiktok_username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">@{account.tiktok_username}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.follower_count?.toLocaleString() || 0} followers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={account.is_active ? 'default' : 'secondary'}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTiktokMutation.mutate(account.id)}
                      disabled={deleteTiktokMutation.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <LinkIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No TikTok accounts connected</p>
              <p className="text-sm text-muted-foreground">Add an account to start submitting content</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
