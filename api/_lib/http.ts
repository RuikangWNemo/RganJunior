import type { IncomingHttpHeaders } from 'node:http';

export type ApiRequest = AsyncIterable<unknown> & {
  method?: string;
  body?: unknown;
  headers: IncomingHttpHeaders;
};

export type ApiResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): unknown;
};

export function sendJson(response: ApiResponse, status: number, body: unknown) {
  response.setHeader('Cache-Control', 'no-store');
  return response.status(status).json(body);
}

export async function readJsonBody(request: ApiRequest): Promise<Record<string, unknown>> {
  if (request.body && typeof request.body === 'object' && !Buffer.isBuffer(request.body)) {
    return request.body as Record<string, unknown>;
  }
  if (typeof request.body === 'string') {
    return request.body ? JSON.parse(request.body) : {};
  }
  if (Buffer.isBuffer(request.body)) {
    const text = request.body.toString('utf8');
    return text ? JSON.parse(text) : {};
  }

  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

export function compactString(value: unknown, maxLength = 220): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

export function requestIp(request: ApiRequest): string {
  const forwarded = request.headers['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(',')[0]?.trim() || 'unknown';
}

export function requestOrigin(request: ApiRequest): string {
  const configured = process.env.COMMUNITY_PUBLIC_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  const protoHeader = request.headers['x-forwarded-proto'];
  const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || 'https';
  const hostHeader = request.headers['x-forwarded-host'] || request.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  if (!host) throw new Error('Missing COMMUNITY_PUBLIC_URL.');
  return `${proto}://${host}`;
}
