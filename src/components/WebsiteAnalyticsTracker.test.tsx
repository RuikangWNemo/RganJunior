import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import WebsiteAnalyticsTracker from './WebsiteAnalyticsTracker';

const mocks = vi.hoisted(() => ({
  beaconWebsiteAnalyticsEvent: vi.fn().mockReturnValue(true),
  sendWebsiteAnalyticsEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/website-analytics', () => mocks);

describe('WebsiteAnalyticsTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    let nextId = 1;
    vi.spyOn(window.crypto, 'randomUUID').mockImplementation(() => (
      `e${nextId++}000000-0000-4000-8000-000000000001` as `${string}-${string}-${string}-${string}-${string}`
    ));
  });

  it('records a normalized public route without arbitrary query parameters', async () => {
    render(
      <MemoryRouter initialEntries={['/field-notes/?utm_source=newsletter&email=private@example.test']}>
        <LanguageProvider initialLanguage="zh"><WebsiteAnalyticsTracker /></LanguageProvider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(mocks.sendWebsiteAnalyticsEvent).toHaveBeenCalledTimes(1));
    expect(mocks.sendWebsiteAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'page_view',
      path: '/field-notes',
      sourceCategory: 'campaign',
      utmSource: 'newsletter',
    }));
    expect(JSON.stringify(mocks.sendWebsiteAnalyticsEvent.mock.calls)).not.toContain('private@example.test');
  });

  it('does not record Community or administrator routes', async () => {
    render(
      <MemoryRouter initialEntries={['/community/admin/analytics']}>
        <LanguageProvider initialLanguage="zh"><WebsiteAnalyticsTracker /></LanguageProvider>
      </MemoryRouter>,
    );
    await Promise.resolve();
    expect(mocks.sendWebsiteAnalyticsEvent).not.toHaveBeenCalled();
  });
});
