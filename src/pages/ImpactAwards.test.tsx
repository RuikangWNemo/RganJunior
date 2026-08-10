import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ImpactAwards from './ImpactAwards';

function renderImpactAwards() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/impact/awards']}>
        <LanguageProvider>
          <ImpactAwards />
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ImpactAwards', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('renders verified competition, publication, and forum records', async () => {
    renderImpactAwards();

    expect(await screen.findByRole('heading', { name: 'CTB 全球青年研究创新论坛' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'YSA Journal 论文发表' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '克莱蒙生态文明国际论坛' })).toBeInTheDocument();
    expect(screen.getByText('全球项目排位前 3.6%')).toBeInTheDocument();
    expect(screen.getByText('初步调研关注 11-15 岁青少年')).toBeInTheDocument();
  });

  it('keeps a path back to the impact overview', async () => {
    renderImpactAwards();

    expect(await screen.findByRole('link', { name: '返回统计' })).toHaveAttribute('href', '/impact');
    expect(screen.getByRole('link', { name: '获奖情况' })).toHaveAttribute('aria-current', 'page');
  });
});
