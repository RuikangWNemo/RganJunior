import type { Server } from '@hocuspocus/server';

import type { FieldNoteCollaborationContext } from './authorization.js';
import { createFieldNoteCollaborationServerFromEnv } from './server.js';

const runtimeState = globalThis as typeof globalThis & {
  __rganFieldNoteCollaborationServer?: Server<FieldNoteCollaborationContext>;
};

export function getFieldNoteCollaborationServer(): Server<FieldNoteCollaborationContext> {
  runtimeState.__rganFieldNoteCollaborationServer ??= createFieldNoteCollaborationServerFromEnv({
    stopOnSignals: false,
  });
  return runtimeState.__rganFieldNoteCollaborationServer;
}
