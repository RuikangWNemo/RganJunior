import { act, fireEvent, render, screen } from '@testing-library/react';
import { lazy, Suspense } from 'react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import RouteErrorBoundary, { RouteFeedback } from './RouteFeedback';
import RouteViewport from './RouteViewport';
beforeEach(() => { vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
function wrap(children: React.ReactNode) { return <MemoryRouter><LanguageProvider initialLanguage="zh">{children}</LanguageProvider></MemoryRouter>; }
it('shows readable loading status immediately and recovery controls on a slow connection', () => {
  vi.useFakeTimers(); render(wrap(<RouteFeedback />));
  expect(screen.getByRole('status')).toHaveTextContent('正在加载内容');
  expect(screen.getByRole('heading')).toBeVisible();
  act(() => vi.advanceTimersByTime(8000));
  expect(screen.getByRole('button', { name: '重新加载页面' })).toBeVisible();
  expect(screen.getByRole('link', { name: '返回首页' })).toHaveAttribute('href','/');
});
it('contains rejected lazy imports instead of unmounting the site', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const Failed = lazy(() => Promise.reject(new Error('Failed to fetch dynamically imported module')));
  render(wrap(<><nav>网站导航</nav><RouteErrorBoundary resetKey="/programs"><Suspense fallback={<RouteFeedback />}><Failed /></Suspense></RouteErrorBoundary></>));
  expect(await screen.findByRole('alert')).toHaveTextContent('页面文件可能未下载完整');
  expect(screen.getByText('网站导航')).toBeVisible();
  expect(screen.getByRole('button', { name: '重新加载页面' })).toBeVisible();
});
it('can leave an errored page through client navigation', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  function Failed() { throw new Error('Render failed'); return null; }
  const { rerender } = render(wrap(<RouteErrorBoundary resetKey="/bad"><Failed /></RouteErrorBoundary>));
  expect(screen.getByRole('alert')).toBeVisible();
  rerender(wrap(<RouteErrorBoundary resetKey="/"><h1>首页</h1></RouteErrorBoundary>));
  expect(screen.getByRole('heading', { name: '首页' })).toBeVisible();
});
it('scrolls to an anchor after its slow route actually mounts, and releases manual restoration', async () => {
  let resolve!: (module: { default: () => JSX.Element }) => void;
  const Delayed = lazy(() => new Promise<{ default: () => JSX.Element }>(done => { resolve = done; }));
  const scrollIntoView = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
  window.history.scrollRestoration = 'auto';
  const { unmount } = render(wrap(<><Link to="/slow#section">慢页面</Link><Suspense fallback={<RouteFeedback />}><RouteViewport><Routes><Route path="/" element={<h1>首页</h1>} /><Route path="/slow" element={<Delayed />} /></Routes></RouteViewport></Suspense></>));
  fireEvent.click(screen.getByRole('link', { name: '慢页面' }));
  expect(screen.getByRole('status')).toBeVisible();
  await act(async () => resolve({ default: () => <h1 id="section">目标章节</h1> }));
  expect(screen.getByRole('heading', { name: '目标章节' })).toBeVisible();
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' });
  expect(window.history.scrollRestoration).toBe('manual');
  unmount(); expect(window.history.scrollRestoration).toBe('auto');
});
