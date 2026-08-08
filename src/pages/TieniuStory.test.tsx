import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import TieniuStory from './TieniuStory';

function renderTieniuStory() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <TieniuStory />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('TieniuStory', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('connects the village introduction, location story, and land regeneration story', () => {
    renderTieniuStory();

    expect(screen.getByRole('heading', { level: 1, name: '铁牛村的故事' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '故事从哪里开始？' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '一片土地，如何慢慢恢复' })).toBeInTheDocument();
    expect(screen.getAllByText('1.7%')).toHaveLength(2);
    expect(screen.getByText('2.5%')).toBeInTheDocument();
    expect(screen.getByText('9900')).toBeInTheDocument();
  });

  it('keeps the static map fallback and return paths available', () => {
    renderTieniuStory();

    expect(screen.getByRole('img', { name: '西来镇、铁牛村与西来站的位置地图' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '返回真实场域' })).toHaveAttribute('href', '/about#places');
    expect(screen.getByRole('link', { name: '返回查看四个真实场域' })).toHaveAttribute(
      'href',
      '/about#places',
    );
  });
});
