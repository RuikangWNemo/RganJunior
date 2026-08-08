import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import {
  HOME_INTRO_STORAGE_KEY,
  HOME_INTRO_VERSION,
} from '@/lib/homeIntro';
import HeroMascotStage from './HeroMascotStage';

vi.mock('@/hooks/useHeroMotion', () => ({
  useHeroMotion: () => ({
    stageRef: { current: null },
    pointer: { x: 0, y: 0, rotateX: 0, rotateY: 0 },
    expansionProgress: 0,
    handoffProgress: 0,
    prefersReducedMotion: false,
    handlePointerMove: () => {},
    handlePointerLeave: () => {},
    handleTouchStart: () => {},
    handleTouchMove: () => {},
    handleTouchEnd: () => {},
  }),
}));

function renderMascotStage() {
  const sectionRef = createRef<HTMLElement>();

  return render(
    <LanguageProvider>
      <HeroMascotStage sectionRef={sectionRef} />
    </LanguageProvider>,
  );
}

describe('HeroMascotStage community tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.setItem('rgan-lang', 'zh');
    localStorage.setItem(
      HOME_INTRO_STORAGE_KEY,
      JSON.stringify({
        version: HOME_INTRO_VERSION,
        lastVisitedAt: Date.now(),
        lastCompletedAt: Date.now(),
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('shows for three seconds after an initial delay, then repeats after seven hidden seconds', () => {
    renderMascotStage();

    const communityLink = screen.getByRole('link', {
      name: '在新窗口进入阿柑少年社群',
    });

    expect(communityLink).toHaveAttribute('data-tooltip-visible', 'false');

    act(() => vi.advanceTimersByTime(1_999));
    expect(communityLink).toHaveAttribute('data-tooltip-visible', 'false');

    act(() => vi.advanceTimersByTime(1));
    expect(communityLink).toHaveAttribute('data-tooltip-visible', 'true');

    act(() => vi.advanceTimersByTime(3_000));
    expect(communityLink).toHaveAttribute('data-tooltip-visible', 'false');

    act(() => vi.advanceTimersByTime(6_999));
    expect(communityLink).toHaveAttribute('data-tooltip-visible', 'false');

    act(() => vi.advanceTimersByTime(1));
    expect(communityLink).toHaveAttribute('data-tooltip-visible', 'true');
  });

  it('shows immediately while hovered or focused', () => {
    renderMascotStage();

    const communityLink = screen.getByRole('link', {
      name: '在新窗口进入阿柑少年社群',
    });

    fireEvent.mouseEnter(communityLink);
    expect(communityLink).toHaveAttribute('data-tooltip-visible', 'true');

    fireEvent.mouseLeave(communityLink);
    expect(communityLink).toHaveAttribute('data-tooltip-visible', 'false');

    fireEvent.focus(communityLink);
    expect(communityLink).toHaveAttribute('data-tooltip-visible', 'true');

    fireEvent.blur(communityLink);
    expect(communityLink).toHaveAttribute('data-tooltip-visible', 'false');
  });
});
