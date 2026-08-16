import { describe, expect, it } from 'vitest';

import { analyticsNavigationType, rateWebVital } from './webVitals';

describe('web vital privacy categories', () => {
  it('uses the published good and poor boundaries', () => {
    expect(rateWebVital('LCP', 2500)).toBe('good');
    expect(rateWebVital('LCP', 2501)).toBe('needs-improvement');
    expect(rateWebVital('CLS', 0.26)).toBe('poor');
    expect(rateWebVital('INP', 200)).toBe('good');
    expect(rateWebVital('TTFB', 1801)).toBe('poor');
  });

  it('coarsens unknown navigation values', () => {
    expect(analyticsNavigationType('reload')).toBe('reload');
    expect(analyticsNavigationType('restore')).toBe('other');
    expect(analyticsNavigationType(undefined)).toBe('other');
  });
});
