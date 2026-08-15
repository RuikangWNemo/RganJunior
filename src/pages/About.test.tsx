import { act, fireEvent, render, screen, within } from '@testing-library/react';
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
    const { container } = renderAbout();

    expect(screen.getByText('把成长放回真实生活里')).toBeInTheDocument();
    expect(screen.queryByText('把成长放回真实生活里。')).not.toBeInTheDocument();
    expect(screen.queryByText('About / 关于阿柑少年')).not.toBeInTheDocument();

    const title = screen.getByRole('heading', { level: 1, name: '关于阿柑少年' });
    const hero = container.querySelector('.about-v2-hero--full-bleed');
    const brandLine = title.querySelector('.about-v2-hero__title-brand');

    expect(hero).toContainElement(title);
    expect(within(title).getByText('关于')).toHaveClass('about-v2-hero__title-about');
    expect(
      screen.getByText(
        '真正的成长发生在很多地方。在森林、茶山、饭桌、厨房、果园和运动场上，也在人与人的真实相处中。',
      ),
    ).toHaveClass('about-v2-hero__lead');
    expect(
      within(hero as HTMLElement).getByRole('img', {
        name: '铁牛村林盘、果园、鱼塘与院落的航拍图',
      }),
    ).toHaveAttribute('loading', 'eager');
    expect(brandLine?.querySelector('svg')).toHaveAttribute('data-wordmark-language', 'zh');
    expect(brandLine?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(within(title).queryByText('阿柑少年')).not.toBeInTheDocument();
  });

  it('presents the four team groups with youth, adult, and parent placeholder profiles', () => {
    const { container } = renderAbout();
    const team = container.querySelector('#team');

    expect(team).not.toBeNull();
    expect(
      within(team as HTMLElement).getByRole('img', { name: '阿柑少年青少年共创伙伴围坐桌边' }),
    ).toHaveAttribute('loading', 'lazy');
    expect(within(team as HTMLElement).getByText('Nate｜发起人')).toBeInTheDocument();
    expect(
      [...(team?.querySelectorAll('.about-v2-team-group__header h3') ?? [])].map(
        (heading) => heading.textContent,
      ),
    ).toEqual(['发起人', '青少年共创伙伴', '支持团队｜麦昆塔教育', '家长守护团']);
    expect(
      [...(team?.querySelector('.about-v2-team-groups')?.children ?? [])].map(
        (section) => section.getAttribute('aria-labelledby'),
      ),
    ).toEqual([
      'team-initiator-title',
      'team-youth-title',
      'co-creation-directions-title',
      'team-adult-title',
      'team-parent-guardian-title',
    ]);
    expect(screen.queryByAltText('青少年伙伴围绕真实项目记录与共创')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '阅读 Nate 的发起人故事' })).toHaveAttribute(
      'href',
      '/story',
    );
    const roster = screen.getByLabelText('青少年共创伙伴名录');
    const cards = within(roster).getAllByRole('article');

    expect(team?.querySelector('#team-youth-title')?.closest('.about-v2-team-group')).toContainElement(roster);
    expect(team?.querySelector('.about-v2-team-carousel')).not.toBeInTheDocument();
    expect(cards).toHaveLength(3);
    expect(within(roster).getAllByRole('heading', { level: 4 }).map((heading) => heading.textContent)).toEqual([
      '张天时',
      '陈若容',
      '黄若音',
    ]);
    expect(within(roster).getAllByText('？？？')).toHaveLength(9);
    expect(within(roster).getAllByRole('link', { name: '阅读伙伴故事' }).map((link) => link.getAttribute('href'))).toEqual([
      '/voices/technology-ecology-stars',
      '/voices/tea-connects-an-american-girl',
      '/voices/tea-kitchen-and-summer',
    ]);

    const adultRoster = screen.getByLabelText('支持团队成员名录');
    expect(within(adultRoster).getAllByRole('article')).toHaveLength(6);
    expect(within(adultRoster).getAllByRole('img')).toHaveLength(6);
    expect(within(adultRoster).getAllByRole('img').map((image) => image.getAttribute('src'))).toEqual([
      '/images/about/adult-support/zhao-jing.jpg',
      '/images/about/adult-support/adult-support-02.webp',
      '/images/about/adult-support/adult-support-05.webp',
      '/images/about/adult-support/adult-support-06.webp',
      '/images/about/adult-support/adult-support-07.webp',
      '/images/about/adult-support/adult-support-08.webp',
    ]);
    expect(within(adultRoster).getAllByRole('img').every((image) => image.getAttribute('loading') === 'lazy')).toBe(true);
    expect(within(adultRoster).getAllByRole('heading', { level: 4 }).map((heading) => heading.textContent)).toEqual([
      '赵璟',
      '贺超超',
      '秋鹭',
      '王睿康',
      '邓老师',
      '知予',
    ]);
    expect(within(adultRoster).getAllByText('？？？')).toHaveLength(6);

    expect(within(team as HTMLElement).getByText('参与共创，也支持每一次活动真实发生。')).toBeInTheDocument();
    const parentGuardianRoster = screen.getByLabelText('家长守护团成员名录');
    expect(parentGuardianRoster.querySelectorAll('.about-v2-parent-guardian-reel__slide')).toHaveLength(9);
    expect(parentGuardianRoster).toHaveAttribute('aria-roledescription', 'carousel');
    expect(within(parentGuardianRoster).getAllByRole('img').map((image) => image.getAttribute('src'))).toEqual([
      '/images/about/adult-support/adult-support-03.webp',
      '/images/about/adult-support/adult-support-04.webp',
      '/images/about/parent-guardian/parent-guardian-03.webp',
      '/images/about/parent-guardian/parent-guardian-04.webp',
      '/images/about/parent-guardian/parent-guardian-05.webp',
      '/images/about/parent-guardian/parent-guardian-06.webp',
      '/images/about/parent-guardian/parent-guardian-07.webp',
      '/images/about/parent-guardian/parent-guardian-08.webp',
      '/images/about/parent-guardian/parent-guardian-09.webp',
    ]);
    expect(within(parentGuardianRoster).getAllByRole('img').map((image) => image.getAttribute('loading'))).toEqual([
      'eager',
      'eager',
      'eager',
      'lazy',
      'lazy',
      'lazy',
      'lazy',
      'lazy',
      'lazy',
    ]);
    expect(within(parentGuardianRoster).getAllByText('？？？')).toHaveLength(18);
    expect(
      within(screen.getByRole('group', { name: '选择家长守护团成员' })).getAllByRole('button'),
    ).toHaveLength(9);
    expect(screen.getByRole('button', { name: '查看家长守护团成员 1 资料' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: '切换到家长守护团成员 4' }));
    expect(screen.getByRole('button', { name: '查看家长守护团成员 4 资料' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('keeps the English brand name together on one title line', () => {
    window.localStorage.setItem('rgan-lang', 'en');
    renderAbout();

    const title = screen.getByRole('heading', { level: 1, name: 'About R-Gan Junior' });
    const brandLine = title.querySelector('.about-v2-hero__title-brand');

    expect(within(title).getByText('About')).toHaveClass('about-v2-hero__title-about');
    expect(brandLine?.querySelector('svg')).toHaveAttribute('data-wordmark-language', 'en');
    expect(brandLine?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(within(title).queryByText('R-Gan Junior')).not.toBeInTheDocument();
  });

  it('uses the approved English names for all four people', () => {
    window.localStorage.setItem('rgan-lang', 'en');
    renderAbout();

    expect(screen.getByText('Nate Shi | Initiator')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'ZHANG Tianshi' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Rossie Chen' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Ruby Huang' })).toBeInTheDocument();
    expect(within(screen.getByLabelText('Youth co-creation partner directory')).getAllByText('？？？')).toHaveLength(9);
  });

  it('lists all five youth co-creation directions', () => {
    const { container } = renderAbout();
    const directions = container.querySelector('.about-v2-directions');

    expect(directions).not.toBeNull();
    expect(
      within(directions as HTMLElement)
        .getAllByRole('heading', { level: 4, hidden: true })
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
        .getAllByRole('heading', { level: 3, hidden: true })
        .map((heading) => heading.textContent),
    ).toEqual(['自然是最好的老师', '真实世界是最深刻的课堂', '青少年是正在发生的力量']);

    expect(
      within(method as HTMLElement)
        .getAllByRole('heading', { level: 3, hidden: true })
        .map((heading) => heading.textContent),
    ).toEqual(['真实生活', '真实社区', '真实议题', '青少年主理']);

    expect(
      within(places as HTMLElement)
        .getAllByRole('heading', { level: 3, hidden: true })
        .map((heading) => heading.textContent),
    ).toEqual(['铁牛村', '南宝山', '金鱼溪', '黎波黑茶部落']);
    expect(
      within(places as HTMLElement).getByRole('link', { name: '阅读铁牛村的故事' }),
    ).toHaveAttribute('href', '/about/tieniu');

    const nanbaoshanPhoto = within(places as HTMLElement).getByRole('img', {
      name: '云雾在南宝山层叠的森林山脊间流动',
      hidden: true,
    });
    const jinyuxiPhoto = within(places as HTMLElement).getByRole('img', {
      name: '阳光照进金鱼溪葱郁的峡谷森林',
      hidden: true,
    });
    const liboPhoto = within(places as HTMLElement).getByRole('img', {
      name: '贡嘎雪山晨光下的黎波村落与高原农田',
      hidden: true,
    });

    expect(nanbaoshanPhoto).toHaveAttribute('src', '/images/about/nanbaoshan-cloud-forest.webp');
    expect(jinyuxiPhoto).toHaveAttribute('src', '/images/about/jinyuxi-forest-valley.webp');
    expect(liboPhoto).toHaveAttribute('src', '/images/about/libo-highland.webp');
    expect(nanbaoshanPhoto.closest('article')).toHaveClass('about-v2-lab-card--standard');
    expect(jinyuxiPhoto.closest('article')).toHaveClass('about-v2-lab-card--standard');
    expect(liboPhoto.closest('article')).toHaveClass('about-v2-lab-card--standard');
  });

  it('keeps the remaining requested groups in user-controlled carousels', () => {
    renderAbout();

    expect(screen.queryByRole('region', { name: '青少年与支持团队轮播' })).not.toBeInTheDocument();

    const directionCarousel = screen.getByRole('region', { name: '青少年共创方向轮播' });
    fireEvent.click(within(directionCarousel).getByRole('button', { name: '查看生活体验设计' }));
    expect(directionCarousel.querySelector('[data-active="true"]')).toHaveTextContent('生活体验设计');

    const beliefCarousel = screen.getByRole('region', { name: '我们相信的事轮播' });
    fireEvent.click(within(beliefCarousel).getByRole('button', { name: '下一条信念' }));
    expect(beliefCarousel.querySelector('[data-active="true"]')).toHaveTextContent('真实世界是最深刻的课堂');

    const methodCarousel = screen.getByRole('region', { name: '我们如何做轮播' });
    fireEvent.click(within(methodCarousel).getByRole('button', { name: '查看青少年主理' }));
    expect(
      methodCarousel.querySelector('.about-fold-carousel__slide[data-active="true"]'),
    ).toHaveTextContent('青少年主理');

    const placesCarousel = screen.getByRole('region', { name: '三个生态基地轮播' });
    fireEvent.click(within(placesCarousel).getByRole('button', { name: '查看黎波黑茶部落' }));
    expect(placesCarousel.querySelector('[data-active="true"]')).toHaveTextContent('黎波黑茶部落');
  });

  it('maps the four supplied photo groups to the four ways of working', () => {
    renderAbout();

    const methodCarousel = screen.getByRole('region', { name: '我们如何做轮播' });
    const reels = methodCarousel.querySelectorAll('.about-method-photo-reel');

    expect(reels).toHaveLength(4);
    expect([...reels].map((reel) => reel.querySelectorAll('img').length)).toEqual([5, 6, 8, 8]);
    expect(
      [...reels].every((reel) => reel.parentElement?.firstElementChild === reel),
    ).toBe(true);
    expect(
      [...reels].map((reel) => reel.querySelector('img')?.getAttribute('src')),
    ).toEqual([
      '/images/about/methods/01/01-shared-life.webp',
      '/images/about/methods/02/01-community-visit.webp',
      '/images/about/methods/03/00-tieniu-aerial-overview.jpg',
      '/images/about/methods/04/01-youth-led-moment.webp',
    ]);
    expect(
      [...reels[2].querySelectorAll('img')].map((image) => image.getAttribute('src')),
    ).toEqual([
      '/images/about/methods/03/00-tieniu-aerial-overview.jpg',
      '/images/about/methods/03/06-shared-research.webp',
      '/images/about/methods/03/07-group-reflection.webp',
      '/images/about/methods/03/04-field-inquiry.webp',
      '/images/about/methods/03/05-public-question.webp',
      '/images/about/methods/03/01-issue-workshop.webp',
      '/images/about/methods/03/03-farming-practice.webp',
      '/images/about/methods/03/02-local-conversation.webp',
    ]);
    expect(within(methodCarousel).getByRole('region', { name: '真实生活照片轮播' })).toBeInTheDocument();
  });

  it('cycles through 01–04 as each active photo group finishes', () => {
    vi.useFakeTimers();

    try {
      renderAbout();
      const methodCarousel = screen.getByRole('region', { name: '我们如何做轮播' });
      const cycles = [
        { title: '真实生活', photoCount: 5, nextTitle: '真实社区' },
        { title: '真实社区', photoCount: 6, nextTitle: '真实议题' },
        { title: '真实议题', photoCount: 8, nextTitle: '青少年主理' },
        { title: '青少年主理', photoCount: 8, nextTitle: '真实生活' },
      ];

      cycles.forEach(({ title, photoCount, nextTitle }) => {
        const reel = within(methodCarousel).getByRole('region', { name: `${title}照片轮播` });

        for (let photoIndex = 1; photoIndex < photoCount; photoIndex += 1) {
          act(() => vi.advanceTimersByTime(4300));
          expect(
            within(reel).getByRole('button', { name: `查看${title}第 ${photoIndex + 1} 张照片` }),
          ).toHaveAttribute('aria-pressed', 'true');
        }

        act(() => vi.advanceTimersByTime(4300));

        expect(
          methodCarousel.querySelector('.about-fold-carousel__slide[data-active="true"]'),
        ).toHaveTextContent(nextTitle);
        expect(
          within(methodCarousel).getByRole('button', { name: `查看${nextTitle}第 1 张照片` }),
        ).toHaveAttribute('aria-pressed', 'true');
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
