import React from 'react';
import { Globe2 } from 'lucide-react';
import { useLocale } from '../contexts/LanguageContext';

export function LanguageSwitch() {
  const { t, language, setLanguage } = useLocale();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md flex items-center gap-1"
      title={t('language.switch')}
    >
      <Globe2 className="w-4 h-4" />
      <span className="text-sm">{t(`language.${language}`)}</span>
    </button>
  );
} 