export type GuardianFlowMode = 'manual' | 'automated';

export function guardianFlowMode(): GuardianFlowMode {
  const value = process.env.GUARDIAN_FLOW_MODE?.trim().toLowerCase();
  if (!value || value === 'automated') return 'automated';
  if (value === 'manual') return 'manual';
  throw new Error('INVALID_GUARDIAN_FLOW_MODE');
}
