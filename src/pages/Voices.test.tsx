import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Voices from './Voices';

function renderVoices() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <Voices />
      </LanguageProvider>
    </MemoryRouter>
  );
}

describe('Voices', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('renders the project letter and four growth stories', () => {
    renderVoices();

    expect(screen.getByRole('heading', { name: '伙伴之声' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '成长故事' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '阅读：阿柑少年生活共创营｜来自阿柑少年的一份邀请' })
    ).toHaveAttribute('href', '/voices/summer-co-creation-camp-invitation');
    expect(
      screen.getByRole('link', { name: '阅读：一个孩子的成长，真的需要一整个村庄' })
    ).toHaveAttribute('href', '/voices/it-takes-a-village');
    expect(screen.getAllByRole('link', { name: /^阅读：/ })).toHaveLength(5);
  });
});
