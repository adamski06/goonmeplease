import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UsernameStepProps {
  userId: string;
  onComplete: () => void;
}

const UsernameStep: React.FC<UsernameStepProps> = ({ userId, onComplete }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = username.trim().toLowerCase();

    if (trimmed.length < 3) {
      toast({ title: 'Too short', description: 'Username must be at least 3 characters', variant: 'destructive' });
      return;
    }

    if (trimmed.length > 30) {
      toast({ title: 'Too long', description: 'Username must be under 30 characters', variant: 'destructive' });
      return;
    }

    if (!/^[a-z0-9._]+$/.test(trimmed)) {
      toast({ title: 'Invalid characters', description: 'Only letters, numbers, dots and underscores', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      // Check if username is taken
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmed)
        .maybeSingle();

      if (existing) {
        toast({ title: 'Taken', description: 'This username is already in use', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      // Update profile with username
      const { error } = await supabase
        .from('profiles')
        .update({ username: trimmed })
        .eq('user_id', userId);

      if (error) throw error;

      onComplete();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Choose a username</h2>
        <p className="text-sm text-muted-foreground">This is how others will find you</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-foreground text-sm font-medium">Username</Label>
        <div className="relative">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
          <Input
            id="username"
            type="text"
            placeholder="yourname"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
            required
            autoComplete="username"
            className="bg-transparent border-0 border-b border-foreground/20 rounded-none pl-5 pr-0 py-2 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground">Letters, numbers, dots and underscores only</p>
      </div>

      <Button
        type="submit"
        className="w-full py-3 h-auto rounded-full bg-foreground text-background hover:bg-foreground/80 font-semibold"
        disabled={isLoading || !username.trim()}
      >
        {isLoading ? 'Setting up...' : 'Get Started'}
      </Button>
    </form>
  );
};

export default UsernameStep;
