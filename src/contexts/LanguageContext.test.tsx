import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { LanguageProvider, useLanguage } from './LanguageContext';
function Page() { const { lang, setLang } = useLanguage(); return <><h1>{lang === 'zh' ? '当前页面' : 'Current page'}</h1><button onClick={() => setLang('en')}>English</button><button onClick={() => setLang('zh')}>中文</button></>; }
afterEach(() => vi.restoreAllMocks());
it('keeps the whole application visible when saving a language throws', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Blocked','SecurityError'); });
  const { container } = render(<LanguageProvider initialLanguage="zh"><Page /></LanguageProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'English' }));
  expect(screen.getByRole('heading', { name: 'Current page' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: '中文' }));
  expect(screen.getByRole('heading', { name: '当前页面' })).toBeVisible();
  expect(container.querySelector('[style*="opacity: 0"]')).toBeNull();
});
it('still opens when browser storage access is unavailable', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked','SecurityError'); });
  render(<LanguageProvider><Page /></LanguageProvider>);
  expect(screen.getByRole('heading')).toBeVisible();
});
