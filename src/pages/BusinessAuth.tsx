import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Loader2, X, Send, Check, Instagram, Facebook, Youtube, Twitter, Linkedin } from 'lucide-react';
import jarlaLogo from '@/assets/jarla-logo.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos',
  'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
  'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea',
  'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela',
  'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const AGE_RANGES = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourcompany' },
  { id: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourcompany' },
  { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourcompany' },
  { id: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/yourcompany' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourcompany' },
  { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourcompany' },
  { id: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/yourcompany' },
  { id: 'snapchat', label: 'Snapchat', placeholder: 'https://snapchat.com/add/yourcompany' },
];

type ChatStep = 'website' | 'socials' | 'analyzing' | 'confirm-summary' | 'edit-summary' | 'confirm-profile' | 'creating-profile' | 'profile-feedback' | 'description' | 'location' | 'products' | 'audience' | 'age-range' | 'reach' | 'credentials' | 'complete';

interface ChatMessage {
  id: string;
  role: 'jarla' | 'user' | 'noted';
  content: string;
  displayedContent?: string;
  isTyping?: boolean;
  type?: 'text' | 'text-input' | 'social-picker' | 'country-picker' | 'age-picker' | 'reach-picker' | 'credentials-form' | 'analyzing' | 'summary-section' | 'summary-heading' | 'summary-paragraph' | 'confirm-buttons' | 'profile-confirm-buttons' | 'profile-feedback-buttons';
  inputPlaceholder?: string;
  inputStep?: ChatStep;
  heading?: string;
}

const BusinessAuth: React.FC = () => {
  const [mode, setMode] = useState<'intro' | 'chat' | 'login'>('intro');
  const [companyName, setCompanyName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatStep, setChatStep] = useState<ChatStep>('website');
  const [inlineInputValue, setInlineInputValue] = useState('');
  const [bottomInputValue, setBottomInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Collected data
  const [website, setWebsite] = useState('');
  const [socialMedia, setSocialMedia] = useState<Record<string, string>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('');
  const [productsServices, setProductsServices] = useState('');
  const [audienceDescription, setAudienceDescription] = useState('');
  const [ageRanges, setAgeRanges] = useState<string[]>([]);
  const [globalReach, setGlobalReach] = useState<'worldwide' | 'specific'>('worldwide');
  const [targetCountries, setTargetCountries] = useState<string[]>([]);

  // Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companySummary, setCompanySummary] = useState('');
  const [companyBrandColor, setCompanyBrandColor] = useState<string | null>(null);
  const [profileTypedDescription, setProfileTypedDescription] = useState('');
  const [profileTypingComplete, setProfileTypingComplete] = useState(false);

  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  // Scroll to bottom of chat only when Jarla is typing
  useEffect(() => {
    if (isTyping) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isTyping]);
  
  // Also scroll when new Jarla message appears
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'jarla') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus chat input when entering chat mode
  useEffect(() => {
    if (mode === 'chat' && chatStep === 'website') {
      setTimeout(() => chatInputRef.current?.focus(), 500);
    }
  }, [mode, chatStep]);

  // Typewriter effect for intro
  useEffect(() => {
    if (mode === 'intro') {
      setShowNameInput(false);
      setTypewriterText('');
      
      const placeholderText = i18n.language === 'sv' ? 'Företagsnamn' : 'Company name';
      
      let charIndex = 0;
      let typeTimer: ReturnType<typeof setInterval>;
      
      const showTimer = setTimeout(() => {
        setShowNameInput(true);
        setTimeout(() => inputRef.current?.focus(), 600);
        
        typeTimer = setInterval(() => {
          if (charIndex <= placeholderText.length) {
            setTypewriterText(placeholderText.slice(0, charIndex));
            charIndex++;
          } else {
            clearInterval(typeTimer);
          }
        }, 100);
      }, 500);
      
      return () => {
        clearTimeout(showTimer);
        if (typeTimer) clearInterval(typeTimer);
      };
    }
  }, [mode, i18n.language]);

  // Typewriter effect for messages (no cursor)
  const typeMessage = (messageId: string, fullContent: string, onComplete?: () => void) => {
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      charIndex += 2; // Type 2 chars at a time for speed
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, displayedContent: fullContent.slice(0, charIndex), isTyping: charIndex < fullContent.length }
          : msg
      ));
      if (charIndex >= fullContent.length) {
        clearInterval(typeInterval);
        setTimeout(() => onComplete?.(), 100);
      }
    }, 25);
  };

  // Add Jarla message with typewriter effect
  const addJarlaMessage = (content: string, type: ChatMessage['type'] = 'text', onComplete?: () => void) => {
    setIsTyping(true);
    setTimeout(() => {
      const messageId = Date.now().toString();
      setMessages(prev => [...prev, {
        id: messageId,
        role: 'jarla',
        content,
        displayedContent: '',
        isTyping: true,
        type
      }]);
      setIsTyping(false);
      typeMessage(messageId, content, onComplete);
    }, 300);
  };

  // Add Jarla message with input field
  const addJarlaMessageWithInput = (content: string, placeholder: string, step: ChatStep) => {
    setIsTyping(true);
    setTimeout(() => {
      const messageId = Date.now().toString();
      setMessages(prev => [...prev, {
        id: messageId,
        role: 'jarla',
        content,
        displayedContent: '',
        isTyping: true,
        type: 'text-input',
        inputPlaceholder: placeholder,
        inputStep: step
      }]);
      setIsTyping(false);
      typeMessage(messageId, content);
    }, 300);
  };

  // Start chat after company name
  const startChat = () => {
    if (!companyName.trim()) return;
    setMode('chat');
    setTimeout(() => {
      addJarlaMessage(
        i18n.language === 'sv' 
          ? `Trevligt att träffas, ${companyName}! Vi skulle vilja lära känna ert företag lite bättre.`
          : `Nice to meet you, ${companyName}! We'd love to get to know your company a bit better.`,
        'text',
        () => {
          setTimeout(() => {
            addJarlaMessageWithInput(
              i18n.language === 'sv' 
                ? 'Har ni en webbplats?'
                : "Does it have a website?",
              'https://yourcompany.com',
              'website'
            );
          }, 500);
        }
      );
    }, 300);
  };

  // Handle general chat message (questions, etc) - now AI powered
  const handleChatMessage = async (value: string) => {
    if (!value.trim()) return;
    
    const userMessage = value.trim();
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage
    }]);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Call Jarla AI
      const { data, error } = await supabase.functions.invoke('jarla-chat', {
        body: { message: userMessage, companyName }
      });
      
      setIsTyping(false);
      
      if (error) throw error;
      
      const aiResponse = data?.response || "Let me help you with that!";
      addJarlaMessage(aiResponse);
      
    } catch (error) {
      console.error('Jarla chat error:', error);
      setIsTyping(false);
      
      // Fallback response
      const fallbackResponses = i18n.language === 'sv' 
        ? ['Bra fråga! Låt oss fortsätta med registreringen.']
        : ["Great question! Let's continue with your setup."];
      addJarlaMessage(fallbackResponses[0]);
    }
  };

  // Handle inline input submit - show noted confirmation
  const handleInlineSubmit = (value: string, step: ChatStep) => {
    if (!value.trim()) return;

    const userMessage = value.trim();
    
    // Add a "noted" confirmation
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'noted',
      content: userMessage
    }]);

    // Process based on current step
    switch (step) {
      case 'website':
        setWebsite(userMessage);
        setChatStep('socials');
        // First compliment the domain, then ask about social media
        const domainCompliment = i18n.language === 'sv'
          ? 'Vilken fin domän!'
          : 'What a beautiful domain!';
        
        setTimeout(() => {
          addJarlaMessage(domainCompliment, 'text', () => {
            setTimeout(() => {
              addJarlaMessage(
                i18n.language === 'sv'
                  ? `Finns ${companyName} på några sociala medier?`
                  : `Is ${companyName} on any social media platforms?`,
                'social-picker'
              );
            }, 400);
          });
        }, 500);
        break;

      case 'description':
        setDescription(userMessage);
        setChatStep('location');
        setTimeout(() => {
          addJarlaMessage(
            i18n.language === 'sv'
              ? 'Var är ni baserade?'
              : 'Where are you based?',
            'country-picker'
          );
        }, 500);
        break;

      case 'products':
        setProductsServices(userMessage);
        setChatStep('audience');
        setTimeout(() => {
          addJarlaMessageWithInput(
            i18n.language === 'sv'
              ? 'Beskriv er målgrupp - vilka är era kunder?'
              : 'Describe your target audience - who are your customers?',
            i18n.language === 'sv' ? 'Beskriv din målgrupp...' : 'Describe your audience...',
            'audience'
          );
        }, 500);
        break;

      case 'audience':
        setAudienceDescription(userMessage);
        setChatStep('age-range');
        setTimeout(() => {
          addJarlaMessage(
            i18n.language === 'sv'
              ? 'Vilka åldersgrupper riktar ni er mot?'
              : 'Which age groups are you targeting?',
            'age-picker'
          );
        }, 500);
        break;

      case 'edit-summary':
        handleEditSummarySubmit(userMessage);
        break;
    }
  };

  // Handle social media step completion - trigger company analysis
  const handleSocialsComplete = async () => {
    const socialCount = Object.keys(socialMedia).filter(k => socialMedia[k]).length;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: socialCount > 0 
        ? `${socialCount} ${i18n.language === 'sv' ? 'plattformar tillagda' : 'platforms added'}`
        : i18n.language === 'sv' ? 'Inga sociala medier' : 'No social media'
    }]);
    
    setChatStep('analyzing');
    
    // Show analyzing message
    setTimeout(() => {
      addJarlaMessage(
        i18n.language === 'sv'
          ? `Perfekt! Låt mig skicka ut mina agenter för att lära känna ${companyName} bättre...`
          : `Perfect! Let me send out my agents to learn more about ${companyName}...`,
        'analyzing'
      );
    }, 500);

    // Call the analysis edge function
    try {
      const { data, error } = await supabase.functions.invoke('analyze-company', {
        body: {
          website,
          socialMedia,
          companyName,
          language: i18n.language
        }
      });

      if (error) throw error;

      if (data?.success && data?.data?.summary) {
        // Store logo, brand color, and summary for profile preview
        if (data.data.logo) {
          setCompanyLogo(data.data.logo);
        }
        if (data.data.brandColor) {
          setCompanyBrandColor(data.data.brandColor);
        }
        setCompanySummary(data.data.summary);
        
        // Parse summary into sections and add each as separate message
        const summary = data.data.summary;
        const sections = summary.split(/\*\*(.+?)\*\*/).filter((s: string) => s.trim());
        
        // Group into heading + content pairs
        const sectionPairs: { heading: string; content: string }[] = [];
        for (let i = 0; i < sections.length; i += 2) {
          if (sections[i] && sections[i + 1]) {
            sectionPairs.push({
              heading: sections[i].trim(),
              content: sections[i + 1].trim()
            });
          }
        }

        // Add each section with delay (heading + paragraph together in one node)
        let delay = 500;
        sectionPairs.forEach((section, index) => {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: `section-${Date.now()}-${index}`,
              role: 'jarla',
              content: section.content,
              displayedContent: section.content,
              type: 'summary-section',
              heading: section.heading
            }]);
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, delay);
          delay += 300;
        });

        // After all sections, ask for confirmation
        setTimeout(() => {
          addJarlaMessage(
            i18n.language === 'sv'
              ? 'Stämmer det här?'
              : 'Was this correct?',
            'confirm-buttons'
          );
          setChatStep('confirm-summary');
        }, delay + 500);
      } else {
        throw new Error('No summary returned');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback to manual flow if analysis fails
      setTimeout(() => {
        addJarlaMessage(
          i18n.language === 'sv'
            ? 'Jag kunde inte analysera era sidor just nu. Låt oss fortsätta manuellt!'
            : "I couldn't analyze your pages right now. Let's continue manually!",
          'text',
          () => {
            setTimeout(() => {
              addJarlaMessageWithInput(
                i18n.language === 'sv'
                  ? `Berätta kort om ${companyName} - vad gör ni?`
                  : `Tell me briefly about ${companyName} - what do you do?`,
                i18n.language === 'sv' ? 'Beskriv ditt företag...' : 'Describe your company...',
                'description'
              );
              setChatStep('description');
            }, 500);
          }
        );
      }, 1000);
    }
  };

  // Handle country selection
  const handleCountrySelect = (selectedCountry: string) => {
    setCountry(selectedCountry);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: selectedCountry
    }]);
    setChatStep('products');
    setTimeout(() => {
      addJarlaMessageWithInput(
        i18n.language === 'sv'
          ? 'Vilka produkter eller tjänster erbjuder ni?'
          : 'What products or services do you offer?',
        i18n.language === 'sv' ? 'Produkter eller tjänster...' : 'Products or services...',
        'products'
      );
    }, 500);
  };

  // Handle age range selection complete
  const handleAgeRangeComplete = () => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: ageRanges.join(', ')
    }]);
    setChatStep('reach');
    setTimeout(() => {
      addJarlaMessage(
        i18n.language === 'sv'
          ? 'Verkar ni globalt eller i specifika länder?'
          : 'Do you operate globally or in specific countries?',
        'reach-picker'
      );
    }, 500);
  };

  // Handle summary confirmation
  const handleSummaryConfirm = (confirmed: boolean) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: confirmed 
        ? (i18n.language === 'sv' ? 'Ja, det stämmer!' : "Yes, that's correct!")
        : (i18n.language === 'sv' ? 'Nej, det stämmer inte' : "No, that's not right")
    }]);
    
    if (confirmed) {
      // Ask if ready to create profile
      setChatStep('confirm-profile');
      setTimeout(() => {
        addJarlaMessage(
          i18n.language === 'sv'
            ? 'Är du redo att skapa en företagsprofil som kreatörer kan se?'
            : 'Are you ready to create a company profile for creators to see?',
          'profile-confirm-buttons'
        );
      }, 500);
    } else {
      // Just show message, user types in bottom input
      setChatStep('edit-summary');
      setTimeout(() => {
        addJarlaMessage(
          i18n.language === 'sv'
            ? 'Vad fick jag fel? Berätta så uppdaterar jag det.'
            : "What did I get wrong? Tell me and I'll update it.",
          'text'
        );
      }, 500);
    }
  };

  // Handle edit summary submission
  const handleEditSummarySubmit = (correction: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: correction
    }]);
    
    // Acknowledge the correction and proceed to profile confirmation
    setChatStep('confirm-profile');
    setTimeout(() => {
      addJarlaMessage(
        i18n.language === 'sv'
          ? 'Tack för förtydligandet! Är du redo att skapa en företagsprofil som kreatörer kan se?'
          : "Thanks for clarifying! Are you ready to create a company profile for creators to see?",
        'profile-confirm-buttons'
      );
    }, 500);
  };

  // Handle profile creation confirmation
  const handleProfileConfirm = (confirmed: boolean) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: confirmed 
        ? (i18n.language === 'sv' ? 'Ja, skapa profilen!' : "Yes, create the profile!")
        : (i18n.language === 'sv' ? 'Nej, inte nu' : "No, not now")
    }]);
    
    if (confirmed) {
      // First move chat to left
      setShowProfilePreview(true);
      setChatStep('creating-profile');
      setProfileTypedDescription('');
      setProfileTypingComplete(false);
      
      // After chat has moved (700ms), fade in the profile and start typing
      setTimeout(() => {
        setProfileVisible(true);
        
        // Start typewriter effect for description
        const text = companySummary.split('**')[2]?.trim() || companySummary;
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const fullDescription = sentences.slice(0, 2).join(' ').trim();
        
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          charIndex += 2;
          setProfileTypedDescription(fullDescription.slice(0, charIndex));
          if (charIndex >= fullDescription.length) {
            clearInterval(typeInterval);
            setProfileTypingComplete(true);
            
            // After typing is complete, ask for feedback
            setTimeout(() => {
              setChatStep('profile-feedback');
              addJarlaMessage(
                i18n.language === 'sv'
                  ? 'Här är din företagsprofil! Ser det bra ut?'
                  : "Here's your company profile! Does it look good?",
                'profile-feedback-buttons'
              );
            }, 400);
          }
        }, 20);
      }, 700);
    } else {
      // Skip profile preview, go directly to credentials
      setChatStep('credentials');
      setTimeout(() => {
        addJarlaMessage(
          i18n.language === 'sv'
            ? 'Inga problem! Låt oss skapa ditt konto.'
            : "No problem! Let's create your account.",
          'credentials-form'
        );
      }, 500);
    }
  };

  // Handle profile feedback
  const handleProfileFeedback = (approved: boolean) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: approved 
        ? (i18n.language === 'sv' ? 'Ja, det ser bra ut!' : "Yes, looks great!")
        : (i18n.language === 'sv' ? 'Jag vill ändra något' : "I'd like to change something")
    }]);
    
    if (approved) {
      setChatStep('credentials');
      setTimeout(() => {
        addJarlaMessage(
          i18n.language === 'sv'
            ? 'Perfekt! Nu behöver vi bara skapa ditt konto.'
            : "Perfect! Now we just need to create your account.",
          'credentials-form'
        );
      }, 500);
    } else {
      // Let them edit via chat
      setChatStep('edit-summary');
      setTimeout(() => {
        addJarlaMessage(
          i18n.language === 'sv'
            ? 'Vad skulle du vilja ändra?'
            : "What would you like to change?",
          'text'
        );
      }, 500);
    }
  };

  // Handle reach selection complete
  const handleReachComplete = () => {
    const reachText = globalReach === 'worldwide' 
      ? (i18n.language === 'sv' ? 'Världsomspännande' : 'Worldwide')
      : targetCountries.join(', ');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: reachText
    }]);
    setChatStep('credentials');
    setTimeout(() => {
      addJarlaMessage(
        i18n.language === 'sv'
          ? 'Perfekt! Nu behöver vi bara skapa ditt konto.'
          : "Perfect! Now we just need to create your account.",
        'credentials-form'
      );
    }, 500);
  };

  // Handle final submit
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('auth.validationError'),
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
      return;
    }

    setIsLoading(true);
    setIsSigningUp(true);

    try {
      const { error: signUpError } = await signUp(email, password, fullName);
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast({
            title: t('auth.accountExists'),
            description: t('auth.accountExistsDesc'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('auth.signUpFailed'),
            description: signUpError.message,
            variant: 'destructive',
          });
        }
        setIsLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Not authenticated');
      }

      const currentUserId = session.session.user.id;

      const fullDescription = [
        description,
        productsServices ? `Products/Services: ${productsServices}` : '',
        ageRanges.length ? `Target Age: ${ageRanges.join(', ')}` : '',
        globalReach === 'worldwide' ? 'Reach: Worldwide' : `Reach: ${targetCountries.join(', ')}`,
        audienceDescription ? `Audience: ${audienceDescription}` : ''
      ].filter(Boolean).join('\n\n');

      const { error: profileError } = await supabase
        .from('business_profiles')
        .insert({
          user_id: currentUserId,
          company_name: companyName,
          description: fullDescription || null,
          website: website || null,
        });

      if (profileError) throw profileError;

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: currentUserId,
          role: 'business',
        });

      if (roleError) throw roleError;

      toast({
        title: t('businessAuth.accountCreated'),
        description: t('businessAuth.welcomeToDashboard'),
      });

      navigate('/business');
    } catch (error: any) {
      toast({
        title: t('businessAuth.setupFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsSigningUp(false);
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('auth.validationError'),
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: t('auth.signInFailed'),
        description: error.message === 'Invalid login credentials' 
          ? t('auth.invalidCredentials')
          : error.message,
        variant: 'destructive',
      });
    } else {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.session.user.id);
        
        const hasBusiness = roles?.some(r => r.role === 'business');
        
        if (hasBusiness) {
          navigate('/business');
        } else {
          toast({
            title: t('businessAuth.notBusinessAccount'),
            description: t('businessAuth.notBusinessAccountDesc'),
            variant: 'destructive',
          });
          await supabase.auth.signOut();
        }
      }
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    if (!loading && user && !devMode && !isSigningUp) {
      const checkBusinessRole = async () => {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        const hasBusiness = roles?.some(r => r.role === 'business');
        if (hasBusiness) {
          navigate('/business');
        }
      };
      checkBusinessRole();
    }
  }, [user, loading, devMode, isSigningUp, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  // Render social media picker - dropdown with checkboxes, then inputs
  
  const renderSocialPicker = () => {
    const hasSelectedPlatforms = selectedPlatforms.length > 0;
    
    return (
      <div className="space-y-3 mt-3">
        {/* Dropdown to select platforms */}
        <div className="relative w-72">
          <button
            type="button"
            onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
            className="w-full h-10 px-4 bg-background border border-foreground/20 rounded-[3px] font-geist text-sm text-left flex items-center justify-between hover:border-foreground/40 transition-colors"
          >
            <span className="text-muted-foreground">
              {selectedPlatforms.length > 0 
                ? `${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''} selected`
                : (i18n.language === 'sv' ? 'Välj plattformar...' : 'Select platforms...')
              }
            </span>
            <svg className={`w-4 h-4 text-muted-foreground transition-transform ${showPlatformDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showPlatformDropdown && (
            <>
              {/* Backdrop to close dropdown when clicking outside */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowPlatformDropdown(false)}
              />
              <div className="absolute top-full left-0 w-72 mt-1 bg-background border border-foreground/20 rounded-[3px] shadow-lg z-50 py-2 max-h-48 overflow-y-auto">
                {SOCIAL_PLATFORMS.map(platform => {
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPlatforms(prev => prev.filter(p => p !== platform.id));
                          setSocialMedia(prev => {
                            const newState = { ...prev };
                            delete newState[platform.id];
                            return newState;
                          });
                        } else {
                          setSelectedPlatforms(prev => [...prev, platform.id]);
                          setSocialMedia(prev => ({ ...prev, [platform.id]: '' }));
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm font-geist flex items-center gap-3 hover:bg-foreground/5 transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isSelected ? 'bg-foreground border-foreground' : 'border-foreground/30'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-background" />}
                      </div>
                      <span className="text-foreground">{platform.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Input fields for selected platforms with send button */}
        {hasSelectedPlatforms && (
          <div className="space-y-3 w-full max-w-md">
            {selectedPlatforms.map(platformId => {
              const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
              if (!platform) return null;
              return (
                <div key={platformId} className="flex items-center gap-3">
                  <div className="w-24 text-xs font-geist text-muted-foreground shrink-0">{platform.label}</div>
                  <Input
                    type="url"
                    placeholder={platform.placeholder}
                    value={socialMedia[platformId] || ''}
                    onChange={(e) => setSocialMedia(prev => ({ ...prev, [platformId]: e.target.value }))}
                    className="flex-1 h-9 bg-background border-foreground/20 text-foreground placeholder:text-muted-foreground/40 rounded-[3px] font-geist text-sm px-4"
                  />
                </div>
              );
            })}
            
            {/* Send button - appears when at least one link is filled */}
            {Object.values(socialMedia).some(url => url && url.trim()) && (
              <Button
                onClick={handleSocialsComplete}
                className="w-full rounded-[3px] font-montserrat mt-2"
              >
                <Send className="w-4 h-4 mr-2" />
                {i18n.language === 'sv' ? 'Skicka' : 'Send'}
              </Button>
            )}
          </div>
        )}
        
        {/* Skip button - only show if no platforms selected or no links filled */}
        {(!hasSelectedPlatforms || !Object.values(socialMedia).some(url => url && url.trim())) && (
          <Button
            variant="ghost"
            onClick={handleSocialsComplete}
            className="mt-2 text-muted-foreground hover:text-foreground rounded-[3px] font-geist text-sm"
          >
            {i18n.language === 'sv' ? 'Hoppa över' : 'Skip'}
          </Button>
        )}

      </div>
    );
  };

  // Render country picker
  const renderCountryPicker = () => (
    <select
      value={country}
      onChange={(e) => handleCountrySelect(e.target.value)}
      className="w-full h-10 px-3 bg-white dark:bg-zinc-800 border border-foreground/20 font-geist text-sm rounded-[3px] focus:outline-none focus:border-foreground text-muted-foreground cursor-pointer mt-2"
    >
      <option value="" disabled className="bg-white dark:bg-zinc-800">{t('businessAuth.selectCountry')}</option>
      {COUNTRIES.map((c) => (
        <option key={c} value={c} className="bg-white dark:bg-zinc-800 text-foreground">
          {c}
        </option>
      ))}
    </select>
  );

  // Render age picker
  const renderAgePicker = () => (
    <div className="space-y-3 mt-2">
      <div className="flex flex-wrap gap-2">
        {AGE_RANGES.map((age) => (
          <button
            key={age}
            type="button"
            onClick={() => {
              if (ageRanges.includes(age)) {
                setAgeRanges(ageRanges.filter(a => a !== age));
              } else {
                setAgeRanges([...ageRanges, age]);
              }
            }}
            className={`px-4 py-2 text-sm font-geist transition-all rounded-[3px] ${
              ageRanges.includes(age)
                ? 'bg-foreground text-background'
                : 'bg-white dark:bg-white/10 border border-foreground/20 hover:border-foreground/50 text-foreground'
            }`}
          >
            {age}
          </button>
        ))}
      </div>
      <Button 
        onClick={handleAgeRangeComplete}
        disabled={ageRanges.length === 0}
        className="w-full rounded-[3px] font-montserrat"
      >
        {t('common.continue')}
      </Button>
    </div>
  );

  // Render reach picker
  const renderReachPicker = () => (
    <div className="space-y-3 mt-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setGlobalReach('worldwide')}
          className={`flex-1 p-3 text-sm font-geist transition-all rounded-[3px] ${
            globalReach === 'worldwide'
              ? 'bg-foreground text-background'
              : 'bg-white dark:bg-white/10 border border-foreground/20 hover:border-foreground/50 text-foreground'
          }`}
        >
          {t('businessAuth.worldwide')}
        </button>
        <button
          type="button"
          onClick={() => setGlobalReach('specific')}
          className={`flex-1 p-3 text-sm font-geist transition-all rounded-[3px] ${
            globalReach === 'specific'
              ? 'bg-foreground text-background'
              : 'bg-white dark:bg-white/10 border border-foreground/20 hover:border-foreground/50 text-foreground'
          }`}
        >
          {t('businessAuth.specificCountries')}
        </button>
      </div>
      
      {globalReach === 'specific' && (
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                if (targetCountries.includes(c)) {
                  setTargetCountries(targetCountries.filter(tc => tc !== c));
                } else {
                  setTargetCountries([...targetCountries, c]);
                }
              }}
              className={`p-2 text-left text-sm font-geist transition-all rounded-[3px] ${
                targetCountries.includes(c)
                  ? 'bg-foreground text-background'
                  : 'bg-white dark:bg-white/10 border border-foreground/20 hover:border-foreground/50 text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <Button 
        onClick={handleReachComplete}
        disabled={globalReach === 'specific' && targetCountries.length === 0}
        className="w-full rounded-[3px] font-montserrat"
      >
        {t('common.continue')}
      </Button>
    </div>
  );

  // Render credentials form
  const renderCredentialsForm = () => (
    <form onSubmit={handleFinalSubmit} className="space-y-4 mt-2">
      <div className="space-y-2">
        <Label className="text-muted-foreground text-sm font-montserrat">{t('businessAuth.yourName')}</Label>
        <Input
          type="text"
          placeholder={t('businessAuth.yourNamePlaceholder')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground text-sm font-montserrat">{t('businessAuth.workEmail')}</Label>
        <Input
          type="email"
          placeholder={t('businessAuth.workEmailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground text-sm font-montserrat">{t('auth.password')}</Label>
        <Input
          type="password"
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox 
          id="terms" 
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          className="h-4 w-4 rounded-none"
        />
        <Label 
          htmlFor="terms" 
          className="text-xs text-muted-foreground font-geist cursor-pointer"
        >
          {t('businessAuth.agreeToTerms')}
        </Label>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading || !fullName.trim() || !email.trim() || !password.trim() || !termsAccepted}
        className="w-full rounded-[3px] font-montserrat"
      >
        {isLoading ? t('businessAuth.creating') : t('businessAuth.completeSetup')}
      </Button>
    </form>
  );

  // Login screen
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 grainy-background" />
        <div className="noise-layer" />
        
        <div className="fixed top-6 left-6 z-50">
          <div className="relative h-10 w-[130px]">
            <div 
              className="absolute inset-0 bg-foreground"
              style={{
                WebkitMaskImage: `url(${jarlaLogo})`,
                maskImage: `url(${jarlaLogo})`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center'
              }} 
            />
          </div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen px-6 py-12 justify-center">
          <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-foreground text-center">
              {t('businessAuth.businessLogin')}
            </h2>
            
            <form onSubmit={handleLogin} className="w-full space-y-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-montserrat">{t('auth.email')}</Label>
                <Input
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-montserrat">{t('auth.password')}</Label>
                <Input
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full rounded-full font-montserrat"
              >
                {isLoading ? t('common.loading') : t('auth.login')}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground font-geist">
              {t('businessAuth.dontHaveBusinessAccount')}{' '}
              <button
                onClick={() => setMode('intro')}
                className="text-foreground hover:underline font-medium"
              >
                {t('businessAuth.createOne')}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dev mode toggle */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => setDevMode(!devMode)}
          className={`px-3 py-1 text-xs rounded-full transition-all ${
            devMode ? 'bg-green-500 text-white' : 'bg-foreground/20 text-foreground/60 hover:bg-foreground/30'
          }`}
        >
          Dev Mode
        </button>
        <button
          onClick={() => setMode('login')}
          className="px-3 py-1 text-xs rounded-full bg-foreground/20 text-foreground/60 hover:bg-foreground/30"
        >
          Login
        </button>
      </div>

      <div className="absolute inset-0 grainy-background" />
      <div className="noise-layer" />
      
      {/* Logo */}
      <div className="fixed top-6 left-6 z-50">
        <div className="relative h-10 w-[130px]">
          <div 
            className="absolute inset-0 bg-foreground"
            style={{
              WebkitMaskImage: `url(${jarlaLogo})`,
              maskImage: `url(${jarlaLogo})`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center'
            }} 
          />
        </div>
      </div>

      <div className="relative z-10">
        {mode === 'intro' ? (
          // Intro screen - company name input
          <div className="flex flex-col items-center justify-center min-h-screen px-6">
            {!showNameInput ? (
              <div className="animate-spin">
                <Loader2 className="h-8 w-8 text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-8 animate-fade-in">
                <div className="flex items-baseline gap-3">
                  <h1 className="text-5xl md:text-7xl font-bold font-montserrat text-foreground whitespace-nowrap">
                    {t('businessAuth.hello')}
                  </h1>
                  <div className="relative" style={{ width: '220px' }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && companyName.trim()) {
                          e.preventDefault();
                          startChat();
                        }
                      }}
                      placeholder=""
                      className="w-full bg-transparent border-none outline-none text-2xl md:text-3xl font-medium font-montserrat text-foreground pb-1 whitespace-nowrap"
                    />
                    {!companyName && (
                      <span className="absolute left-0 top-0 text-2xl md:text-3xl font-medium font-montserrat text-muted-foreground/50 pointer-events-none whitespace-nowrap">
                        {typewriterText}
                      </span>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={startChat} 
                  className={`rounded-[3px] px-8 font-montserrat transition-opacity duration-300 ${companyName.trim() ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  {t('common.continue')}
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Chat interface with optional profile preview
          <div className="h-screen flex items-center justify-center p-2 overflow-hidden">
            {/* Main container that holds chat and profile side by side */}
            <div className="flex gap-6 items-center">
              {/* Chat container - stays same size, moves via margin */}
              <div className={`w-[600px] h-[calc(100vh-1rem)] bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface rounded-[3px] overflow-hidden flex flex-col relative transition-all duration-700 ease-out ${
                showProfilePreview ? '-ml-[60px]' : 'ml-0'
              }`}>
                {/* Scrollable chat messages area */}
                <div className="flex-1 overflow-y-auto px-8 pt-12 pb-24">
                  <div className="w-full space-y-6">
                  {messages.map((msg, index) => {
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const showJarlaName = msg.role === 'jarla' && (prevMsg?.role !== 'jarla');
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-500 ease-out`}
                        style={{ 
                          animation: 'smoothFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                          opacity: 0
                        }}
                      >
                        {msg.role === 'noted' ? (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Check className="h-3.5 w-3.5" />
                            <span className="text-sm font-geist">{msg.content}</span>
                          </div>
                        ) : msg.type === 'summary-section' ? (
                          // Summary section - heading + paragraph together, fade in animation
                          <div 
                            className="bg-muted/60 dark:bg-white/10 rounded-[3px] px-4 py-3"
                            style={{ animation: 'smoothFadeIn 0.5s ease-out forwards' }}
                          >
                            <h3 className="text-lg font-montserrat font-bold mb-2">{msg.heading}</h3>
                            <p className="font-geist text-base text-foreground/90">{msg.content}</p>
                          </div>
                        ) : (
                          <div
                            className={`transition-all duration-300 ${
                              msg.role === 'user'
                                ? 'bg-foreground text-background rounded-[3px] px-3 py-1.5'
                                : 'text-foreground max-w-[85%]'
                            }`}
                          >
                            {showJarlaName && msg.role === 'jarla' && (
                              <div className="text-sm text-muted-foreground font-montserrat mb-1">Jarla</div>
                            )}
                            {msg.role === 'jarla' && msg.displayedContent && (
                              <div 
                                className="font-geist text-base whitespace-pre-wrap [&_strong]:text-xl [&_strong]:font-montserrat [&_strong]:font-bold [&_strong]:block [&_strong]:mt-4 [&_strong]:mb-1" 
                                dangerouslySetInnerHTML={{ 
                                  __html: msg.displayedContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') 
                                }} 
                              />
                            )}
                            {msg.role === 'user' && (
                              <p className="font-geist text-xs">
                                {msg.content}
                              </p>
                            )}
                          
                          {/* Render inline text input with send button */}
                          {msg.role === 'jarla' && msg.type === 'text-input' && msg.inputStep === chatStep && (
                            <div className="mt-4 flex gap-2 items-center" style={{ animation: 'smoothFadeIn 0.3s ease-out forwards' }}>
                              <Input
                                type="text"
                                placeholder={msg.inputPlaceholder}
                                value={inlineInputValue}
                                onChange={(e) => setInlineInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && inlineInputValue.trim() && msg.inputStep) {
                                    e.preventDefault();
                                    handleInlineSubmit(inlineInputValue, msg.inputStep);
                                    setInlineInputValue('');
                                  }
                                }}
                                autoFocus
                                className="flex-1 max-w-sm h-10 bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist text-sm px-4"
                              />
                              <button
                                onClick={() => {
                                  if (inlineInputValue.trim() && msg.inputStep) {
                                    handleInlineSubmit(inlineInputValue, msg.inputStep);
                                    setInlineInputValue('');
                                  }
                                }}
                                disabled={!inlineInputValue.trim()}
                                className="h-10 w-10 flex items-center justify-center rounded-[3px] bg-foreground text-background disabled:opacity-30 transition-opacity"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          
                          {/* Render special UI elements */}
                          {msg.role === 'jarla' && msg.type === 'social-picker' && chatStep === 'socials' && (
                            <div style={{ animation: 'smoothFadeIn 0.3s ease-out forwards' }}>{renderSocialPicker()}</div>
                          )}
                          {msg.role === 'jarla' && msg.type === 'analyzing' && chatStep === 'analyzing' && (
                            <div className="flex items-center gap-3 mt-3" style={{ animation: 'smoothFadeIn 0.3s ease-out forwards' }}>
                              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                              <span className="text-sm text-muted-foreground font-geist">
                                {i18n.language === 'sv' ? 'Analyserar...' : 'Analyzing...'}
                              </span>
                            </div>
                          )}
                          {msg.role === 'jarla' && msg.type === 'confirm-buttons' && chatStep === 'confirm-summary' && (
                            <div className="flex gap-3 mt-3" style={{ animation: 'smoothFadeIn 0.3s ease-out forwards' }}>
                              <Button
                                onClick={() => handleSummaryConfirm(true)}
                                className="rounded-[3px] font-montserrat"
                              >
                                {i18n.language === 'sv' ? 'Ja, det stämmer!' : "Yes, that's correct!"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleSummaryConfirm(false)}
                                className="rounded-[3px] font-montserrat"
                              >
                                {i18n.language === 'sv' ? 'Nej' : 'No'}
                              </Button>
                            </div>
                          )}
                          {msg.role === 'jarla' && msg.type === 'profile-confirm-buttons' && chatStep === 'confirm-profile' && (
                            <div className="flex gap-3 mt-3" style={{ animation: 'smoothFadeIn 0.3s ease-out forwards' }}>
                              <Button
                                onClick={() => handleProfileConfirm(true)}
                                className="rounded-[3px] font-montserrat"
                              >
                                {i18n.language === 'sv' ? 'Ja, skapa profilen!' : "Yes, create it!"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleProfileConfirm(false)}
                                className="rounded-[3px] font-montserrat"
                              >
                                {i18n.language === 'sv' ? 'Hoppa över' : 'Skip'}
                              </Button>
                            </div>
                          )}
                          {msg.role === 'jarla' && msg.type === 'profile-feedback-buttons' && chatStep === 'profile-feedback' && (
                            <div className="flex gap-3 mt-3" style={{ animation: 'smoothFadeIn 0.3s ease-out forwards' }}>
                              <Button
                                onClick={() => handleProfileFeedback(true)}
                                className="rounded-[3px] font-montserrat"
                              >
                                {i18n.language === 'sv' ? 'Ja, det ser bra ut!' : "Yes, looks great!"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleProfileFeedback(false)}
                                className="rounded-[3px] font-montserrat"
                              >
                                {i18n.language === 'sv' ? 'Jag vill ändra' : "I'd like to change"}
                              </Button>
                            </div>
                          )}
                          {msg.role === 'jarla' && msg.type === 'country-picker' && chatStep === 'location' && (
                            <div style={{ animation: 'smoothFadeIn 0.3s ease-out forwards' }}>{renderCountryPicker()}</div>
                          )}
                          {msg.role === 'jarla' && msg.type === 'age-picker' && chatStep === 'age-range' && (
                            <div style={{ animation: 'smoothFadeIn 0.3s ease-out forwards' }}>{renderAgePicker()}</div>
                          )}
                          {msg.role === 'jarla' && msg.type === 'reach-picker' && chatStep === 'reach' && (
                            <div style={{ animation: 'smoothFadeIn 0.3s ease-out forwards' }}>{renderReachPicker()}</div>
                          )}
                          {msg.role === 'jarla' && msg.type === 'credentials-form' && chatStep === 'credentials' && (
                            <div style={{ animation: 'smoothFadeIn 0.3s ease-out forwards' }}>{renderCredentialsForm()}</div>
                          )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {isTyping && (
                    <div className="flex justify-start" style={{ animation: 'smoothFadeIn 0.3s ease-out forwards' }}>
                      <div className="text-foreground">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>
              </div>

                {/* Bottom chat input - attached to bottom of chat container */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                  <div className="w-full max-w-md flex gap-2 items-center">
                    <Input
                      ref={chatInputRef}
                      type="text"
                      placeholder={i18n.language === 'sv' ? 'Skriv ett meddelande...' : 'Type a message...'}
                      value={bottomInputValue}
                      onChange={(e) => setBottomInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (chatStep === 'socials') {
                            setShowPlatformDropdown(false);
                            handleSocialsComplete();
                          } else if (bottomInputValue.trim()) {
                            if (chatStep === 'edit-summary') {
                              handleEditSummarySubmit(bottomInputValue);
                              setBottomInputValue('');
                            } else {
                              const currentInputMsg = messages.find(m => m.type === 'text-input' && m.inputStep === chatStep);
                              if (currentInputMsg?.inputStep) {
                                handleInlineSubmit(bottomInputValue, currentInputMsg.inputStep);
                              } else {
                                handleChatMessage(bottomInputValue);
                              }
                              setBottomInputValue('');
                            }
                          }
                        }
                      }}
                      className="flex-1 h-10 bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist text-sm px-4"
                    />
                    <button
                      onClick={() => {
                        if (chatStep === 'socials') {
                          setShowPlatformDropdown(false);
                          handleSocialsComplete();
                        } else if (bottomInputValue.trim()) {
                          if (chatStep === 'edit-summary') {
                            handleEditSummarySubmit(bottomInputValue);
                            setBottomInputValue('');
                          } else {
                            const currentInputMsg = messages.find(m => m.type === 'text-input' && m.inputStep === chatStep);
                            if (currentInputMsg?.inputStep) {
                              handleInlineSubmit(bottomInputValue, currentInputMsg.inputStep);
                            } else {
                              handleChatMessage(bottomInputValue);
                            }
                            setBottomInputValue('');
                          }
                        }
                      }}
                      disabled={chatStep !== 'socials' && !bottomInputValue.trim()}
                      className="h-10 w-10 flex items-center justify-center rounded-[3px] bg-foreground text-background disabled:opacity-30 transition-opacity"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Profile Preview - fades in after chat moves */}
              <div 
                className={`h-auto self-center rounded-[3px] overflow-hidden flex flex-col transition-all duration-500 ease-out ${
                  showProfilePreview 
                    ? 'w-[620px] p-5' 
                    : 'w-0 p-0'
                } ${
                  profileVisible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {showProfilePreview && (
                  <div 
                    className="rounded-[3px] p-10 space-y-8 shadow-sm"
                    style={{
                      background: companyBrandColor 
                        ? `linear-gradient(135deg, ${companyBrandColor}20 0%, ${companyBrandColor}08 100%)`
                        : 'hsl(var(--background))'
                    }}
                  >
                    {/* Logo and Company Name */}
                    <div className="flex items-center gap-5">
                      {companyLogo ? (
                        <img 
                          src={companyLogo} 
                          alt={companyName} 
                          className="w-[72px] h-[72px] rounded-[3px] object-contain bg-muted/30"
                        />
                      ) : (
                        <div className="w-[72px] h-[72px] rounded-[3px] bg-muted/50 flex items-center justify-center">
                          <span className="text-3xl font-bold text-muted-foreground">
                            {companyName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <h3 className="text-3xl font-montserrat font-bold">{companyName}</h3>
                    </div>

                    {/* Description - typewriter effect */}
                    {companySummary && (
                      <p className="text-base text-foreground/80 font-geist leading-relaxed min-h-[3rem]">
                        {profileTypedDescription}
                        {!profileTypingComplete && <span className="animate-pulse">|</span>}
                      </p>
                    )}

                    {/* Social media icons - fade in after typing */}
                    <div className={`flex gap-4 transition-opacity duration-300 ${profileTypingComplete ? 'opacity-100' : 'opacity-0'}`}>
                      {Object.keys(socialMedia).filter(k => socialMedia[k]).length > 0 && (
                        <>
                          {Object.entries(socialMedia).filter(([_, url]) => url).map(([platform]) => {
                            const IconComponent = {
                              instagram: Instagram,
                              facebook: Facebook,
                              youtube: Youtube,
                              twitter: Twitter,
                              linkedin: Linkedin,
                            }[platform];
                            
                            // For platforms without Lucide icons, use images
                            if (!IconComponent) {
                              const logoUrls: Record<string, string> = {
                                tiktok: 'https://cdn.simpleicons.org/tiktok/000000',
                                pinterest: 'https://cdn.simpleicons.org/pinterest/E60023',
                                snapchat: 'https://cdn.simpleicons.org/snapchat/FFFC00'
                              };
                              return (
                                <img 
                                  key={platform} 
                                  src={logoUrls[platform]} 
                                  alt={platform}
                                  className="w-6 h-6 dark:invert"
                                />
                              );
                            }
                            
                            return (
                              <IconComponent key={platform} className="w-6 h-6 text-foreground/70" />
                            );
                          })}
                        </>
                      )}
                    </div>

                    {/* Campaigns section - fade in after typing */}
                    <div className={`space-y-2 transition-opacity duration-300 ${profileTypingComplete ? 'opacity-100' : 'opacity-0'}`}>
                      <h4 className="text-base font-montserrat font-semibold">
                        {i18n.language === 'sv' ? 'Kampanjer' : 'Campaigns'}
                      </h4>
                      <p className="text-base text-muted-foreground font-geist">
                        {i18n.language === 'sv' ? 'Inga kampanjer ännu' : 'No campaigns yet'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessAuth;
