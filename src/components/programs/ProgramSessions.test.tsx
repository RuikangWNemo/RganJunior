import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { emptySession, getProgramCatalog, type ProgramProduct } from '@/services/programs';
import ProgramSessions, { isPastSession } from './ProgramSessions';
vi.mock('@/services/programs', async importOriginal => ({ ...await importOriginal<object>(), getProgramCatalog: vi.fn(), resolveProgramPhotos: vi.fn().mockResolvedValue({}) }));
const product: ProgramProduct = { id: 'product', program_id: 'life-co-creation-camp', name_zh: '自然共创', name_en: 'Nature', is_active: true, sort_order: 0, updated_at: '' };
const past = { ...emptySession(product.id), id: 'past', slug: 'summer-camp', title_zh: '夏日生活共创营', status: 'published' as const, phase: 'past' as const, registration_state: 'closed' as const, links: [{ kind: 'recruitment' as const, label_zh: '原招募资料', label_en: '', href: '/community-stories/invite' }, { kind: 'registration' as const, label_zh: '旧报名入口', label_en: '', href: 'https://example.com/register' }] };
function renderSessions() { return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter><LanguageProvider initialLanguage="zh"><ProgramSessions programId="life-co-creation-camp" /></LanguageProvider></MemoryRouter></QueryClientProvider>); }
beforeEach(() => vi.clearAllMocks());
it('shows historical recruitment and stable detail links while hiding old registration', async () => {
  vi.mocked(getProgramCatalog).mockResolvedValue({ products: [product], sessions: [past] });
  renderSessions();
  expect(await screen.findByRole('heading', { name: '夏日生活共创营' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '原招募资料' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: '旧报名入口' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: /活动详情/ })).toHaveAttribute('href', '/programs/sessions/summer-camp');
  expect(screen.getByRole('link', { name: '登记下一期意向' })).toHaveAttribute('href', '/programs/inquiry?program=life-co-creation-camp');
});
it('filters sessions by product category', async () => {
  vi.mocked(getProgramCatalog).mockResolvedValue({ products: [product, { ...product, id: 'other', name_zh: '另一主题' }], sessions: [past] });
  renderSessions();
  fireEvent.click(await screen.findByRole('button', { name: '另一主题' }));
  expect(screen.queryByRole('heading', { name: '夏日生活共创营' })).not.toBeInTheDocument();
});
it('classifies elapsed dates as past even before an administrator changes phase', () => {
  expect(isPastSession({ ...past, phase: 'upcoming', ends_on: '2026-10-01' }, '2026-10-17')).toBe(true);
  expect(isPastSession({ ...past, phase: 'upcoming', ends_on: '2026-10-17' }, '2026-10-17')).toBe(false);
});
it('provides a manual copy fallback when clipboard is unavailable', async () => {
  vi.mocked(getProgramCatalog).mockResolvedValue({ products: [product], sessions: [past] });
  renderSessions(); fireEvent.click(await screen.findByRole('button', { name: '复制转发链接' }));
  expect(await screen.findByRole('textbox', { name: '转发链接' })).toHaveValue(`${window.location.origin}/programs/sessions/summer-camp`);
});
