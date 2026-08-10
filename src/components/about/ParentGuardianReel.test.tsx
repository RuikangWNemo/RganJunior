import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ParentGuardianReel from './ParentGuardianReel';

const photos = ['/guardian-01.webp', '/guardian-02.webp', '/guardian-03.webp'] as const;

function renderReel() {
  return render(
    <LanguageProvider>
      <ParentGuardianReel photos={photos} />
    </LanguageProvider>,
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

    expect(screen.getByRole('button', { name: '查看家长守护团成员 1 资料' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    act(() => vi.advanceTimersByTime(2000));

    expect(screen.getByRole('button', { name: '查看家长守护团成员 2 资料' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('selects a hovered profile, pauses, and resumes after the pointer leaves', () => {
    const { container } = renderReel();
    const reel = container.querySelector('.about-v2-parent-guardian-reel');
    const secondSlide = container.querySelectorAll('.about-v2-parent-guardian-reel__slide')[1];

    fireEvent.mouseEnter(secondSlide);
    expect(screen.getByRole('button', { name: '查看家长守护团成员 2 资料' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByRole('button', { name: '查看家长守护团成员 2 资料' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.mouseLeave(reel);
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole('button', { name: '查看家长守护团成员 3 资料' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
