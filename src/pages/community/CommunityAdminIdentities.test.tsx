import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityAdminIdentities from './CommunityAdminIdentities';

const mocks = vi.hoisted(() => ({
  getAdminIdentityStats: vi.fn(),
  listAdminIdentityLabels: vi.fn(),
  listAdminIdentityMembers: vi.fn(),
  setAdminMemberIdentities: vi.fn(),
  updateAdminIdentityLabel: vi.fn(),
}));

vi.mock('@/services/community-identities', () => mocks);

const labels = [
  {
    id: 1,
    slug: 'rgan-founder',
    name_zh: '阿柑少年发起人',
    name_en: 'Founder',
    description_zh: '发起并守护方向',
    description_en: 'Stewards the direction',
    color: '#F08A4B',
    icon: 'sparkles',
    planet_slug: 'youth',
    selectable_on_signup: false,
    is_public: true,
    is_active: true,
    is_core: true,
    sort_order: 10,
    updated_at: '2026-08-09T00:00:00Z',
  },
  {
    id: 2,
    slug: 'participant',
    name_zh: '参与者',
    name_en: 'Participant',
    description_zh: '参与活动',
    description_en: 'Joins activities',
    color: '#E9C979',
    icon: 'circle-dot',
    planet_slug: 'youth',
    selectable_on_signup: true,
    is_public: true,
    is_active: true,
    is_core: true,
    sort_order: 20,
    updated_at: '2026-08-09T00:00:00Z',
  },
];

const members = [{
  person_id: 9,
  user_id: 'member-9',
  display_name: '山风伙伴',
  nature_name: '山风',
  membership_status: 'active',
  primary_identity_slug: null,
  secondary_identity_slugs: [],
  planet_slugs: [],
  latest_assigned_at: null,
}];

describe('CommunityAdminIdentities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listAdminIdentityLabels.mockResolvedValue(labels);
    mocks.listAdminIdentityMembers.mockResolvedValue(members);
    mocks.getAdminIdentityStats.mockResolvedValue({
      declared: [{ slug: 'participant', count: 3 }],
      confirmedPrimary: [{ slug: 'participant', count: 1 }],
      planets: [{ slug: 'youth', count: 1 }],
      overlaps: [],
      pendingDeclarations: 3,
      missingPrimary: 1,
    });
    mocks.setAdminMemberIdentities.mockResolvedValue(undefined);
    mocks.updateAdminIdentityLabel.mockResolvedValue(undefined);
  });

  it('shows identity statistics, protects founder self-selection, and fills a missing member identity', async () => {
    render(
      <MemoryRouter>
        <LanguageProvider initialLanguage="zh"><CommunityAdminIdentities /></LanguageProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: '三星数据' })).toBeInTheDocument();
    expect(screen.getByText('待确认自报用户').nextSibling).toHaveTextContent('3');
    const founderCard = screen.getByText('rgan-founder · 核心标签').closest('article');
    expect(founderCard).not.toBeNull();
    expect(within(founderCard as HTMLElement).getByRole('checkbox', { name: '注册时允许自选' })).toBeDisabled();

    const memberCard = screen.getByRole('heading', { name: '山风' }).closest('article');
    expect(memberCard).not.toBeNull();
    fireEvent.change(within(memberCard as HTMLElement).getByRole('combobox', { name: '主身份 *' }), {
      target: { value: 'participant' },
    });
    fireEvent.click(within(memberCard as HTMLElement).getByRole('button', { name: '保存身份' }));

    await waitFor(() => expect(mocks.setAdminMemberIdentities).toHaveBeenCalledWith(9, 'participant', []));
  });
});
