import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityChrome from './CommunityChrome';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    communityState: null,
    permissions: [],
    signOut: vi.fn(),
  }),
}));

describe('CommunityChrome', () => {
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
});
