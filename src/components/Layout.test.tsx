import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Layout from './Layout';

vi.mock('./BrandHead', () => ({ default: () => null }));
vi.mock('./Navbar', () => ({ default: () => <nav aria-label="Main site navigation" /> }));
vi.mock('./Footer', () => ({ default: () => <footer /> }));
vi.mock('./MascotCompanion', () => ({ default: () => null }));
vi.mock('./SmoothScrollDamping', () => ({ default: () => null }));
vi.mock('./ui/TargetCursor', () => ({ default: () => null }));
vi.mock('./community/CommunityChrome', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="community-chrome">{children}</div>,
}));
vi.mock('./WebsiteAnalyticsTracker', () => ({ default: () => null }));

describe('Layout route transitions', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  it('keeps Community routes in a stable non-motion page shell', () => {
    render(
      <MemoryRouter initialEntries={['/community/stories']}>
        <Layout><p>Stories</p></Layout>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('community-chrome')).toBeInTheDocument();
    expect(document.querySelector('[data-route-transition="stable"]')).toBeInTheDocument();
    expect(document.querySelector('[data-route-transition="animated"]')).not.toBeInTheDocument();
  });

  it('preserves the existing animated shell outside Community', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <Layout><p>About</p></Layout>
      </MemoryRouter>,
    );

    expect(document.querySelector('[data-route-transition="animated"]')).toBeInTheDocument();
    expect(document.querySelector('[data-route-transition="stable"]')).not.toBeInTheDocument();
  });
});
