import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Layout from './Layout';

vi.mock('./BrandHead', () => ({ default: () => null }));
vi.mock('./Navbar', () => ({ default: () => <nav aria-label="Main site navigation" /> }));
vi.mock('./Footer', () => ({ default: () => <footer /> }));
vi.mock('./MascotCompanion', () => ({ default: () => null }));
vi.mock('./SmoothScrollDamping', () => ({ default: () => null }));
vi.mock('./ui/TargetCursor', () => ({ default: () => null }));
vi.mock('./WebsiteAnalyticsTracker', () => ({ default: () => null }));

const motionPreference = vi.hoisted(() => ({ reduced: false }));
vi.mock('framer-motion', async (importOriginal) => ({
  ...await importOriginal<typeof import('framer-motion')>(),
  useReducedMotion: () => motionPreference.reduced,
}));

describe('Layout route transitions', () => {
  beforeEach(() => {
    motionPreference.reduced = false;
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  it('uses a single stable shell when reduced motion is requested', () => {
    motionPreference.reduced = true;
    render(
      <MemoryRouter initialEntries={['/impact']}>
        <Layout><p>Impact</p></Layout>
      </MemoryRouter>,
    );
    expect(document.querySelectorAll('main')).toHaveLength(1);
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
