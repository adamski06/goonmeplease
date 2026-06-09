import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { ChevronLeft, ChevronRight, LogOut, Shield, HelpCircle, FileText, MessageCircle, ExternalLink, MoreHorizontal, Pencil, Bell, Trash2, Globe, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [showLanguageSheet, setShowLanguageSheet] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/user/auth');
    toast({
      title: t('creatorUI.signedOut'),
      description: t('creatorUI.signedOutDesc'),
    });
  };

  const changeLanguage = (lng: 'en' | 'sv') => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setShowLanguageSheet(false);
  };

  const currentLanguageLabel = i18n.language === 'sv' ? 'Svenska' : 'English';

  const settingsSections = [
    {
      title: t('creatorUI.sectionAccount'),
      items: [
        { icon: Pencil, label: t('creatorUI.editProfile'), action: () => navigate('/user/edit-profile') },
        { icon: Bell, label: t('creatorUI.notifications'), action: () => navigate('/user/alerts') },
      ],
    },
    {
      title: t('creatorUI.sectionPreferences'),
      items: [
        {
          icon: Globe,
          label: t('creatorUI.language'),
          action: () => setShowLanguageSheet(true),
          trailing: <span className="text-xs text-black/40 font-jakarta">{currentLanguageLabel}</span>,
        },
      ],
    },
    {
      title: t('creatorUI.sectionSupport'),
      items: [
        { icon: MessageCircle, label: t('creatorUI.contactSupport'), action: () => navigate('/user/support') },
        { icon: HelpCircle, label: t('creatorUI.helpCenter'), action: () => navigate('/user/help') },
      ],
    },
    {
      title: t('creatorUI.sectionLegal'),
      items: [
        { icon: Shield, label: t('creatorUI.privacyPolicy'), action: () => window.open('https://jarla.org/privacy', '_blank') },
        { icon: FileText, label: t('creatorUI.termsOfService'), action: () => window.open('https://jarla.org/terms', '_blank') },
        { icon: Trash2, label: t('creatorUI.dataDeletion'), action: () => window.open('https://jarla.org/datadelete', '_blank') },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="flex flex-col border-b border-black/10 safe-area-top">
        <div className="flex items-center px-4 py-3 relative">
          <button onClick={() => navigate('/user/profile')} className="p-1 -ml-1">
            <ChevronLeft className="h-6 w-6 text-black" />
          </button>
          <span className="text-base font-semibold text-black flex-1 text-center pr-6">{t('creatorUI.settingsTitle')}</span>
        </div>
      </div>

      {/* Account info */}
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || t('creatorUI.userFallback')} />
            <AvatarFallback className="bg-black/5 text-black/40 text-sm font-semibold">
              {(profile?.full_name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-black font-montserrat">{profile?.full_name || t('creatorUI.userFallback')}</p>
            <p className="text-xs text-black/50 font-jakarta">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Settings sections */}
      <div className="px-4 space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-black/40 uppercase tracking-wider font-montserrat mb-2 px-1">
              {section.title}
            </h3>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              {section.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${
                    idx < section.items.length - 1 ? 'border-b border-black/5' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5 text-black/40" />
                  <span className="text-sm text-black font-jakarta flex-1">{item.label}</span>
                  {(item as any).trailing ? (item as any).trailing : null}
                  {(item as any).external ? (
                    <ExternalLink className="h-4 w-4 text-black/20" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-black/20 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.1) 100%)',
            border: '1px solid rgba(239,68,68,0.1)',
          }}
        >
          <LogOut className="h-5 w-5 text-red-500/70" />
          <span className="text-sm font-medium text-red-600 font-jakarta">{t('creatorUI.signOut')}</span>
        </button>

        {/* More */}
        <button
          onClick={() => navigate('/user/more-settings')}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.04) 100%)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <MoreHorizontal className="h-5 w-5 text-black/30" />
          <span className="text-sm text-black/50 font-jakarta">{t('common.more')}</span>
          <ChevronRight className="h-4 w-4 text-black/20 ml-auto" />
        </button>

        <p className="text-center text-xs text-black/30 font-jakarta pt-2 pb-8">
          {t('creatorUI.version')} 1.0.0
        </p>
      </div>

      {/* Language bottom sheet */}
      {showLanguageSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setShowLanguageSheet(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-5 pb-8 safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-black/15 mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-black font-montserrat mb-3 text-center">
              {t('creatorUI.chooseLanguage')}
            </h3>
            {([
              { code: 'en', label: 'English' },
              { code: 'sv', label: 'Svenska' },
            ] as const).map((opt) => (
              <button
                key={opt.code}
                onClick={() => changeLanguage(opt.code)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-black/[0.04]"
              >
                <span className="text-sm text-black font-jakarta">{opt.label}</span>
                {i18n.language === opt.code && <Check className="h-5 w-5 text-emerald-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
