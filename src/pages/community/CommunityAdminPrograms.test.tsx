import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { emptySession, getProgramCatalog, saveProgramSession, uploadProgramPhoto } from '@/services/programs';
import CommunityAdminPrograms from './CommunityAdminPrograms';
const auth = vi.hoisted(() => ({ permissions: ['programs.manage'] }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('@/services/programs', async importOriginal => ({ ...await importOriginal<object>(), getProgramCatalog: vi.fn(), saveProgramSession: vi.fn(), uploadProgramPhoto: vi.fn(), resolveProgramPhotos: vi.fn().mockResolvedValue({}) }));
const session = { ...emptySession('product'), id: 'existing', slug: 'summer-camp', title_zh: '夏日生活共创营', location_zh: '铁牛村', date_label_zh: '2026年夏天' };
function renderAdmin() { return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter><LanguageProvider initialLanguage="zh"><CommunityAdminPrograms /></LanguageProvider></MemoryRouter></QueryClientProvider>); }
beforeEach(() => {
  vi.clearAllMocks(); auth.permissions = ['programs.manage'];
  vi.mocked(getProgramCatalog).mockResolvedValue({ products: [{ id: 'product', program_id: 'life-co-creation-camp', name_zh: '自然共创', name_en: '', is_active: true, sort_order: 0, updated_at: '' }], sessions: [session] });
  vi.mocked(saveProgramSession).mockImplementation(async value => value);
});
it('denies unauthorized users before fetching admin records', () => {
  auth.permissions = []; renderAdmin();
  expect(screen.getByRole('alert')).toHaveTextContent('没有营期管理权限'); expect(getProgramCatalog).not.toHaveBeenCalled();
});
it('edits highlights, publishes explicitly, and keeps the existing slug readonly', async () => {
  renderAdmin(); fireEvent.click(await screen.findByRole('button', { name: /夏日生活共创营/ }));
  expect(screen.getByLabelText(/活动链接名称/)).toHaveAttribute('readonly');
  fireEvent.change(screen.getByLabelText('亮点（中文，每行一条）'), { target: { value: '一起做饭\n森林探索' } });
  const button = screen.getByRole('button', { name: '发布到项目页' });
  const submit = new Event('submit', { bubbles: true, cancelable: true });
  Object.defineProperty(submit, 'submitter', { value: button });
  fireEvent(button.closest('form')!, submit);
  await waitFor(() => expect(saveProgramSession).toHaveBeenCalledWith(expect.objectContaining({ status: 'published', highlights_zh: ['一起做饭','森林探索'] })));
  expect(await screen.findByRole('status')).toHaveTextContent('营期已发布');
});
it('retains edits and displays save failures without claiming publication', async () => {
  vi.mocked(saveProgramSession).mockRejectedValue(new Error('内容已被其他管理员修改'));
  renderAdmin(); fireEvent.click(await screen.findByRole('button', { name: /夏日生活共创营/ }));
  fireEvent.change(screen.getByLabelText('活动标题（中文）'), { target: { value: '未保存的新标题' } });
  fireEvent.submit(screen.getByRole('button', { name: '保存草稿' }).closest('form')!);
  expect(await screen.findByRole('alert')).toHaveTextContent('其他管理员');
  expect(screen.getByLabelText('活动标题（中文）')).toHaveValue('未保存的新标题');
});
it('adds an uploaded photo for captions and preview without publishing automatically', async () => {
  vi.mocked(uploadProgramPhoto).mockResolvedValue({ src: 'editor/photo.jpg', alt_zh: '', alt_en: '' });
  renderAdmin(); fireEvent.click(await screen.findByRole('button', { name: /夏日生活共创营/ }));
  fireEvent.change(screen.getByLabelText('上传照片'), { target: { files: [new File(['photo'], 'photo.jpg', { type: 'image/jpeg' })] } });
  expect(await screen.findByLabelText('照片 1 说明（中文）')).toBeInTheDocument();
  expect(saveProgramSession).not.toHaveBeenCalled();
});
