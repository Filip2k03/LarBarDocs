import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLocale?: 'en' | 'my';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLocale = 'en' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [locale, setLocale] = useState<'en' | 'my'>(currentLocale);

  useEffect(() => {
    const saved = localStorage.getItem('labar_locale') as 'en' | 'my' | null;
    if (saved && (saved === 'en' || saved === 'my')) {
      setLocale(saved);
    }
  }, []);

  const handleSelect = (lang: 'en' | 'my') => {
    setLocale(lang);
    localStorage.setItem('labar_locale', lang);
    setIsOpen(false);
    // Refresh or update url if parameterized
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.location.href = url.toString();
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-brand-text hover:bg-neutral-100 border border-brand-border transition-colors cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe size={14} className="text-brand-secondary" />
        <span>{locale === 'my' ? 'မြန်မာ (MY)' : 'EN'}</span>
        <ChevronDown size={12} className="text-brand-secondary" />
      </button>

      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-40 rounded-2xl shadow-soft-lg bg-white border border-brand-border ring-1 ring-black ring-opacity-5 z-50 py-1.5"
          role="menu"
        >
          <button
            onClick={() => handleSelect('en')}
            className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center justify-between hover:bg-neutral-50 transition-colors ${
              locale === 'en' ? 'text-brand-red font-bold' : 'text-brand-text'
            }`}
            role="menuitem"
          >
            <span>English (EN)</span>
            {locale === 'en' && <Check size={14} className="text-brand-red" />}
          </button>

          <button
            onClick={() => handleSelect('my')}
            className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center justify-between hover:bg-neutral-50 transition-colors ${
              locale === 'my' ? 'text-brand-red font-bold' : 'text-brand-text'
            }`}
            role="menuitem"
          >
            <span>မြန်မာဘာသာ (MY)</span>
            {locale === 'my' && <Check size={14} className="text-brand-red" />}
          </button>
        </div>
      )}
    </div>
  );
};
