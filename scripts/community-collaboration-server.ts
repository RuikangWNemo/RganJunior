import { createFieldNoteCollaborationServerFromEnv } from '../api/_lib/field-note-collaboration/server.js';

const configuredPort = Number(process.env.COMMUNITY_COLLAB_PORT || 1234);
if (!Number.isSafeInteger(configuredPort) || configuredPort <= 0 || configuredPort > 65535) {
  throw new Error('INVALID_COMMUNITY_COLLAB_PORT');
}

const server = createFieldNoteCollaborationServerFromEnv({ stopOnSignals: true });
await server.listen(configuredPort);
