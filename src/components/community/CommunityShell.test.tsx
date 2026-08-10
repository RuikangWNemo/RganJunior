import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityShell from './CommunityShell';

const authState = vi.hoisted(() => ({ permissions: [] as string[] }));

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => authState }));

describe('CommunityShell', () => {
  beforeEach(() => { authState.permissions = []; });
  it('uses five labeled primary destinations on mobile and keeps settings in desktop navigation', () => {
    render(
      <MemoryRouter initialEntries={['/community']}>
        <LanguageProvider initialLanguage="zh">
          <Routes>
            <Route path="/community" element={<CommunityShell />}>
              <Route index element={<p>Dashboard</p>} />
              <Route path="stories/square" element={<p>Square page</p>} />
            </Route>
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    );

    const mobileNavigation = screen.getByRole('navigation', { name: '社群主要导航' });
    expect(within(mobileNavigation).getAllByRole('link')).toHaveLength(5);
    for (const label of ['首页', '文章广场', '伙伴', '共练', '消息']) {
      expect(within(mobileNavigation).getByRole('link', { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: '我的文章' })).toHaveAttribute('href', '/community/stories');
    expect(screen.getByRole('link', { name: '设置' })).toHaveAttribute('href', '/community/settings');
  });

  it('keeps the member navigation mounted while only the outlet changes', () => {
    render(
      <MemoryRouter initialEntries={['/community']}>
        <LanguageProvider initialLanguage="zh">
          <Routes>
            <Route path="/community" element={<CommunityShell />}>
              <Route index element={<p>Dashboard</p>} />
              <Route path="stories/square" element={<p>Square page</p>} />
            </Route>
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    );

    const desktopNavigation = screen.getByRole('navigation', { name: '社群导航' });
    const mobileNavigation = screen.getByRole('navigation', { name: '社群主要导航' });
    fireEvent.click(within(mobileNavigation).getByRole('link', { name: '文章广场' }));

    expect(screen.getByText('Square page')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '社群导航' })).toBe(desktopNavigation);
  });

  it('shows website analytics only to administrators with analytics read permission', () => {
    authState.permissions = ['analytics.read'];
    render(
      <MemoryRouter initialEntries={['/community']}>
        <LanguageProvider initialLanguage="zh">
          <Routes><Route path="/community" element={<CommunityShell />}><Route index element={<p>Dashboard</p>} /></Route></Routes>
        </LanguageProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: '网站统计' })).toHaveAttribute('href', '/community/admin/analytics');
  });
});
