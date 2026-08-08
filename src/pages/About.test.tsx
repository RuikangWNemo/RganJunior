import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import About from './About';

function renderAbout() {
  return render(
    <MemoryRouter initialEntries={['/about']}>
      <LanguageProvider>
        <About />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('About editorial content system', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    });
  });

  it('uses the growth statement as the eyebrow and keeps the brand on its own title line', () => {
    renderAbout();

    expect(screen.getByText('把成长放回真实生活里')).toBeInTheDocument();
    expect(screen.queryByText('把成长放回真实生活里。')).not.toBeInTheDocument();
    expect(screen.queryByText('About / 关于阿柑少年')).not.toBeInTheDocument();

    const title = screen.getByRole('heading', { level: 1, name: '关于阿柑少年' });
    const brandLine = within(title).getByText('阿柑少年');

    expect(brandLine).toHaveClass('about-v2-hero__title-brand');
  });

  it('presents the approved three-layer team model without unconfirmed profiles', () => {
    const { container } = renderAbout();
    const team = container.querySelector('#team');

    expect(team).not.toBeNull();
    expect(within(team as HTMLElement).getByText('Nate｜发起人')).toBeInTheDocument();
    expect(within(team as HTMLElement).getByText('青少年共创伙伴')).toBeInTheDocument();
    expect(within(team as HTMLElement).getByText('成人支持团队｜麦昆塔教育')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '阅读 Nate 的发起人故事' })).toHaveAttribute(
      'href',
      '/story',
    );
    expect(screen.queryByText('张天时')).not.toBeInTheDocument();
    expect(screen.queryByText('Ruby（黄若音）')).not.toBeInTheDocument();
    expect(screen.queryByText('Rossie（陈若容）')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('青少年共创伙伴名录')).not.toBeInTheDocument();
  });

  it('lists all five youth co-creation directions', () => {
    const { container } = renderAbout();
    const directions = container.querySelector('.about-v2-directions');

    expect(directions).not.toBeNull();
    expect(
      within(directions as HTMLElement)
        .getAllByRole('heading', { level: 4 })
        .map((heading) => heading.textContent),
    ).toEqual(['项目与活动共创', '社群连接', '记录与传播', '田野研究', '生活体验设计']);
  });

  it('renders the three beliefs, four realities, and four living labs', () => {
    const { container } = renderAbout();
    const belief = container.querySelector('#belief');
    const method = container.querySelector('#method');
    const places = container.querySelector('#places');

    expect(
      within(belief as HTMLElement)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(['自然是最好的老师', '真实世界是最深刻的课堂', '青少年是正在发生的力量']);

    expect(
      within(method as HTMLElement)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(['真实生活', '真实社区', '真实议题', '青少年主理']);

    expect(
      within(places as HTMLElement)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(['铁牛村', '南宝山', '金鱼溪', '黎波黑茶部落']);
    expect(
      within(places as HTMLElement).getByRole('link', { name: '阅读铁牛村的故事' }),
    ).toHaveAttribute('href', '/about/tieniu');
  });
});
