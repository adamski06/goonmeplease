import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'jarla';
  content: string;
  displayedContent?: string;
}

const CampaignChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'jarla',
      content: "Hi! I'm here to help you design your campaign. Tell me about your brand and what you're looking to achieve.",
      displayedContent: "Hi! I'm here to help you design your campaign. Tell me about your brand and what you're looking to achieve."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    setInput('');
    setIsTyping(true);

    // Simulate AI response with typewriter effect
    setTimeout(() => {
      const responseContent = getSimulatedResponse(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'jarla',
        content: responseContent,
        displayedContent: ''
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Typewriter effect
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
    }, 500);
  };

  const getSimulatedResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('budget') || lowerInput.includes('cost')) {
      return "Great question! For UGC campaigns, I recommend starting with a budget that allows for at least 5-10 creator submissions. This gives you variety while keeping costs manageable. What's your rough budget range?";
    }
    if (lowerInput.includes('creator') || lowerInput.includes('influencer')) {
      return "Creator selection is key! Think about your target audience - do you want micro-creators (1K-10K followers) for authentic engagement, or larger creators for broader reach?";
    }
    if (lowerInput.includes('content') || lowerInput.includes('video')) {
      return "For content guidelines, be specific but not restrictive. Include: key messages to convey, any required hashtags or mentions, and example styles you like.";
    }
    return "That's helpful! Based on what you've shared, I'd suggest focusing on authentic, relatable content. Want me to help you write specific guidelines for creators?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background">
      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={msg.id}>
              {/* Show Jarla name for first message or after user message */}
              {msg.role === 'jarla' && (index === 0 || messages[index - 1]?.role === 'user') && (
                <div className="text-sm text-muted-foreground font-montserrat mb-1">Jarla</div>
              )}
              <div
                className={`transition-all duration-300 ${
                  msg.role === 'user'
                    ? 'bg-foreground text-background rounded-[3px] px-3 py-1.5 inline-block'
                    : 'text-foreground max-w-[85%]'
                }`}
              >
                {msg.role === 'jarla' ? (
                  <p className="font-geist text-base whitespace-pre-wrap">
                    {msg.displayedContent || msg.content}
                  </p>
                ) : (
                  <p className="font-geist text-xs">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {isTyping && messages[messages.length - 1]?.role === 'user' && (
            <div>
              <div className="text-sm text-muted-foreground font-montserrat mb-1">Jarla</div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input - matching signup chat style */}
      <div className="p-6 pt-0">
        <div className="relative max-w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your campaign..."
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
