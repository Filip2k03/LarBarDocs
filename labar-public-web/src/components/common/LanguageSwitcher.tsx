import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLocale?: 'en' | 'my';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLocale = 'en' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [locale, setLocale] = useState<'en' | 'my'>(currentLocale);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check URL first
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang') as 'en' | 'my' | null;
    if (langParam === 'en' || langParam === 'my') {
      setLocale(langParam);
      localStorage.setItem('labar_locale', langParam);
      return;
    }

    // Otherwise check localStorage
    const saved = localStorage.getItem('labar_locale') as 'en' | 'my' | null;
    if (saved === 'en' || saved === 'my') {
      setLocale(saved);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: 'en' | 'my') => {
    if (lang === locale) {
      setIsOpen(false);
      return;
    }

    setLocale(lang);
    localStorage.setItem('labar_locale', lang);
    setIsOpen(false);

    // Update document lang
    document.documentElement.lang = lang;

    // Update URL query parameter cleanly and reload
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('lang', lang);
    window.location.href = currentUrl.toString();
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-neutral-800 hover:bg-neutral-100 border border-brand-border/80 transition-all cursor-pointer select-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe size={14} className="text-brand-red shrink-0" />
        <span className="font-extrabold">{locale === 'my' ? 'မြန်မာ' : 'EN'}</span>
        <ChevronDown size={12} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180 text-brand-red' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-44 rounded-2xl shadow-soft-lg bg-white border border-brand-border ring-1 ring-black/5 z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          role="menu"
        >
          <button
            type="button"
            onClick={() => handleSelect('en')}
            className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-neutral-50 transition-colors ${
              locale === 'en' ? 'text-brand-red font-bold bg-brand-lightRed/30' : 'text-neutral-700'
            }`}
            role="menuitem"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold">English</span>
              <span className="text-[10px] text-neutral-400 font-mono">(EN)</span>
            </div>
            {locale === 'en' && <Check size={14} className="text-brand-red shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => handleSelect('my')}
            className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-neutral-50 transition-colors ${
              locale === 'my' ? 'text-brand-red font-bold bg-brand-lightRed/30' : 'text-neutral-700'
            }`}
            role="menuitem"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold font-sans">မြန်မာဘာသာ</span>
              <span className="text-[10px] text-neutral-400 font-mono">(MY)</span>
            </div>
            {locale === 'my' && <Check size={14} className="text-brand-red shrink-0" />}
          </button>
        </div>
      )}
    </div>
  );
};
