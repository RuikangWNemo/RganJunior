import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from './action-inquiry.js';

function createResponse() {
  const response = {
    statusCode: 200,
    body: undefined,
    headers: {},
    setHeader: vi.fn((name, value) => {
      response.headers[name] = value;
    }),
    status: vi.fn((statusCode) => {
      response.statusCode = statusCode;
      return response;
    }),
    json: vi.fn((body) => {
      response.body = body;
      return response;
    }),
  };

  return response;
}

const validPayload = {
  program: 'life-experience-camp',
  name: '测试用户',
  participantProfile: '15 岁，高一',
  city: '成都',
  preferredTime: '寒假',
  partySize: '2',
  contact: 'probe@example.com',
  question: '想了解安全与费用。',
  consent: true,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('action enquiry endpoint', () => {
  it('rejects an unknown program before forwarding data', async () => {
    const response = createResponse();
    await handler({ method: 'POST', body: { ...validPayload, program: 'unknown' } }, response);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ ok: false, code: 'INVALID_PROGRAM' });
  });

  it('accepts the honeypot without contacting an external service', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const response = createResponse();
    await handler({ method: 'POST', body: { ...validPayload, website: 'spam.example' } }, response);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports a configuration error for an otherwise valid enquiry', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = createResponse();
    await handler({ method: 'POST', body: validPayload }, response);

    expect(response.statusCode).toBe(500);
    expect(response.body).toMatchObject({ ok: false, code: 'MISSING_GOOGLE_FORM_CONFIG' });
  });
});
