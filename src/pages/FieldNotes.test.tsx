import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import FieldNotes from './FieldNotes';

function renderFieldNotes(path = '/field-notes') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <LanguageProvider>
          <Routes>
            <Route path="/field-notes" element={<FieldNotes />} />
            <Route path="/field-notes/all" element={<FieldNotes />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('FieldNotes', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('renders the featured edition and its two archive views', async () => {
    renderFieldNotes();

    expect(screen.getByRole('heading', { name: '田野笔记' })).toBeInTheDocument();
    expect(screen.getByText(/当前为接入前的内容样稿/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '精选文章' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '全部文章' })).toHaveAttribute('href', '/field-notes/all');
    expect(await screen.findAllByRole('heading', { name: '在一条真正走过的路上，重新理解成长' })).toHaveLength(2);
    expect(screen.getByRole('tab', { name: '按人物' })).toHaveAttribute('aria-selected', 'true');
  });

  it('searches across article titles and reports the result count', async () => {
    renderFieldNotes('/field-notes/all');

    const search = screen.getByRole('searchbox', { name: '搜索文章或人物' });
    fireEvent.change(search, { target: { value: 'John Locke' } });

    await waitFor(() => {
      expect(screen.getByText('找到 1 篇文章')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: '阅读：从 John Locke 论文回到身边的共同体' })).toHaveAttribute(
      'href',
      '/field-notes/from-john-locke-to-the-community-nearby',
    );
  });

  it('filters the horizontal people archive', async () => {
    renderFieldNotes('/field-notes/all');

    await screen.findByRole('button', { name: /Nate/ });
    fireEvent.click(screen.getByRole('button', { name: /Nate/ }));

    await waitFor(() => {
      expect(screen.getByText('找到 3 篇文章')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Nate/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches to topics and filters research articles', async () => {
    renderFieldNotes('/field-notes/all');

    fireEvent.click(screen.getByRole('tab', { name: '按题材' }));
    const research = await screen.findByRole('button', { name: /研究与实验/ });
    fireEvent.click(research);

    await waitFor(() => {
      expect(screen.getByText('找到 4 篇文章')).toBeInTheDocument();
    });
    expect(research).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows an actionable empty state and clears it', async () => {
    renderFieldNotes('/field-notes/all?q=没有这样的文章');

    expect(await screen.findByRole('heading', { name: '暂时没有匹配的文章' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '查看全部文章' }));

    await waitFor(() => {
      expect(screen.getByText('找到 8 篇文章')).toBeInTheDocument();
    });
  });
});
