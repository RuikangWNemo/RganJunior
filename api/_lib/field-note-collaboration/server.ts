import { randomUUID } from 'node:crypto';

import type { Extension } from '@hocuspocus/server';
import { Server } from '@hocuspocus/server';

import {
  authorizeFieldNoteConnection,
  createSupabaseAuthorizationDependencies,
  type CollaborationAuthorizationDependencies,
  type FieldNoteCollaborationContext,
} from './authorization.js';
import {
  createFieldNoteDatabaseExtension,
  createFieldNotePersistence,
  type FieldNotePersistence,
} from './persistence.js';
import { createFieldNoteRedisExtension } from './redis.js';
import { assertClientUpdateDoesNotChangeComments } from './comment-guard.js';

export interface FieldNoteCollaborationServerOptions {
  authorization?: CollaborationAuthorizationDependencies;
  persistence?: FieldNotePersistence;
  redisUrl?: string;
  instanceName?: string;
  requireRedis?: boolean;
  stopOnSignals?: boolean;
}

function collaboratorColor(userId: string): string {
  let hash = 0;
  for (const character of userId) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  const palette = ['#D86B35', '#2F6B4F', '#3E6F8F', '#8B5E83', '#9A713A', '#477A73'];
  return palette[Math.abs(hash) % palette.length];
}

export function createFieldNoteCollaborationServer(
  options: FieldNoteCollaborationServerOptions = {},
): Server<FieldNoteCollaborationContext> {
  const authorization = options.authorization ?? createSupabaseAuthorizationDependencies();
  const persistence = options.persistence ?? createFieldNotePersistence();
  const extensions: Extension[] = [createFieldNoteDatabaseExtension(persistence)];

  const redisUrl = options.redisUrl?.trim();
  const instanceName = options.instanceName?.trim();
  if (redisUrl) {
    if (!instanceName) throw new Error('COMMUNITY_COLLAB_INSTANCE_NAME_REQUIRED');
    extensions.unshift(createFieldNoteRedisExtension(
      redisUrl,
      instanceName,
      `${instanceName}-${randomUUID()}`,
    ));
  } else if (options.requireRedis) {
    throw new Error('COMMUNITY_COLLAB_REDIS_REQUIRED');
  }

  return new Server<FieldNoteCollaborationContext>({
    name: instanceName || 'rgan-field-notes',
    stopOnSignals: options.stopOnSignals ?? false,
    quiet: true,
    debounce: 1_500,
    maxDebounce: 10_000,
    timeout: 30_000,
    websocketOptions: { maxPayload: 1024 * 1024 },
    extensions,
    async onAuthenticate({ connectionConfig, documentName, token }) {
      const result = await authorizeFieldNoteConnection(authorization, {
        documentName,
        token,
      });
      connectionConfig.readOnly = !result.access.canWrite;
      return result.context;
    },
    async beforeHandleAwareness({ context, states }) {
      if (!context) return;
      states.forEach((state) => {
        state.user = {
          id: context.userId,
          name: context.displayName,
          color: collaboratorColor(context.userId),
        };
      });
    },
    async beforeSync({ document, payload, type }) {
      // SyncStep1 carries a state vector rather than a Yjs update.
      if (type !== 0) assertClientUpdateDoesNotChangeComments(document, payload);
    },
    async onStoreDocument({ document, documentName }) {
      await persistence.materialize(documentName, document);
    },
  });
}

export function createFieldNoteCollaborationServerFromEnv(
  options: Pick<FieldNoteCollaborationServerOptions, 'stopOnSignals'> = {},
): Server<FieldNoteCollaborationContext> {
  const environment = process.env.NODE_ENV?.trim() || 'development';
  return createFieldNoteCollaborationServer({
    ...options,
    redisUrl: process.env.COMMUNITY_COLLAB_REDIS_URL,
    instanceName: process.env.COMMUNITY_COLLAB_INSTANCE_NAME,
    requireRedis: environment === 'production',
  });
}
