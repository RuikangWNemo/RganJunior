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
    expect(screen.getByText('从 2,000+ 支参赛队伍中进入前 72 名')).toBeInTheDocument();
    expect(screen.getByText('留有 Most Popular Project 奖牌实物记录')).toBeInTheDocument();
    expect(screen.queryByText(/3.6%/)).not.toBeInTheDocument();
    expect(document.getElementById('ctb-global-forum')).toHaveTextContent('CTB 全球青年研究创新论坛');
    expect(document.getElementById('ysa-journal')).toHaveTextContent('YSA Journal 论文发表');
    expect(document.getElementById('claremont-eco-forum')).toHaveTextContent('克莱蒙生态文明国际论坛');
    expect(screen.getByText('初步调研关注 11-15 岁青少年')).toBeInTheDocument();
  });

  it('keeps a path back to the impact overview', async () => {
    renderImpactAwards();

    expect(await screen.findByRole('link', { name: '返回影响与记录' })).toHaveAttribute('href', '/impact#public-records');
    expect(screen.getByRole('link', { name: '获奖与成果' })).toHaveAttribute('aria-current', 'location');
  });
});
