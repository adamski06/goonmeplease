import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'jarla';
  content: string;
  displayedContent?: string;
}

interface BusinessProfile {
  company_name: string;
  description: string | null;
  website: string | null;
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
    }, 15);
  };

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user || initializedRef.current) return;
      initializedRef.current = true;

      const { data } = await supabase
        .from('business_profiles')
        .select('company_name, description, website')
        .eq('user_id', user.id)
        .single();

      let greeting: string;
      if (data) {
        setBusinessProfile(data);
        greeting = `Hey! Ready to create a new campaign for ${data.company_name}? Tell me what you want and I'll fill in the form for you.`;
      } else {
        greeting = "Hey! I can help you design your campaign. Tell me what you're promoting and I'll set everything up.";
      }

      const messageId = '1';
      setMessages([{
        id: messageId,
        role: 'jarla',
        content: greeting,
        displayedContent: ''
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
      const { data, error } = await supabase.functions.invoke('jarla-chat', {
        body: { 
          message: currentInput,
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
      
      // Apply any form updates from the AI
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
      }, 15);
    } catch (error) {
      console.error('Chat error:', error);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface">
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
                {msg.role === 'jarla' ? (
                  <p className="font-geist text-sm whitespace-pre-wrap">
                    {msg.displayedContent || msg.content}
                  </p>
                ) : (
                  <p className="font-geist text-xs">{msg.content}</p>
                )}
              </div>
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
            placeholder="Tell me about your campaign..."
            disabled={isTyping}
            className="w-full h-10 bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-full font-geist text-sm pl-4 pr-10"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-foreground text-background disabled:opacity-30 transition-opacity"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignChat;
