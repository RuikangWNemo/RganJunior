import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ParentGuardianReel from './ParentGuardianReel';

const members = [1, 2, 3].map((number) => ({ id: `guardian-${number}`, photo: `/guardian-${number}.webp` }));

function renderReel() {
  return render(
    <MemoryRouter><LanguageProvider>
      <ParentGuardianReel members={members} />
    </LanguageProvider></MemoryRouter>,
  );
}

describe('ParentGuardianReel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('auto-advances every two seconds', () => {
    renderReel();

    expect(screen.getByRole('button', { name: '切换到守护团成员 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    act(() => vi.advanceTimersByTime(2000));

    expect(screen.getByRole('button', { name: '切换到守护团成员 2' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('keeps the hovered portrait still, pauses, and resumes after the pointer leaves', () => {
    const { container } = renderReel();
    const reel = container.querySelector('.about-v2-parent-guardian-reel');
    const secondSlide = container.querySelectorAll('.about-v2-parent-guardian-reel__slide')[1];

    fireEvent.mouseEnter(secondSlide);
    expect(screen.getByRole('button', { name: '切换到守护团成员 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByRole('button', { name: '切换到守护团成员 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.mouseLeave(reel);
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole('button', { name: '切换到守护团成员 2' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
