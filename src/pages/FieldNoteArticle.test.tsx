import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import FieldNoteArticle from './FieldNoteArticle';

function renderArticle(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <LanguageProvider>
          <Routes>
            <Route path="/field-notes/:slug" element={<FieldNoteArticle />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('FieldNoteArticle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('renders article metadata, body blocks, and related reading', async () => {
    renderArticle('/field-notes/action-cards-before-conclusions');

    expect(await screen.findByRole('heading', { name: '孩子写下的行动卡，比结论更重要' })).toBeInTheDocument();
    expect(screen.getByText('我想改变的一件小事')).toBeInTheDocument();
    expect(screen.getByText('吃饭前不拿手机，先问清楚今天的菜从哪里来。')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '返回田野笔记' })).toHaveAttribute('href', '/field-notes');
    expect(await screen.findByRole('heading', { name: '继续阅读' })).toBeInTheDocument();
  });

  it('uses the existing not-found page for an unknown article', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderArticle('/field-notes/not-a-real-note');

    expect(await screen.findByRole('heading', { name: '404' })).toBeInTheDocument();
  });
});
