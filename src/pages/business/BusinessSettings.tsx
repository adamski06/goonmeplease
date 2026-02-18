import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Shield, HelpCircle, FileText, LogOut, Pencil } from 'lucide-react';

const BusinessSettings: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/business/auth');
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: Pencil, label: 'Edit Profile', action: () => navigate('/business/edit-profile') },
        { icon: Bell, label: 'Notifications', action: () => {} },
        { icon: Shield, label: 'Privacy & Security', action: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', action: () => {} },
        { icon: FileText, label: 'Terms of Service', action: () => {} },
      ],
    },
  ];

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground font-montserrat mb-8">Settings</h1>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-montserrat mb-2 px-1">
              {section.title}
            </h3>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                border: '1px solid hsl(var(--border))',
                boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6)',
              }}
            >
              {section.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-accent/40 transition-colors ${
                    idx < section.items.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground font-jakarta flex-1">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors hover:opacity-90"
          style={{
            background: 'linear-gradient(180deg, hsl(0 84% 60% / 0.06) 0%, hsl(0 84% 60% / 0.10) 100%)',
            border: '1px solid hsl(0 84% 60% / 0.15)',
          }}
        >
          <LogOut className="h-5 w-5 text-destructive/70" />
          <span className="text-sm font-medium text-destructive font-jakarta">Sign Out</span>
        </button>

        <p className="text-center text-xs text-muted-foreground font-jakarta pt-2">Version 1.0.0</p>
      </div>
    </div>
  );
};

export default BusinessSettings;
