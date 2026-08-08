import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import type { CommunityPerson } from '@/services/people';
import CommunityPeople from './CommunityPeople';

const people = [
  {
    id: 11,
    slug: 'orange',
    display_name: '橘子',
    nature_name: '小橘',
    name_zh: null,
    name_en: null,
    bio: '喜欢记录土地与食物。',
    city: '成都',
    region: '四川',
    country: '中国',
    avatar_media_id: null,
    joined_at: '2026-08-01',
    profile_visibility: 'members',
  },
  {
    id: 22,
    slug: 'pine',
    display_name: '松松',
    nature_name: null,
    name_zh: null,
    name_en: 'Pine',
    bio: '关心自然与社区行动。',
    city: '上海',
    region: null,
    country: '中国',
    avatar_media_id: null,
    joined_at: '2026-08-02',
    profile_visibility: 'members',
  },
] as unknown as CommunityPerson[];

const {
  listCommunityPeople,
  getMyCommunityProfile,
  createDirectConversationWithPerson,
} = vi.hoisted(() => ({
  listCommunityPeople: vi.fn(),
  getMyCommunityProfile: vi.fn(),
  createDirectConversationWithPerson: vi.fn(),
}));

vi.mock('framer-motion', () => ({ useReducedMotion: () => false }));
vi.mock('@/services/people', async () => ({ listCommunityPeople }));
vi.mock('@/services/community-profile', () => ({ getMyCommunityProfile }));
vi.mock('@/services/messages', () => ({ createDirectConversationWithPerson }));
vi.mock('@/components/community/CommunityPeoplePlanet', () => ({
  default: ({ onSelect }: { onSelect: (personId: number) => void }) => (
    <button type="button" data-testid="people-planet" onClick={() => onSelect(22)}>Select Pine on planet</button>
  ),
}));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

describe('CommunityPeople planet plaza', () => {
  beforeEach(() => {
    listCommunityPeople.mockReset().mockResolvedValue(people);
    getMyCommunityProfile.mockReset().mockResolvedValue({ person_id: 11 });
    createDirectConversationWithPerson.mockReset().mockResolvedValue('conversation-22');
  });

  it('opens in planet mode and keeps the accessible people index synchronized', async () => {
    render(
      <MemoryRouter initialEntries={['/community/people']}>
        <LanguageProvider initialLanguage="zh">
          <CommunityPeople />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('people-planet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '星球' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: '松松' }));
    expect(screen.getByRole('heading', { name: '松松' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '松松' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: '名单' }));
    expect(screen.queryByTestId('people-planet')).not.toBeInTheDocument();
    expect(screen.getByText('喜欢记录土地与食物。')).toBeInTheDocument();
  });

  it('reuses the existing message flow from the selected person panel', async () => {
    render(
      <MemoryRouter initialEntries={['/community/people']}>
        <LanguageProvider initialLanguage="zh">
          <CommunityPeople />
          <LocationProbe />
        </LanguageProvider>
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByTestId('people-planet'));
    fireEvent.click(screen.getByRole('button', { name: '发一条消息' }));

    await waitFor(() => expect(createDirectConversationWithPerson).toHaveBeenCalledWith(22));
    expect(screen.getByTestId('location')).toHaveTextContent('/community/messages?conversation=conversation-22');
  });
});
