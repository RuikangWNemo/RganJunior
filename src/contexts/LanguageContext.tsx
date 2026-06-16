import React, { createContext, useContext, useState, useCallback } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (zh: string, en: string) => string;
  isTransitioning: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectLanguage(): Language {
  const saved = localStorage.getItem('rgan-lang');
  if (saved === 'zh' || saved === 'en') return saved;
  const browserLang = navigator.language || '';
  return browserLang.startsWith('zh') ? 'zh' : 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(detectLanguage);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setLang = useCallback((l: Language) => {
    if (l === lang) return;
    setIsTransitioning(true);
    // Fade out, swap, fade in
    setTimeout(() => {
      setLangState(l);
      localStorage.setItem('rgan-lang', l);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 250);
  }, [lang]);

  const t = useCallback((zh: string, en: string) => (lang === 'zh' ? zh : en), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isTransitioning }}>
      <div
        className="transition-opacity duration-300 ease-out"
        style={{ opacity: isTransitioning ? 0 : 1 }}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
