import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import FounderStory from './FounderStory';

function renderStory() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <FounderStory />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('FounderStory', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('tells Nate’s story as a concise five-part journey', () => {
    renderStory();

    expect(screen.getByRole('heading', { name: 'Nate 的阿柑少年故事' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '一个想法，怎样在生活里慢慢长大' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '我只是想找朋友来村里玩' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '从热闹之后，回到更深的生活' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '把自己的经历，变成给同龄人的邀请' })).toBeInTheDocument();
  });

  it('connects community support to the project’s ongoing action', () => {
    renderStory();

    expect(screen.getByRole('heading', { name: '这不是一个人长出来的故事' })).toBeInTheDocument();
    expect(screen.getByText(/麦昆塔社区和阿柑青年多年的生活与陪伴/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '一起生活' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '继续同行' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '回应真实问题' })).toBeInTheDocument();
    expect(screen.queryByText(/Leadership/)).not.toBeInTheDocument();
  });

  it('links to Nate’s full account and the three programs', () => {
    renderStory();

    expect(screen.getByRole('link', { name: /阅读 Nate 的完整自述/ })).toHaveAttribute('href', '/voices/it-takes-a-village');
    expect(screen.getByRole('link', { name: /查看三个项目/ })).toHaveAttribute('href', '/programs');
  });
});
