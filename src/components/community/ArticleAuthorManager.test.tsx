import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ArticleAuthorManager from './ArticleAuthorManager';

const listAuthors = vi.fn();
const importArticle = vi.fn();
const linkAuthor = vi.fn();
vi.mock('@/services/field-notes', () => ({
  listArticleAuthors: () => listAuthors(),
  importAuthorArticle: (...args: unknown[]) => importArticle(...args),
  linkPendingArticleAuthor: (...args: unknown[]) => linkAuthor(...args),
}));
const authors = [
  { person_id: 11, slug: 'nate-real', display_name: 'Nate', nature_name: '液态氧', username: 'nate', has_account: true },
  { person_id: 22, slug: 'article-author-chengzi', display_name: '橙子', nature_name: null, username: null, has_account: false },
  { person_id: 33, slug: 'chengzi-real', display_name: '橙子', nature_name: null, username: 'chengzi', has_account: true },
];
const onChanged = vi.fn();
function renderManager(withPending = false) {
  render(<MemoryRouter><LanguageProvider initialLanguage="zh"><ArticleAuthorManager
    notes={withPending ? [{ id: 80, slug: 'chengzi-camp-letter', field_note_authors: [{ people: { id: 22 } }] }] as never : []}
    onChanged={onChanged}
  /></LanguageProvider></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: '导入文章与关联帐号' }));
}

beforeEach(() => {
  listAuthors.mockReset().mockResolvedValue(authors);
  importArticle.mockReset().mockResolvedValue(88);
  linkAuthor.mockReset().mockResolvedValue(1);
  onChanged.mockReset().mockResolvedValue(undefined);
});

describe('ArticleAuthorManager', () => {
  it('requires an explicit existing account for Nate rather than matching a name', async () => {
    renderManager();
    const select = await screen.findByRole('combobox', { name: '关联作者：相信就会看见 | 阿柑少年生活共创营回顾' });
    const row = select.closest('article')!;
    const button = row.querySelector('button')!;
    expect(button).toBeDisabled();
    expect(select).toHaveValue('');
    fireEvent.change(select, { target: { value: '11' } });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    await waitFor(() => expect(importArticle).toHaveBeenCalledWith(expect.objectContaining({ authorName: 'Nate-液态氧', requiresAccount: true }), 11));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it('can retain an unregistered author record while importing a draft', async () => {
    renderManager();
    const select = await screen.findByRole('combobox', { name: '关联作者：少年来信｜“橙子”写在阿柑少年生活共创营后' });
    fireEvent.click(select.closest('article')!.querySelector('button')!);
    await waitFor(() => expect(importArticle).toHaveBeenCalledWith(expect.objectContaining({ authorName: '橙子', requiresAccount: false }), undefined));
  });

  it('links a pending author to an explicitly selected registered account', async () => {
    renderManager(true);
    const pending = await screen.findByRole('combobox', { name: '待注册作者档案' });
    const account = screen.getByRole('combobox', { name: '作者已注册的帐号' });
    const button = screen.getByRole('button', { name: '确认关联这些文章' });
    expect(button).toBeDisabled();
    fireEvent.change(pending, { target: { value: '22' } });
    fireEvent.change(account, { target: { value: '33' } });
    expect(screen.getByText(/该作者的 1 篇文章/)).toBeInTheDocument();
    fireEvent.click(button);
    await waitFor(() => expect(linkAuthor).toHaveBeenCalledWith(22, 33));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it('shows a failed import without claiming success', async () => {
    importArticle.mockRejectedValue(new Error('无法连接数据库'));
    renderManager();
    const select = await screen.findByRole('combobox', { name: '关联作者：少年来信｜“橙子”写在阿柑少年生活共创营后' });
    fireEvent.click(select.closest('article')!.querySelector('button')!);
    expect(await screen.findByText('无法连接数据库')).toBeInTheDocument();
    expect(onChanged).not.toHaveBeenCalled();
  });
});
