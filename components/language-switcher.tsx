'use client';

import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <Button 
      variant="ghost" 
      onClick={toggleLanguage}
      className="text-white hover:text-amber-700 focus:ring-0 focus:ring-offset-0"
      aria-label={`Switch to ${language === 'en' ? 'Arabic' : 'English'}`}
    >
      <span className="font-medium">
        {language === 'en' ? 'العربية' : 'English'}
      </span>
    </Button>
  );
} 