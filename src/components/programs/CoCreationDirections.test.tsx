import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import CoCreationDirections from './CoCreationDirections';

describe('Co-creation directions', () => {
  it('shows five directions collapsed and opens only the selected direction on click', () => {
    localStorage.setItem('rgan-lang', 'zh');
    render(<LanguageProvider><CoCreationDirections /></LanguageProvider>);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    for (const button of buttons) expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('参与生活体验营、生活共创营和小队任务的设计与现场支持。')).toBeVisible();
    fireEvent.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
  });
});
