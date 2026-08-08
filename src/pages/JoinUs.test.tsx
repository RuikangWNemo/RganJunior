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

  it('renders a minimal cover and one continuous identity path', () => {
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
    expect(screen.getByRole('button', { name: '了解成为阿柑家长' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '了解成为合作伙伴' })).toBeInTheDocument();
    expect(container.querySelectorAll('.join-editorial-path path')).toHaveLength(4);
    expect(container.querySelector('.join-editorial-path--desktop path')).toHaveAttribute(
      'd',
      'M 42 300 C 190 300 218 88 425 108 S 650 360 936 214'
    );
    expect(container.querySelector('.join-editorial-path--desktop .join-editorial-path__base')).toHaveAttribute(
      'opacity',
      '0.9'
    );
    expect(container.querySelector('.join-editorial-guide__prompt-arc')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('.join-editorial-guide__prompt-arc textPath')).toHaveLength(2);
    expect(container.querySelector('.join-editorial-guide__prompt-arc textPath')).toHaveTextContent(
      '如果你想把好奇心带进山野，就来找我。'
    );
    expect(screen.getByRole('status')).toHaveTextContent('如果你想把好奇心带进山野，就来找我。');
    expect(screen.queryByText('R’GAN’S MARGIN NOTE')).not.toBeInTheDocument();

    expect(container.querySelector('.join-island-lanyard-layer')).not.toBeInTheDocument();
    expect(container.querySelector('.join-island-mobile-card')).not.toBeInTheDocument();
    expect(screen.queryByText('适合什么样的人')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /填写表单/ })).not.toBeInTheDocument();
  });

  it('reveals a restrained role hint during pointer preview', () => {
    renderJoinUs();
    const parents = screen.getByRole('button', { name: '了解成为阿柑家长' });

    expect(parents).toHaveAttribute('data-previewed', 'false');
    fireEvent.pointerEnter(parents);
    expect(parents).toHaveAttribute('data-previewed', 'true');
    expect(screen.getByText('在陪伴与边界之间同行')).toBeInTheDocument();

    fireEvent.pointerLeave(parents);
    expect(parents).toHaveAttribute('data-previewed', 'false');
  });

  it('uses the mascot guide to open the matching editorial folio', () => {
    renderJoinUs();

    fireEvent.click(screen.getByRole('button', { name: '向阿柑提问' }));
    expect(screen.getByText('此刻的你，更像——')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /我正在陪伴一个孩子/ }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '成为阿柑家长' })).toBeInTheDocument();
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
