import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Index from './Index';

vi.mock('@/components/home/HomeHeroFlow', () => ({ default: () => null }));
vi.mock('@/components/home/HeroMascotStage', () => ({ default: () => <div data-testid="hero-mascot" /> }));
vi.mock('@/components/ui/BlobCursor', () => ({ default: () => null }));

function renderIndex() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <LanguageProvider>
        <Index />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('homepage editorial refresh', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('presents the approved homepage story in order', () => {
    const { container } = renderIndex();

    expect(screen.getByRole('heading', { level: 1, name: '阿柑少年' })).toBeInTheDocument();
    expect(container.querySelector('.home-hero-section')).toHaveClass('min-h-svh');
    expect(container.querySelector('.home-hero-grid')).toHaveClass('min-h-svh');
    expect(container.querySelector('.home-hero-bottom-fade')).not.toBeInTheDocument();
    expect(screen.getByText('回归自然、生活与真实世界，长出内在的力量')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '最近，我们一起生活了5天。' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '身体力行' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '阿柑少年可以如何参与' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '一个少年的成长，慢慢长成一群人的行动。' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '成为阿柑少年、家长或伙伴。' })).toBeInTheDocument();

    const fieldScene = container.querySelector('#home-field-scene');
    const beliefs = container.querySelector('#home-beliefs');
    const programs = container.querySelector('#home-programs');
    expect(fieldScene?.compareDocumentPosition(beliefs as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(beliefs?.compareDocumentPosition(programs as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('links every homepage action to an existing route', () => {
    renderIndex();

    expect(screen.getByRole('link', { name: '了解项目' })).toHaveAttribute('href', '/programs');
    expect(screen.getByRole('link', { name: '查看我们的项目' })).toHaveAttribute('href', '/programs');
    expect(screen.getByRole('link', { name: '生活体验营：查看项目详情' })).toHaveAttribute('href', '/programs/life-experience-camp');

    fireEvent.click(screen.getByRole('button', { name: '02 生活共创营' }));
    expect(screen.getByRole('link', { name: '生活共创营：查看项目详情' })).toHaveAttribute('href', '/programs/life-co-creation-camp');

    fireEvent.click(screen.getByRole('button', { name: '03 行动小组' }));
    expect(screen.getByRole('link', { name: '行动小组：查看项目详情' })).toHaveAttribute('href', '/programs/action-group');

    fireEvent.click(screen.getByRole('button', { name: '04 青少年研究计划' }));
    expect(screen.getByRole('link', { name: '青少年研究计划：查看项目详情' })).toHaveAttribute('href', '/programs/public-projects');
    expect(screen.getByRole('link', { name: '阅读 Nate 的发起人故事' })).toHaveAttribute('href', '/story');
    expect(screen.getByRole('link', { name: '进入加入入口' })).toHaveAttribute('href', '/join');
  });

  it('uses descriptive real-scene imagery and the supplied participation data', () => {
    renderIndex();

    expect(screen.getByRole('img', { name: '孩子与家长围坐茶席共同交流' })).toBeInTheDocument();
    const rightPreview = screen.getByAltText('云雾中的南宝山自然现场');
    fireEvent.click(rightPreview);
    expect(rightPreview.closest('.home-scene-reel__slide')).toHaveAttribute('data-active', 'true');
    fireEvent.click(screen.getByRole('button', { name: '查看第 3 张照片' }));
    expect(screen.getByRole('img', { name: '青少年和家庭在田地里一起劳动' })).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getAllByText('5 天 4 夜')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '点击照片左侧查看上一张' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '点击照片右侧查看下一张' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '上一张照片' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '下一张照片' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '上一个项目' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '下一个项目' })).toBeInTheDocument();
  });
});
