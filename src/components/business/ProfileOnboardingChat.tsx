import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Check } from 'lucide-react';
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
  const [confirmed, setConfirmed] = useState(false);
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

    const greeting = "What's your company name?";
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
    setConfirmed(true);

    try {
      const { error } = await supabase.functions.invoke('company-research', {
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
        content: "You're all set! Let's create your first campaign 🚀",
        displayedContent: ''
      };
      setMessages(prev => [...prev, doneMsg]);
      setIsTyping(true);
      typewriterEffect(doneMsg.id, doneMsg.content);

      setTimeout(() => onComplete(), 2000);
    } catch (error) {
      console.error('Save error:', error);
      setConfirmed(false);
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

  return (
    <div className="h-full flex flex-col bg-background max-w-xl mx-auto">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 flex flex-col justify-center"
      >
        <div className="space-y-4 py-6 max-w-full">
          {messages.map((msg, index) => {
            if (msg.role === 'jarla' && !msg.displayedContent) return null;

            return (
              <div key={msg.id}>
                {msg.role === 'jarla' && (index === 0 || messages[index - 1]?.role === 'user') && (
                  <div className="text-xs text-muted-foreground font-montserrat mb-1.5">Jarla</div>
                )}
                <div
                  className={`transition-all duration-300 ${
                    msg.role === 'user' ? 'flex justify-end' : ''
                  }`}
                >
                  {msg.role === 'user' ? (
                    <div className="bg-muted rounded-2xl rounded-br-sm px-3 py-2 max-w-[85%]">
                      <p className="font-geist text-sm text-foreground">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="max-w-[90%]">
                      <p className="font-geist text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {msg.displayedContent || msg.content}
                      </p>
                    </div>
                  )}
                </div>

                {/* Profile preview card with blue confirm button */}
                {msg.role === 'jarla' && msg.profileUpdates && msg.displayedContent === msg.content && (
                  <div className="mt-3 space-y-3 max-w-[85%]">
                    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2.5">
                      {msg.profileUpdates.company_name && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-muted-foreground shrink-0 w-20">Company</span>
                          <span className="text-sm text-foreground font-medium">{msg.profileUpdates.company_name}</span>
                        </div>
                      )}
                      {msg.profileUpdates.website && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-muted-foreground shrink-0 w-20">Website</span>
                          <span className="text-sm text-foreground">{msg.profileUpdates.website}</span>
                        </div>
                      )}
                      {msg.profileUpdates.industry && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-muted-foreground shrink-0 w-20">Industry</span>
                          <span className="text-sm text-foreground">{msg.profileUpdates.industry}</span>
                        </div>
                      )}
                      {msg.profileUpdates.description && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-muted-foreground shrink-0 w-20">About</span>
                          <span className="text-sm text-foreground">{msg.profileUpdates.description}</span>
                        </div>
                      )}
                      {msg.profileUpdates.target_audience && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-muted-foreground shrink-0 w-20">Audience</span>
                          <span className="text-sm text-foreground">{msg.profileUpdates.target_audience}</span>
                        </div>
                      )}
                      {msg.profileUpdates.brand_values && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-muted-foreground shrink-0 w-20">Values</span>
                          <span className="text-sm text-foreground">{msg.profileUpdates.brand_values}</span>
                        </div>
                      )}
                    </div>
                    {!confirmed && (
                      <button
                        onClick={handleConfirmProfile}
                        disabled={saving}
                        className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {saving ? 'Saving...' : "That's correct"}
                      </button>
                    )}
                    {confirmed && (
                      <div className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-blue-600/60 text-white/70 w-fit">
                        <Check className="h-3.5 w-3.5" />
                        Confirmed
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {isTyping && messages[messages.length - 1]?.role === 'user' && (
            <div>
              <div className="text-xs text-muted-foreground font-montserrat mb-1.5">Jarla</div>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4">
        <div className="relative rounded-xl border border-border bg-muted/50 shadow-sm focus-within:border-foreground/30 focus-within:shadow-md transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your company name..."
            disabled={isTyping || saving || confirmed}
            rows={1}
            className="w-full resize-none bg-transparent px-4 py-3 pr-12 text-sm font-geist text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = '44px';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || saving || confirmed}
            className="absolute right-2 bottom-2 h-7 w-7 flex items-center justify-center rounded-lg bg-foreground text-background disabled:opacity-20 transition-opacity hover:opacity-90"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileOnboardingChat;