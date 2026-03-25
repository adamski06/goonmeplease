import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Support: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !message.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from('support_requests').insert({
        user_id: user.id,
        subject: subject.trim(),
        message: message.trim(),
        submission_type: 'general',
      });
      if (error) throw error;
      toast({ title: 'Message sent', description: 'We\'ll get back to you as soon as possible.' });
      setSubject('');
      setMessage('');
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to send message. Please try again.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex flex-col border-b border-border safe-area-top">
        <div className="flex items-center px-4 py-3 relative">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
          <span className="text-base font-semibold text-foreground flex-1 text-center pr-6 font-montserrat">Contact Support</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-6 space-y-4 max-w-lg mx-auto">
        <p className="text-sm text-muted-foreground font-jakarta">
          Have a question or issue? Send us a message and we'll get back to you.
        </p>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-montserrat mb-1.5 block">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What's this about?"
            required
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm text-foreground font-jakarta placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-montserrat mb-1.5 block">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or question..."
            required
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm text-foreground font-jakarta placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={sending || !subject.trim() || !message.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-foreground text-background text-sm font-semibold font-jakarta disabled:opacity-50 transition-opacity"
        >
          <Send className="h-4 w-4" />
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default Support;
