import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityChrome from './CommunityChrome';

const authState = vi.hoisted(() => ({
  user: null as { email: string } | null,
  communityState: null,
  permissions: [] as string[],
  signOut: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => authState }));
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

describe('CommunityChrome', () => {
  beforeEach(() => {
    authState.user = null;
    authState.permissions = [];
  });
  it('always exposes the smart community entry, main site, language, and stable mobile back target', () => {
    render(
      <MemoryRouter initialEntries={['/community/stories/new']}>
        <LanguageProvider initialLanguage="en">
          <CommunityChrome><p>Editor</p></CommunityChrome>
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Go to community home' })).toHaveAttribute('href', '/community/enter');
    expect(screen.getByRole('link', { name: 'Main site' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Back: Stories' })).toHaveAttribute('href', '/community/stories');
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('exposes website analytics in the administrator account menu', async () => {
    authState.user = { email: 'admin@example.test' };
    authState.permissions = ['analytics.read'];
    render(
      <MemoryRouter initialEntries={['/community']}>
        <LanguageProvider initialLanguage="zh"><CommunityChrome><p>Home</p></CommunityChrome></LanguageProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('网站统计')).toBeInTheDocument();
  });
});
