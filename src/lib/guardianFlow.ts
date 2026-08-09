export type GuardianFlowMode = 'manual' | 'automated';

export const guardianFlowMode: GuardianFlowMode =
  import.meta.env.VITE_GUARDIAN_FLOW_MODE === 'manual' ? 'manual' : 'automated';

export const isManualGuardianFlow = guardianFlowMode === 'manual';
