import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'jarla';
  content: string;
  displayedContent?: string;
  quickReplies?: string[];
}

interface BusinessProfile {
  company_name: string;
  description: string | null;
  website: string | null;
  industry: string | null;
  target_audience: string | null;
  brand_values: string | null;
}

interface FormData {
  brand_name: string;
  title: string;
  description: string;
  deadline: string;
  total_budget: number;
}

interface FormUpdates {
  title?: string;
  description?: string;
  total_budget?: number;
  deadline?: string;
  requirements?: string[];
}

interface CampaignChatProps {
  formData?: FormData;
  requirements?: string[];
  onFormUpdate?: (updates: Partial<FormData>) => void;
  onRequirementsUpdate?: (requirements: string[]) => void;
}

const CampaignChat: React.FC<CampaignChatProps> = ({ 
  formData, 
  requirements,
  onFormUpdate, 
  onRequirementsUpdate 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Typewriter effect helper
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
    const fetchBusinessProfile = async () => {
      if (!user || initializedRef.current) return;
      initializedRef.current = true;

      const { data } = await supabase
        .from('business_profiles')
        .select('company_name, description, website, industry, target_audience, brand_values')
        .eq('user_id', user.id)
        .single();

      let greeting: string;
      let quickReplies: string[] | undefined;
      if (data) {
        setBusinessProfile(data);
        // Build a product suggestion from company knowledge
        const productHint = data.description || data.industry || data.company_name;
        greeting = `What product or service do you want people to know about? Is it related to ${productHint}?`;
        quickReplies = [`Yes, ${data.company_name}`, 'Something else'];
      } else {
        greeting = "What product or service do you want people to know about?";
      }

      const messageId = '1';
      setMessages([{
        id: messageId,
        role: 'jarla',
        content: greeting,
        displayedContent: '',
        quickReplies
      }]);
      setIsTyping(true);
      
      setTimeout(() => {
        typewriterEffect(messageId, greeting);
      }, 300);
    };

    fetchBusinessProfile();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const applyFormUpdates = (updates: FormUpdates) => {
    if (!updates) return;
    
    const formUpdates: Partial<FormData> = {};
    
    if (updates.title !== undefined) formUpdates.title = updates.title;
    if (updates.description !== undefined) formUpdates.description = updates.description;
    if (updates.total_budget !== undefined) formUpdates.total_budget = updates.total_budget;
    if (updates.deadline !== undefined) formUpdates.deadline = updates.deadline;
    
    if (Object.keys(formUpdates).length > 0 && onFormUpdate) {
      onFormUpdate(formUpdates);
    }
    
    if (updates.requirements && onRequirementsUpdate) {
      onRequirementsUpdate(updates.requirements);
    }
  };

  const handleSendWithContent = async (content: string) => {
    if (!content.trim() || isTyping) return;

    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('jarla-chat', {
        body: { 
          message: content.trim(),
          companyName: businessProfile?.company_name,
          businessContext: businessProfile,
          conversationHistory: messages.slice(-6),
          currentFormData: formData ? {
            ...formData,
            requirements: requirements?.filter(r => r.trim())
          } : null
        }
      });

      if (error) throw error;

      const responseContent = data?.response || "I'd love to help with that! Could you tell me more?";
      
      if (data?.formUpdates) {
        applyFormUpdates(data.formUpdates);
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'jarla',
        content: responseContent,
        displayedContent: ''
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
    } catch (err) {
      console.error('Chat error:', err);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'jarla',
        content: "Sorry, I had trouble responding. Could you try again?",
        displayedContent: "Sorry, I had trouble responding. Could you try again?"
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

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

    await handleSendWithContent(currentInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Messages - centered vertically when few messages */}
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
                  msg.role === 'user'
                    ? 'flex justify-end'
                    : ''
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
              {/* Quick reply buttons */}
              {msg.role === 'jarla' && msg.quickReplies && msg.displayedContent === msg.content && !isTyping && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => {
                        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, quickReplies: undefined } : m));
                        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: reply };
                        setMessages(prev => [...prev, userMsg]);
                        handleSendWithContent(reply);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/50 text-foreground hover:bg-muted transition-colors font-geist"
                    >
                      {reply}
                    </button>
                  ))}
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

      {/* Input - Lovable style */}
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
            placeholder="Ask Jarla anything..."
            disabled={isTyping}
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
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bottom-2 h-7 w-7 flex items-center justify-center rounded-lg bg-foreground text-background disabled:opacity-20 transition-opacity hover:opacity-90"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignChat;
