import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import JoinUs from './JoinUs';

function renderJoinUs() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <JoinUs />
      </LanguageProvider>
    </MemoryRouter>
  );
}

describe('JoinUs', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps decorative paths in the structure for visually hidden presentation', () => {
    const { container } = renderJoinUs();
    const primaryJoinLink = screen.getByRole('link', { name: '立即加入' });

    expect(screen.getByRole('heading', { name: '成为阿柑少年' })).toBeInTheDocument();
    expect(screen.getByText('与我们同行')).toBeInTheDocument();
    expect(primaryJoinLink).toHaveAttribute('href', '/join/apply');
    expect(container.querySelector('#join-community')).toContainElement(primaryJoinLink);
    expect(container.querySelector('.join-editorial-cover')).not.toContainElement(primaryJoinLink);
    expect(screen.queryByText('SEED COMMUNITY')).not.toBeInTheDocument();
    expect(screen.queryByText('JOIN ISSUE 01')).not.toBeInTheDocument();
    expect(screen.queryByText('种子社群 · 加入我们')).not.toBeInTheDocument();
    expect(screen.queryByText('FIELD NOTE / 001')).not.toBeInTheDocument();
    expect(screen.queryByText('COMMUNITY INDEX')).not.toBeInTheDocument();
    expect(screen.queryByText('ISSUE 01—03')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: '加入身份选择' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '了解成为阿柑少年' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '了解加入守护团' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '了解成为合作伙伴' })).toBeInTheDocument();
    expect(container.querySelector('.join-editorial-cover__thread')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('.join-editorial-path')).toHaveLength(2);
    expect(container.querySelectorAll('.join-editorial-path path')).toHaveLength(4);
    expect(container.querySelector('.join-editorial-guide__prompt-arc')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('.join-editorial-guide__prompt-arc textPath')).toHaveLength(2);
    expect(container.querySelector('.join-editorial-guide__prompt-arc textPath')).toHaveTextContent(
      '如果你想把好奇心带进山野，就来找我。'
    );
    expect(screen.getByRole('status')).toHaveTextContent('如果你想把好奇心带进山野，就来找我。');
    expect(screen.queryByText('R-Gan Junior MARGIN NOTE')).not.toBeInTheDocument();

    expect(container.querySelector('.join-island-lanyard-layer')).not.toBeInTheDocument();
    expect(container.querySelector('.join-island-mobile-card')).not.toBeInTheDocument();
    expect(screen.queryByText('适合什么样的人')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /填写表单/ })).not.toBeInTheDocument();
  });

  it('reveals a restrained role hint during pointer preview', () => {
    renderJoinUs();
    const parents = screen.getByRole('button', { name: '了解加入守护团' });

    expect(parents).toHaveAttribute('data-previewed', 'false');
    fireEvent.pointerEnter(parents);
    expect(parents).toHaveAttribute('data-previewed', 'true');
    expect(screen.getByText('在陪伴与边界之间同行')).toBeInTheDocument();

    fireEvent.pointerLeave(parents);
    expect(parents).toHaveAttribute('data-previewed', 'false');
  });

  it('adds a practical joining guide with participation paths open by default', () => {
    renderJoinUs();

    expect(screen.getByRole('heading', { name: '当前参与方式' })).toBeInTheDocument();
    expect(screen.getByText('走进自然、生活与真实世界')).toBeInTheDocument();

    const fitTrigger = screen.getByRole('button', { name: /适合谁/ });
    const waysTrigger = screen.getByRole('button', { name: /当前参与方式/ });

    expect(waysTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(fitTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('生活体验营')).toBeVisible();
    expect(screen.getByText('生活共创营')).toBeVisible();
    expect(screen.getByText('阿柑少年行动小组')).toBeVisible();
    expect(screen.getByText('青少年研究与公共议题项目')).toBeVisible();

    fireEvent.click(fitTrigger);

    expect(fitTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(waysTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('走进自然和乡村生活')).toBeVisible();
    expect(screen.getByText('旅游打卡')).toBeVisible();
  });

  it('opens nested questions and exposes clear application actions', () => {
    renderJoinUs();

    fireEvent.click(screen.getByRole('button', { name: /常见问题/ }));
    const scheduleQuestion = screen.getByRole('button', {
      name: '现在没有明确营期，还可以报名吗？',
    });
    expect(scheduleQuestion).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(scheduleQuestion);

    expect(scheduleQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText('可以。你可以先提交参与意向，我们会在合适活动开放时联系你。')
    ).toBeVisible();

    expect(screen.getByRole('link', { name: '提交参与意向' })).toHaveAttribute(
      'href',
      '/join/apply'
    );
    expect(screen.getByRole('link', { name: '预约沟通' })).toHaveAttribute(
      'href',
      '#join-contact'
    );

    fireEvent.click(screen.getByRole('link', { name: '预约沟通' }));

    expect(screen.getByRole('button', { name: /联系我们/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('link', { name: 'contact@rganjunior.org' })).toHaveAttribute(
      'href',
      'mailto:contact@rganjunior.org'
    );
    expect(screen.getByRole('link', { name: '在线填写' })).toHaveAttribute(
      'href',
      '/join/apply'
    );
  });

  it('uses the mascot guide to open the matching editorial folio', () => {
    renderJoinUs();

    fireEvent.click(screen.getByRole('button', { name: '向阿柑提问' }));
    expect(screen.getByText('此刻的你，更像——')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /我愿意陪伴与支持青少年/ }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '加入守护团' })).toBeInTheDocument();
    expect(screen.getByText('真实社区、小规模同行和清晰边界。')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '填写表单，预约进一步沟通。' })).toHaveAttribute(
      'href',
      '/join/apply?audience=join-parents'
    );
  });

  it('opens a role folio directly from the connected path', () => {
    renderJoinUs();

    fireEvent.click(screen.getByRole('button', { name: '了解成为合作伙伴' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '成为合作伙伴' })).toBeInTheDocument();
    expect(screen.getByText('学校、教育者、研究者、乡村社区伙伴与生态行动伙伴。')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '填写表单，发起合作沟通。' })).toHaveAttribute(
      'href',
      '/join/apply?audience=join-partners'
    );
  });

  it('switches identities inside the editorial folio', () => {
    renderJoinUs();

    fireEvent.click(screen.getByRole('button', { name: '了解成为合作伙伴' }));
    const youthSwitch = screen
      .getAllByRole('button', { name: /阿柑少年/ })
      .find((button) => button.hasAttribute('aria-pressed'));

    expect(youthSwitch).toBeDefined();
    fireEvent.click(youthSwitch!);

    expect(screen.getByRole('heading', { name: '成为阿柑少年' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '填写表单，进入小规模深度探索。' })).toHaveAttribute(
      'href',
      '/join/apply?audience=join-youth'
    );
  });

  it('keeps rotating mascot notes visible and pauses while a folio is open', () => {
    vi.useFakeTimers();
    const { unmount } = renderJoinUs();

    expect(screen.getByRole('status')).toHaveTextContent('如果你想把好奇心带进山野，就来找我。');

    act(() => {
      vi.advanceTimersByTime(6500);
    });
    expect(screen.getByRole('status')).toHaveTextContent('不知道自己适合哪一种？先聊聊也可以。');

    fireEvent.click(screen.getByRole('button', { name: '向阿柑提问' }));
    fireEvent.click(screen.getByRole('button', { name: /我想去真实世界看看/ }));
    act(() => {
      vi.advanceTimersByTime(13000);
    });
    expect(screen.getByRole('status')).toHaveTextContent('不知道自己适合哪一种？先聊聊也可以。');

    unmount();
  });
});
