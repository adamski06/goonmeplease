import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  logo_url?: string;
}

interface ProfileOnboardingChatProps {
  onComplete: () => void;
}

// Editable profile card with typewriter effect on all fields simultaneously
const ProfileCard: React.FC<{
  data: ProfileUpdates;
  onConfirm: (edited: ProfileUpdates) => void;
  saving: boolean;
  confirmed: boolean;
}> = ({ data, onConfirm, saving, confirmed }) => {
  const [editData, setEditData] = useState<ProfileUpdates>({});
  const [typed, setTyped] = useState<ProfileUpdates>({});
  const [doneTyping, setDoneTyping] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const startedRef = useRef(false);

  const fields: { key: keyof ProfileUpdates; label: string }[] = [
    { key: 'company_name', label: 'Company' },
    { key: 'website', label: 'Website' },
    { key: 'industry', label: 'Industry' },
    { key: 'description', label: 'About' },
    { key: 'target_audience', label: 'Audience' },
    { key: 'brand_values', label: 'Values' },
  ];

  

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Animate card in
    requestAnimationFrame(() => setCardVisible(true));

    // Type all fields simultaneously
    const activeFields = fields.filter(f => data[f.key]);
    const maxLen = Math.max(...activeFields.map(f => (data[f.key] || '').length));
    let i = 0;

    const interval = setInterval(() => {
      i++;
      const next: ProfileUpdates = {};
      let allDone = true;
      for (const f of activeFields) {
        const val = data[f.key] || '';
        next[f.key] = val.slice(0, i);
        if (i < val.length) allDone = false;
      }
      setTyped(next);
      if (allDone) {
        clearInterval(interval);
        setEditData({ ...data });
        setDoneTyping(true);
      }
    }, 5);

    return () => clearInterval(interval);
  }, [data]);

  const updateField = (key: keyof ProfileUpdates, value: string) => {
    setEditData(prev => ({ ...prev, [key]: value }));
  };

  const displayData = doneTyping ? editData : typed;
  const logoUrl = data.logo_url;
  const activeFields = fields.filter(f => data[f.key]);

  return (
    <div
      className={`mt-3 space-y-3 max-w-[85%] transition-all duration-500 ease-out ${
        cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2.5">
        {logoUrl && (
          <div className="flex items-center gap-3 pb-2 mb-2 border-b border-border/50">
            <img
              src={logoUrl}
              alt="Company logo"
              className="h-10 w-10 rounded-lg object-contain bg-background border border-border"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="text-sm font-medium text-foreground">{displayData.company_name || data.company_name}</span>
          </div>
        )}
        {activeFields.map(({ key, label }) => (
          <div key={key} className="flex gap-2">
            <span className="text-xs text-muted-foreground shrink-0 w-20 pt-0.5">{label}</span>
            <div className="flex-1 min-w-0">
              {doneTyping && !confirmed ? (
                <textarea
                  value={editData[key] || ''}
                  onChange={(e) => updateField(key, e.target.value)}
                  rows={1}
                  className="text-sm text-foreground bg-transparent border-none outline-none w-full font-geist focus:bg-muted/50 rounded px-1 -ml-1 transition-colors resize-none"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = 'auto';
                    t.style.height = t.scrollHeight + 'px';
                  }}
                  ref={(el) => {
                    if (el) {
                      el.style.height = 'auto';
                      el.style.height = el.scrollHeight + 'px';
                    }
                  }}
                />
              ) : (
                <p className={`text-sm text-foreground leading-relaxed ${key === 'company_name' ? 'font-medium' : ''}`}>
                  {displayData[key] || ''}
                  {!doneTyping && <span className="inline-block w-[1px] h-3.5 bg-foreground/60 ml-0.5 animate-pulse" />}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {doneTyping && !confirmed && (
        <button
          onClick={() => onConfirm(editData)}
          disabled={saving}
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 animate-fade-in"
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
  );
};

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

  const handleConfirmProfile = async (editedData: ProfileUpdates) => {
    setSaving(true);
    setConfirmed(true);

    try {
      const { error } = await supabase.functions.invoke('company-research', {
        body: {
          action: 'save',
          profileUpdates: editedData,
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

                {/* Profile card with typewriter + inline editing */}
                {msg.role === 'jarla' && msg.profileUpdates && msg.displayedContent === msg.content && (
                  <ProfileCard
                    data={msg.profileUpdates}
                    onConfirm={handleConfirmProfile}
                    saving={saving}
                    confirmed={confirmed}
                  />
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