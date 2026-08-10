import { Redis } from '@hocuspocus/extension-redis';

export interface ParsedRedisUrl {
  host: string;
  port: number;
  options: {
    db?: number;
    password?: string;
    tls?: Record<string, never>;
    username?: string;
  };
}

export function parseRedisUrl(value: string): ParsedRedisUrl {
  const url = new URL(value);
  if (!['redis:', 'rediss:'].includes(url.protocol) || !url.hostname) {
    throw new Error('INVALID_COMMUNITY_COLLAB_REDIS_URL');
  }
  const port = Number(url.port || (url.protocol === 'rediss:' ? 6380 : 6379));
  if (!Number.isSafeInteger(port) || port <= 0 || port > 65535) {
    throw new Error('INVALID_COMMUNITY_COLLAB_REDIS_URL');
  }
  const dbText = url.pathname.replace(/^\//, '');
  const db = dbText ? Number(dbText) : undefined;
  if (db !== undefined && (!Number.isSafeInteger(db) || db < 0)) {
    throw new Error('INVALID_COMMUNITY_COLLAB_REDIS_URL');
  }

  return {
    host: url.hostname,
    port,
    options: {
      ...(db === undefined ? {} : { db }),
      ...(url.password ? { password: decodeURIComponent(url.password) } : {}),
      ...(url.protocol === 'rediss:' ? { tls: {} } : {}),
      ...(url.username ? { username: decodeURIComponent(url.username) } : {}),
    },
  };
}

export function createFieldNoteRedisExtension(
  redisUrl: string,
  namespace: string,
  identifier: string,
): Redis {
  const parsed = parseRedisUrl(redisUrl);
  return new Redis({
    ...parsed,
    identifier,
    prefix: fieldNoteRedisPrefix(namespace),
    awaitInitialSyncTimeout: 2_000,
  });
}

export function fieldNoteRedisPrefix(namespace: string): string {
  const normalized = namespace
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  if (!normalized) throw new Error('INVALID_COMMUNITY_COLLAB_INSTANCE_NAME');
  return `rgan:field-notes:${normalized}`;
}
