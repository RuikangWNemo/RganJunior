import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { CommunityLoadingState } from './CommunitySurface';

describe('CommunityLoadingState', () => {
  it('renders an accessible label and layout-matching card skeletons', () => {
    const { container } = render(
      <LanguageProvider initialLanguage="zh">
        <CommunityLoadingState label="正在寻找社群伙伴…" variant="cards" />
      </LanguageProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('正在寻找社群伙伴…');
    expect(container.querySelector('.community-loading--cards')).toBeInTheDocument();
    expect(container.querySelectorAll('.community-loading__item')).toHaveLength(3);
    expect(container.querySelector('.community-loading__skeleton')).toHaveAttribute('aria-hidden', 'true');
  });
});
