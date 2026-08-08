import { describe, expect, it } from 'vitest';
import { getLegacyProgramsRedirect } from './programRoutes';

describe('getLegacyProgramsRedirect', () => {
  it('preserves the product anchor when redirecting the former page route', () => {
    expect(getLegacyProgramsRedirect({ hash: '#action-group' })).toBe(
      '/programs#action-group',
    );
  });

  it('preserves the selected product when redirecting the former inquiry route', () => {
    expect(
      getLegacyProgramsRedirect({
        inquiry: true,
        search: '?program=public-projects',
      }),
    ).toBe('/programs/inquiry?program=public-projects');
  });
});
