import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';

const {
  getMyCommunityApplication,
  refreshCommunity,
  requestGuardianConsent,
} = vi.hoisted(() => ({
  getMyCommunityApplication: vi.fn(),
  refreshCommunity: vi.fn(),
  requestGuardianConsent: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'under-14-user' },
    loading: false,
    communityState: {
      age_band: 'under_14',
      guardian_consent_status: 'required',
      destination: '/community/application',
    },
    refreshCommunity,
  }),
}));

vi.mock('@/services/memberships', () => ({
  getMyCommunityApplication,
}));

vi.mock('@/services/guardian-consent', () => ({
  getGuardianConsentRequest: vi.fn(),
  requestGuardianConsent,
  sendGuardianOtp: vi.fn(),
  verifyGuardianOtp: vi.fn(),
}));

let GuardianConsent: typeof import('./GuardianConsent').default;

describe('GuardianConsent manual mode', () => {
  beforeAll(async () => {
    vi.stubEnv('VITE_GUARDIAN_FLOW_MODE', 'manual');
    GuardianConsent = (await import('./GuardianConsent')).default;
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    getMyCommunityApplication.mockResolvedValue({ id: 31, status: 'pending_guardian' });
    requestGuardianConsent.mockResolvedValue({
      ok: true,
      requestId: 'request-31',
      expiresAt: '2026-09-08T00:00:00.000Z',
      mode: 'manual',
      delivery: 'staff_follow_up',
    });
  });

  it('stores a Guardian contact for staff follow-up without invite or OTP controls', async () => {
    render(
      <MemoryRouter initialEntries={['/community/guardian-consent']}>
        <LanguageProvider initialLanguage="zh"><GuardianConsent /></LanguageProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: '登记监护人联系方式' })).toBeInTheDocument();
    expect(screen.queryByText('发送手机验证码')).not.toBeInTheDocument();
    expect(screen.queryByText('发送确认邀请')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('监护人姓名 *'), { target: { value: '监护人甲' } });
    fireEvent.change(screen.getByLabelText('与我的关系 *'), { target: { value: '母亲' } });
    fireEvent.change(screen.getByLabelText('优先联系方法'), { target: { value: 'phone' } });
    fireEvent.change(screen.getByLabelText('监护人手机号 *'), { target: { value: '+8613800001234' } });
    fireEvent.click(screen.getByRole('button', { name: '提交联系方式' }));

    await waitFor(() => expect(requestGuardianConsent).toHaveBeenCalledWith(expect.objectContaining({
      applicationId: 31,
      guardianName: '监护人甲',
      relationship: '母亲',
      contactChannel: 'phone',
      contact: '+8613800001234',
    })));
    expect(await screen.findByRole('heading', { name: '联系方式已登记' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看申请状态' })).toHaveAttribute('href', '/community/application');
  });
});
