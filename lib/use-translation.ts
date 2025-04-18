'use client';

import { useLanguage } from './language-context';
import { translations } from './translations';

export function useTranslation() {
  const { language } = useLanguage();
  
  function t(key: string) {
    const keys = key.split('.');
    let translation: any = translations[language];
    
    for (const k of keys) {
      if (!translation[k]) return key; // Return the key if translation not found
      translation = translation[k];
    }
    
    if (typeof translation === 'string') {
      return translation;
    }
    
    return key;
  }
  
  // Function to translate dynamic content like product names and descriptions
  function translateDynamicContent(content: string) {
    // Check if we have a translation for this content
    // The format for lookup will be the content converted to lowercase with spaces replaced by underscores
    const key = `dynamic_${content.trim().toLowerCase().replace(/\s+/g, '_')}`;
    
    // Try to get translation, if not available return original content
    const translationObj = translations[language] as Record<string, string>;
    if (translationObj && key in translationObj) {
      return translationObj[key];
    }
    
    return content;
  }
  
  return { t, translateDynamicContent };
} 