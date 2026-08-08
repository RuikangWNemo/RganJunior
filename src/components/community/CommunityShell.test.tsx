import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityShell from './CommunityShell';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ permissions: [] }),
}));

describe('CommunityShell', () => {
  it('uses five labeled primary destinations on mobile and keeps settings in desktop navigation', () => {
    render(
      <MemoryRouter initialEntries={['/community']}>
        <LanguageProvider initialLanguage="zh">
          <Routes>
            <Route path="/community" element={<CommunityShell />}>
              <Route index element={<p>Dashboard</p>} />
              <Route path="stories" element={<p>Stories page</p>} />
            </Route>
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    );

    const mobileNavigation = screen.getByRole('navigation', { name: '社群主要导航' });
    expect(within(mobileNavigation).getAllByRole('link')).toHaveLength(5);
    for (const label of ['首页', '文章', '伙伴', '共练', '消息']) {
      expect(within(mobileNavigation).getByRole('link', { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: '设置' })).toHaveAttribute('href', '/community/settings');
  });

  it('keeps the member navigation mounted while only the outlet changes', () => {
    render(
      <MemoryRouter initialEntries={['/community']}>
        <LanguageProvider initialLanguage="zh">
          <Routes>
            <Route path="/community" element={<CommunityShell />}>
              <Route index element={<p>Dashboard</p>} />
              <Route path="stories" element={<p>Stories page</p>} />
            </Route>
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    );

    const desktopNavigation = screen.getByRole('navigation', { name: '社群导航' });
    const mobileNavigation = screen.getByRole('navigation', { name: '社群主要导航' });
    fireEvent.click(within(mobileNavigation).getByRole('link', { name: '文章' }));

    expect(screen.getByText('Stories page')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '社群导航' })).toBe(desktopNavigation);
  });
});
