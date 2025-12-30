import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const LanguageSelector = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('fr');

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷', currency: 'EUR' },
    { code: 'en', label: 'English', flag: '🇬🇧', currency: 'EUR' }
  ];

  const currentLanguage = languages?.find(lang => lang?.code === selectedLanguage);

  const handleLanguageChange = (code) => {
    setSelectedLanguage(code);
    localStorage.setItem('preferredLanguage', code);
  };

  return (
    <div className="absolute top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 z-10">
      <div className="relative">
        <button
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md shadow-elevation-1 hover:shadow-elevation-2 transition-smooth"
          aria-label="Sélectionner la langue"
        >
          <span className="text-lg">{currentLanguage?.flag}</span>
          <span className="text-sm font-medium text-foreground hidden md:inline">
            {currentLanguage?.label}
          </span>
          <span className="text-xs text-muted-foreground hidden lg:inline">
            ({currentLanguage?.currency})
          </span>
          <Icon name="ChevronDown" size={16} color="var(--color-muted-foreground)" />
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;