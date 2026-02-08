import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onSwitchToSignUp: () => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onSwitchToSignUp, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: 'Validation Error', description: error.errors[0].message, variant: 'destructive' });
      }
      return;
    }
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Welcome back</h2>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signin-email" className="text-foreground text-sm font-medium">Email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 py-2 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signin-password" className="text-foreground text-sm font-medium">Password</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 py-2 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-foreground"
        />
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full py-3 h-auto rounded-full bg-foreground text-background hover:bg-foreground/80 font-semibold"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </div>

      <p className="text-center text-muted-foreground text-sm pt-2">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToSignUp} className="text-foreground underline hover:text-foreground/70">
          Sign up
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
