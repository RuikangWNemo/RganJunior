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

    expect(await screen.findByRole('heading', { name: '影响，发生在关系里' })).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();
    expect(screen.getByText('2,000+')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('3.6%')).toBeInTheDocument();
    expect(screen.getByText(/活动总数、独立家庭数、年龄分布和城市来源/)).toBeInTheDocument();
    expect(screen.queryByText('96')).not.toBeInTheDocument();
  });

  it('exposes the relationship map and consent-aware growth tracks', async () => {
    renderImpact();

    expect(await screen.findByRole('img', { name: /少年与家庭、伙伴、土地和公共行动的关系图/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '孩子的变化' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '家长的变化' })).toBeInTheDocument();
    expect(screen.getByText(/只在明确授权后公开/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看获奖情况' })).toHaveAttribute('href', '/impact/awards');
  });
});
