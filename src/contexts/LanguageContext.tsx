import React, { createContext, useContext, useState, useCallback } from 'react';
import { confirmedTranslation } from '@/lib/confirmedTranslations';

type Language = 'zh' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (zh: string, en: string) => string;
  isTransitioning: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectLanguage(): Language {
  let saved: string | null = null;
  try { saved = localStorage.getItem('rgan-lang'); } catch { /* Storage may be blocked. */ }
  if (saved === 'zh' || saved === 'en') return saved;
  const browserLang = navigator.language || '';
  return browserLang.startsWith('zh') ? 'zh' : 'en';
}

export function LanguageProvider({ children, initialLanguage }: { children: React.ReactNode; initialLanguage?: Language }) {
  const [lang, setLangState] = useState<Language>(() => initialLanguage ?? detectLanguage());
  const isTransitioning = false;

  const setLang = useCallback((l: Language) => {
    if (l === lang) return;
    // Language changes must never hide the application or depend on storage.
    setLangState(l);
    try { localStorage.setItem('rgan-lang', l); } catch { /* Keep the in-memory choice. */ }
  }, [lang]);

  const t = useCallback((zh: string, en: string) => confirmedTranslation(zh, en, lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isTransitioning }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
