import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Actions from './Actions';

function renderActions(initialEntry = '/programs') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
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

  it('opens with the project origin, a village photo, and Nate’s written invitation', () => {
    renderActions();

    expect(screen.getByRole('heading', { level: 1, name: '从真实生活出发，走向共创与行动' })).toBeInTheDocument();
    expect(screen.getByText('阿柑少年从 Nate 在铁牛村的成长经历中长出来。')).toBeInTheDocument();
    expect(screen.getByText(/它逐渐形成了一条青少年真实世界成长路径/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '铁牛村林盘、果园、鱼塘与院落的航拍图' })).toBeInTheDocument();
    expect(screen.getByText('Nate 的邀请')).toBeInTheDocument();
    expect(screen.getByText('—— Nate，阿柑少年发起人')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Nate/ })).not.toBeInTheDocument();
  });

  it('presents four editorial project entries with dedicated detail links', () => {
    const { container } = renderActions();

    expect(screen.getByRole('heading', { level: 2, name: '阿柑少年生活体验营' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '阿柑少年生活共创营' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '阿柑少年行动小组' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '青少年研究计划' })).toBeInTheDocument();

    const detailLinks = screen.getAllByRole('link', { name: /查看项目详情/ });
    expect(detailLinks).toHaveLength(4);
    expect(detailLinks[0]).toHaveAttribute('href', '/programs/life-experience-camp');
    expect(detailLinks[1]).toHaveAttribute('href', '/programs/life-co-creation-camp');
    expect(detailLinks[2]).toHaveAttribute('href', '/programs/action-group');
    expect(detailLinks[3]).toHaveAttribute('href', '/programs/public-projects');
    expect(container.querySelectorAll('[data-program-section] img')).toHaveLength(4);
    expect(container.querySelector('main > section')).toHaveAttribute('id', 'life-experience-camp');
  });

  it('provides a four-project section navigator with concise entry metadata', () => {
    renderActions();

    const nav = screen.getByRole('navigation', { name: '项目页面章节' });
    expect(within(nav).getByRole('link', { name: '生活体验营' })).toHaveAttribute(
      'href',
      '/programs#life-experience-camp',
    );
    expect(within(nav).getByRole('link', { name: '生活共创营' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: '行动小组' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: '青少年研究计划' })).toBeInTheDocument();
    expect(screen.queryByText('当前状态')).not.toBeInTheDocument();
    expect(screen.getByText('2 天 1 夜')).toBeInTheDocument();
    expect(screen.getByText('5 天 4 夜')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '常见问题' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '留下参与意向' })).not.toBeInTheDocument();
  });

  it('keeps the final program guidance focused without a duplicate email contact', () => {
    renderActions();

    expect(screen.getByRole('heading', { name: '从一个具体项目开始了解' })).toBeInTheDocument();
    expect(screen.queryByText('也可以直接告诉我们你的问题')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'contact@rganjunior.org' })).not.toBeInTheDocument();
  });

  it('fully replaces the previous activity archive', () => {
    renderActions();

    expect(screen.queryByRole('heading', { name: '我们做过的事' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '活动档案' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '天立国高 × 阿柑少年校园 CSA' })).not.toBeInTheDocument();
  });
});
