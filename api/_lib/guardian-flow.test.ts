import { afterEach, describe, expect, it, vi } from 'vitest';

import { guardianFlowMode } from './guardian-flow.js';

describe('guardianFlowMode', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('selects manual mode explicitly', () => {
    vi.stubEnv('GUARDIAN_FLOW_MODE', 'manual');
    expect(guardianFlowMode()).toBe('manual');
  });

  it('preserves automated mode as the compatibility default', () => {
    vi.stubEnv('GUARDIAN_FLOW_MODE', '');
    expect(guardianFlowMode()).toBe('automated');
  });

  it('fails closed for unknown mode values', () => {
    vi.stubEnv('GUARDIAN_FLOW_MODE', 'disabled');
    expect(() => guardianFlowMode()).toThrow('INVALID_GUARDIAN_FLOW_MODE');
  });
});
