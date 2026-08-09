import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import ManualGuardianReviewPanel from './ManualGuardianReviewPanel';

const {
  confirmManualGuardianReview,
  declineManualGuardianReview,
  getManualGuardianReview,
} = vi.hoisted(() => ({
  confirmManualGuardianReview: vi.fn(),
  declineManualGuardianReview: vi.fn(),
  getManualGuardianReview: vi.fn(),
}));

vi.mock('@/services/guardian-consent', () => ({
  confirmManualGuardianReview,
  declineManualGuardianReview,
  getManualGuardianReview,
}));

const pendingReview = {
  applicationId: 31,
  requestId: 'request-31',
  requestStatus: 'pending',
  guardianName: '监护人甲',
  guardianRelationship: '母亲',
  contactChannel: 'phone',
  contact: '+8613800001234',
  contactLast4: '1234',
  legalDocument: {
    id: 8,
    key: 'guardian-community-consent',
    version: 2,
    locale: 'zh-CN',
    title: '监护人知情确认',
    status: 'active',
    effectiveAt: '2026-08-09T00:00:00.000Z',
  },
  requestCreatedAt: '2026-08-09T00:00:00.000Z',
  consentedAt: null,
  verificationMethod: null,
  verificationBasis: null,
  reviewerNote: null,
} as const;

describe('ManualGuardianReviewPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getManualGuardianReview.mockResolvedValue(pendingReview);
    confirmManualGuardianReview.mockResolvedValue({ ok: true, status: 'verified', consentId: 9 });
    declineManualGuardianReview.mockResolvedValue({ ok: true, status: 'declined' });
  });

  it('keeps contact hidden until requested and locks a confirmation in flight', async () => {
    let finishConfirmation: (() => void) | undefined;
    confirmManualGuardianReview.mockImplementation(
      () => new Promise((resolve) => { finishConfirmation = () => resolve({ ok: true, status: 'verified', consentId: 9 }); }),
    );
    const onUpdated = vi.fn().mockResolvedValue(undefined);
    const onBusyChange = vi.fn();
    render(
      <LanguageProvider initialLanguage="zh">
        <ManualGuardianReviewPanel
          applicationId={31}
          disabled={false}
          onBusyChange={onBusyChange}
          onUpdated={onUpdated}
        />
      </LanguageProvider>,
    );

    expect(screen.queryByText('+8613800001234')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '读取联系资料' }));
    expect(await screen.findByText('+8613800001234')).toBeInTheDocument();

    fireEvent.click(screen.getByText('已确认对方为父母或其他监护人'));
    fireEvent.click(screen.getByText('已向对方说明并提供当前知情文件'));
    fireEvent.click(screen.getByText('对方明确同意申请人加入社群'));
    fireEvent.change(screen.getByLabelText('核验依据摘要 *'), {
      target: { value: '电话联系母亲并逐项说明知情文件。' },
    });
    fireEvent.click(screen.getByRole('button', { name: '确认并进入普通审核' }));

    await waitFor(() => expect(confirmManualGuardianReview).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: '正在保存…' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '正在保存…' }));
    expect(confirmManualGuardianReview).toHaveBeenCalledTimes(1);

    finishConfirmation?.();
    await waitFor(() => expect(onUpdated).toHaveBeenCalledTimes(1));
    expect(onBusyChange).toHaveBeenNthCalledWith(1, true);
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
  });
});
