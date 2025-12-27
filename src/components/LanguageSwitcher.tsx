import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageSwitcherProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'default', className = '' }) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const currentLanguage = i18n.language;

  if (variant === 'minimal') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors ${className}`}>
            <Globe className="h-4 w-4" />
            <span className="uppercase">{currentLanguage}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background border-border">
          <DropdownMenuItem 
            onClick={() => changeLanguage('en')}
            className={`cursor-pointer ${currentLanguage === 'en' ? 'font-bold' : ''}`}
          >
            {t('common.english')}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => changeLanguage('sv')}
            className={`cursor-pointer ${currentLanguage === 'sv' ? 'font-bold' : ''}`}
          >
            {t('common.swedish')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors ${className}`}>
          <Globe className="h-4 w-4" />
          {currentLanguage === 'sv' ? t('common.swedish') : t('common.english')}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border-border">
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={`cursor-pointer ${currentLanguage === 'en' ? 'font-bold' : ''}`}
        >
          {t('common.english')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('sv')}
          className={`cursor-pointer ${currentLanguage === 'sv' ? 'font-bold' : ''}`}
        >
          {t('common.swedish')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
