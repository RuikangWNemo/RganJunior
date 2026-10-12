import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Impact from './Impact';

function renderImpact() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/impact']}>
        <LanguageProvider>
          <Impact />
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Impact', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('renders source-backed metrics without inventing missing totals', async () => {
    renderImpact();

    expect(await screen.findByRole('heading', { name: '看见真实成长如何发生' })).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();
    expect(screen.getByText('2,000+')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('3.6%')).toBeInTheDocument();
    expect(screen.getByText(/活动总数、独立参与青少年、独立家庭数、覆盖城市和持续参与伙伴/)).toBeInTheDocument();
    expect(screen.queryByText('96')).not.toBeInTheDocument();
  });

  it('presents five consent-aware record chapters and the relationship map', async () => {
    renderImpact();

    expect(await screen.findByRole('img', { name: /少年与家庭、伙伴、土地和公共行动的关系图/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '项目数据' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '成长故事' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '家庭观察' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '持续行动' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '外部记录' })).toBeInTheDocument();
    expect(screen.getByText('我看到孩子的一个变化是：')).toBeInTheDocument();
    expect(screen.getByText(/获得本人和家庭许可后使用/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看外部记录与获奖情况' })).toHaveAttribute('href', '/impact/awards');
  });
});
