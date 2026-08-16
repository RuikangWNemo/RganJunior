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
    const heroSubtitle = container.querySelector('.home-hero-subtitle');
    expect(heroSubtitle).toHaveTextContent('回归自然、生活与真实世界，长出内在的力量');
    expect(heroSubtitle).toHaveClass('home-hero-subtitle--zh');
    expect(heroSubtitle?.querySelectorAll('.home-hero-subtitle__line')).toHaveLength(2);
    expect(heroSubtitle?.querySelectorAll('.home-hero-subtitle__line')[0]).toHaveTextContent(
      '回归自然、生活与真实世界，',
    );
    expect(heroSubtitle?.querySelectorAll('.home-hero-subtitle__line')[1]).toHaveTextContent('长出内在的力量');
    expect(screen.getByRole('heading', { level: 2, name: '最近，我们一起生活了5天4夜' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '我们相信什么' })).toBeInTheDocument();
    expect(screen.queryByText('身体力行')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '我们的项目' })).toBeInTheDocument();
    expect(screen.queryByText('阿柑少年可以如何参与')).not.toBeInTheDocument();
    const founderHeading = screen.getByRole('heading', {
      level: 2,
      name: '一个少年的成长，慢慢长成一群人的行动',
    });
    expect(founderHeading).toBeInTheDocument();
    expect(founderHeading.querySelectorAll('.home-founder-story__title-line')).toHaveLength(2);
    const communityHeading = screen.getByRole('heading', { level: 2, name: '成为阿柑少年、家长或伙伴。' });
    const communityLead = screen.getByText('种下一段长期同行的关系，一起走进真实世界。');
    expect(communityHeading).toHaveClass('seed-community__title');
    expect(communityLead).toHaveClass('seed-community__lead');
    expect(communityHeading.parentElement).toHaveClass('seed-community__headline-stack');
    expect(communityHeading.parentElement).toContainElement(communityLead);
    expect(container.querySelector('#seed-community .home-editorial-shell')).toBeInTheDocument();
    expect(container.querySelectorAll('.seed-community__role')).toHaveLength(3);
    expect(screen.getByText('进入加入入口')).toHaveClass('seed-community__entry-label');

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

    fireEvent.click(screen.getByRole('button', { name: '查看生活共创营' }));
    expect(screen.getByRole('link', { name: '生活共创营：查看项目详情' })).toHaveAttribute('href', '/programs/life-co-creation-camp');

    fireEvent.click(screen.getByRole('button', { name: '查看行动小组' }));
    expect(screen.getByRole('link', { name: '行动小组：查看项目详情' })).toHaveAttribute('href', '/programs/action-group');

    fireEvent.click(screen.getByRole('button', { name: '查看青少年研究计划' }));
    expect(screen.getByRole('link', { name: '青少年研究计划：查看项目详情' })).toHaveAttribute('href', '/programs/public-projects');
    expect(screen.getByRole('link', { name: '阅读 Nate 的发起人故事' })).toHaveAttribute('href', '/story');
    expect(screen.getByRole('link', { name: '进入加入入口' })).toHaveAttribute('href', '/join');
  });

  it('uses descriptive real-scene imagery and the supplied participation data', () => {
    const { container } = renderIndex();

    expect(screen.getByRole('img', { name: '车队沿着林间小路驶入南宝山' })).toBeInTheDocument();
    const firstScene = screen.getByRole('img', { name: '车队沿着林间小路驶入南宝山' });
    expect(firstScene).toHaveAttribute('loading', 'lazy');
    expect(firstScene).toHaveAttribute('srcset', expect.stringContaining('life-camp-01-arrival-road-640.webp 640w'));
    expect(container.querySelectorAll('.home-scene-reel__image-placeholder')).toHaveLength(6);
    const rightPreview = screen.getByAltText('青少年在森林里围坐交流');
    fireEvent.click(rightPreview);
    expect(rightPreview.closest('.home-scene-reel__slide')).toHaveAttribute('data-active', 'true');
    fireEvent.click(screen.getByRole('button', { name: '查看第 3 张照片' }));
    expect(screen.getByRole('img', { name: '青少年在山林球场上一起打篮球' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看第 9 张照片' })).toBeInTheDocument();
    expect(screen.getByText('阿柑少年生活共创营')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5 天 4 夜')).toBeInTheDocument();
    const fieldStats = container.querySelector('.home-field-scene__stats');
    expect(fieldStats).toHaveTextContent('阿柑少年生活共创营|11个孩子10个家庭');
    expect(fieldStats).not.toHaveTextContent('共同生活');
    expect(fieldStats).not.toHaveTextContent('5天4夜');
    expect(screen.getByRole('button', { name: '点击照片左侧查看上一张' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '点击照片右侧查看下一张' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '上一张照片' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '下一张照片' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看生活体验营' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看生活共创营' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看行动小组' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看青少年研究计划' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '上一个项目' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '下一个项目' })).not.toBeInTheDocument();
    const activeProgramImage = screen.getByRole('img', { name: '两位青少年在铁牛村菜园里体验劳动' });
    expect(activeProgramImage).toHaveAttribute('loading', 'lazy');
    expect(activeProgramImage).toHaveAttribute('srcset', expect.stringContaining('image-004-640.webp 640w'));
  });

  it('keeps the English field headline and camp data localized', () => {
    window.localStorage.setItem('rgan-lang', 'en');
    const { container } = renderIndex();

    const heroHeading = screen.getByRole('heading', { level: 1, name: 'R-Gan Junior' });
    expect(heroHeading.querySelector('svg')).toHaveAttribute('data-wordmark-language', 'en');
    expect(heroHeading.querySelector('svg')).toHaveAttribute('viewBox', '20 0 1568 306');

    const heroSubtitle = container.querySelector('.home-hero-subtitle');
    expect(heroSubtitle).toHaveClass('home-hero-subtitle--en');
    expect(heroSubtitle?.querySelectorAll('.home-hero-subtitle__line')).toHaveLength(2);
    expect(heroSubtitle?.querySelectorAll('.home-hero-subtitle__line')[0]).toHaveTextContent(
      'Return to nature, everyday life,',
    );
    expect(heroSubtitle?.querySelectorAll('.home-hero-subtitle__line')[1]).toHaveTextContent(
      'and the real world. Grow strength from within.',
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Recently, we lived together for 5 days and 4 nights' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'What we believe' })).toBeInTheDocument();
    expect(screen.queryByText('Learning by living')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Our programmes' })).toBeInTheDocument();
    expect(screen.queryByText('How to take part in R-Gan Junior')).not.toBeInTheDocument();
    const founderHeading = screen.getByRole('heading', {
      level: 2,
      name: "One young person's growth became a shared action.",
    });
    expect(founderHeading.querySelectorAll('.home-founder-story__title-line')).toHaveLength(2);
    expect(container.querySelector('.home-field-scene__headline')).toHaveClass('home-field-scene__headline--en');
    expect(container.querySelector('.home-field-scene__stats')).toHaveTextContent(
      "R-Gan Junior Life Co-creation Camp|11young people10families",
    );
  });
});
