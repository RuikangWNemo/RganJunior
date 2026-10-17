import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
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

  it('keeps the public page visible without a pathname exit animation', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <Layout><p>About</p></Layout>
      </MemoryRouter>,
    );

    expect(document.querySelector('[data-route-transition="stable"]')).toBeVisible();
    expect(document.querySelector('[data-route-transition="animated"]')).not.toBeInTheDocument();
  });

  it('returns home immediately when going back while the project route is still loading', () => {
    const PendingProgram = lazy(() => new Promise<{ default: () => JSX.Element }>(() => {}));
    function Navigation() {
      const navigate = useNavigate();
      return <button onClick={() => navigate(-1)}>浏览器后退</button>;
    }
    const { container } = render(<MemoryRouter>
      <Navigation />
      <Layout><Suspense fallback={<p role="status">正在加载项目</p>}><Routes>
        <Route path="/" element={<><h1>阿柑少年首页</h1><Link to="/programs">了解项目</Link></>} />
        <Route path="/programs" element={<PendingProgram />} />
      </Routes></Suspense></Layout>
    </MemoryRouter>);
    const shell = container.querySelector('main');
    fireEvent.click(screen.getByRole('link', { name: '了解项目' }));
    expect(screen.getByRole('status')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '浏览器后退' }));
    expect(screen.getByRole('heading', { name: '阿柑少年首页' })).toBeVisible();
    expect(container.querySelector('main')).toBe(shell);
    expect(container.querySelectorAll('main')).toHaveLength(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
