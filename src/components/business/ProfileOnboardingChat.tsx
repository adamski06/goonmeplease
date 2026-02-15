import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'jarla';
  content: string;
  displayedContent?: string;
  profileUpdates?: ProfileUpdates | null;
}

interface ProfileUpdates {
  company_name?: string;
  description?: string;
  website?: string;
  industry?: string;
  target_audience?: string;
  brand_values?: string;
}

interface ProfileOnboardingChatProps {
  onComplete: () => void;
}

const ProfileOnboardingChat: React.FC<ProfileOnboardingChatProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<ProfileUpdates | null>(null);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const typewriterEffect = (messageId: string, content: string) => {
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      charIndex++;
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, displayedContent: content.slice(0, charIndex) }
          : msg
      ));
      if (charIndex >= content.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 8);
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const greeting = "Hey! I'm Jarla — let's get your business profile set up. What's your company name?";
    const messageId = '1';
    setMessages([{
      id: messageId,
      role: 'jarla',
      content: greeting,
      displayedContent: ''
    }]);
    setIsTyping(true);
    setTimeout(() => typewriterEffect(messageId, greeting), 300);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('company-research', {
        body: {
          message: currentInput,
          conversationHistory: messages.slice(-10),
        }
      });

      if (error) throw error;

      const responseContent = data?.response || "Could you tell me more?";

      if (data?.profileUpdates) {
        setPendingUpdates(data.profileUpdates);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'jarla',
        content: responseContent,
        displayedContent: '',
        profileUpdates: data?.profileUpdates || null
      };
      setMessages(prev => [...prev, assistantMessage]);

      let charIndex = 0;
      const typeInterval = setInterval(() => {
        charIndex++;
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, displayedContent: responseContent.slice(0, charIndex) }
            : msg
        ));
        if (charIndex >= responseContent.length) {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 8);
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'jarla',
        content: "Sorry, something went wrong. Try again?",
        displayedContent: "Sorry, something went wrong. Try again?"
      }]);
    }
  };

  const handleConfirmProfile = async () => {
    if (!pendingUpdates) return;
    setSaving(true);

    try {
      const { data, error } = await supabase.functions.invoke('company-research', {
        body: {
          action: 'save',
          profileUpdates: pendingUpdates,
          message: '',
          conversationHistory: []
        }
      });

      if (error) throw error;

      const doneMsg: Message = {
        id: Date.now().toString(),
        role: 'jarla',
        content: "All set! Your profile is ready. Let's create your first campaign! 🚀",
        displayedContent: ''
      };
      setMessages(prev => [...prev, doneMsg]);
      setIsTyping(true);
      typewriterEffect(doneMsg.id, doneMsg.content);

      setTimeout(() => onComplete(), 2000);
    } catch (error) {
      console.error('Save error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'jarla',
        content: "Failed to save. Please try again.",
        displayedContent: "Failed to save. Please try again."
      }]);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col justify-end"
      >
        <div className="space-y-4">
          {messages.map((msg, index) => {
            if (msg.role === 'jarla' && !msg.displayedContent) return null;

            return (
              <div key={msg.id}>
                {msg.role === 'jarla' && (index === 0 || messages[index - 1]?.role === 'user') && (
                  <div className="text-xs text-muted-foreground font-montserrat mb-1">Jarla</div>
                )}
                <div
                  className={`transition-all duration-300 ${
                    msg.role === 'user'
                      ? 'bg-foreground text-background rounded-[3px] px-2 py-1 inline-block'
                      : 'text-foreground max-w-[85%]'
                  }`}
                >
                  <p className={`font-geist whitespace-pre-wrap ${msg.role === 'user' ? 'text-xs' : 'text-sm'}`}>
                    {msg.role === 'jarla' ? (msg.displayedContent || msg.content) : msg.content}
                  </p>
                </div>

                {/* Profile preview card */}
                {msg.role === 'jarla' && msg.profileUpdates && msg.displayedContent === msg.content && (
                  <div className="mt-3 rounded-lg border border-border bg-card p-4 max-w-[85%] space-y-2">
                    <h4 className="text-xs font-semibold text-foreground font-montserrat">Profile Preview</h4>
                    {msg.profileUpdates.company_name && (
                      <div><span className="text-xs text-muted-foreground">Company:</span> <span className="text-xs text-foreground">{msg.profileUpdates.company_name}</span></div>
                    )}
                    {msg.profileUpdates.description && (
                      <div><span className="text-xs text-muted-foreground">About:</span> <span className="text-xs text-foreground">{msg.profileUpdates.description}</span></div>
                    )}
                    {msg.profileUpdates.website && (
                      <div><span className="text-xs text-muted-foreground">Website:</span> <span className="text-xs text-foreground">{msg.profileUpdates.website}</span></div>
                    )}
                    {msg.profileUpdates.industry && (
                      <div><span className="text-xs text-muted-foreground">Industry:</span> <span className="text-xs text-foreground">{msg.profileUpdates.industry}</span></div>
                    )}
                    {msg.profileUpdates.target_audience && (
                      <div><span className="text-xs text-muted-foreground">Target Audience:</span> <span className="text-xs text-foreground">{msg.profileUpdates.target_audience}</span></div>
                    )}
                    {msg.profileUpdates.brand_values && (
                      <div><span className="text-xs text-muted-foreground">Brand Values:</span> <span className="text-xs text-foreground">{msg.profileUpdates.brand_values}</span></div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="h-7 text-xs gap-1" onClick={handleConfirmProfile} disabled={saving}>
                        <Check className="h-3 w-3" />
                        {saving ? 'Saving...' : 'Looks good, save it'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {isTyping && messages[messages.length - 1]?.role === 'user' && (
            <div>
              <div className="text-xs text-muted-foreground font-montserrat mb-1">Jarla</div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-6 pt-0">
        <div className="relative max-w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type here..."
            disabled={isTyping || saving}
            className="w-full h-10 bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-full font-geist text-sm pl-4 pr-10"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || saving}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-foreground text-background disabled:opacity-30 transition-opacity"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileOnboardingChat;
