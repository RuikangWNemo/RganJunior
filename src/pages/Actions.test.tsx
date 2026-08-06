import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Actions from './Actions';

function renderActions() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <Actions />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('Actions', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('renders a chronological archive of real activities', () => {
    const { container } = renderActions();

    expect(screen.getByRole('heading', { name: '我们做过的事' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '活动档案' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(8);
    expect(screen.getByRole('heading', { name: '天立国高 × 阿柑少年校园 CSA' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '可持续农业研究与 CTB 论坛' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '阿柑少年 1.0 系列活动' })).toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(16);
  });

  it('does not render the previous conceptual sections or call to action', () => {
    renderActions();

    expect(screen.queryByText('三条行动线，进入真实世界。')).not.toBeInTheDocument();
    expect(screen.queryByText('不是项目清单，是行动的路径。')).not.toBeInTheDocument();
    expect(screen.queryByText('行动留下的痕迹。')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '进入行动网络' })).not.toBeInTheDocument();
  });
});
