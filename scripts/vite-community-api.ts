import type { IncomingMessage, ServerResponse } from 'node:http';

import type { Plugin } from 'vite';

import type { ApiRequest, ApiResponse } from '../api/_lib/http.js';

type CommunityApiRequest = ApiRequest & {
  url?: string;
};

function apiResponse(response: ServerResponse): ApiResponse {
  const adapter: ApiResponse = {
    setHeader(name, value) {
      response.setHeader(name, value);
    },
    status(code) {
      response.statusCode = code;
      return adapter;
    },
    json(body) {
      if (!response.headersSent) {
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      response.end(JSON.stringify(body));
      return body;
    },
  };
  return adapter;
}

function errorCode(error: unknown): string {
  return error instanceof Error
    ? String((error as Error & { code?: string }).code ?? error.message)
    : 'DEV_COMMUNITY_API_FAILED';
}

function sendMiddlewareFailure(response: ServerResponse, error: unknown) {
  console.error('Community development API failed.', error);
  const adapted = apiResponse(response);
  adapted.status(500).json({ error: errorCode(error) });
}

function asApiRequest(request: IncomingMessage): CommunityApiRequest {
  return request as CommunityApiRequest;
}

export function communityDevelopmentApi(): Plugin {
  return {
    name: 'rgan-community-development-api',
    apply: 'serve',
    async configureServer(server) {
      const port = Number(process.env.COMMUNITY_COLLAB_PORT || 1234);
      const serverConfigured = Boolean(
        process.env.SUPABASE_URL
        && process.env.SUPABASE_PUBLISHABLE_KEY
        && process.env.SUPABASE_SECRET_KEY,
      );
      if (!Number.isSafeInteger(port) || port <= 0 || port > 65535) {
        throw new Error('INVALID_COMMUNITY_COLLAB_PORT');
      }

      if (serverConfigured) {
        try {
          const { getFieldNoteCollaborationServer } = await import(
            '../api/_lib/field-note-collaboration/runtime.js'
          );
          const collaborationServer = getFieldNoteCollaborationServer();
          if (!collaborationServer.httpServer.listening) {
            await collaborationServer.listen(port);
          }
          server.httpServer?.once('close', () => {
            void collaborationServer.destroy();
          });
        } catch (error) {
          if (errorCode(error) === 'EADDRINUSE') {
            console.warn(`Community collaboration server already listens on port ${port}.`);
          } else {
            console.error('Community collaboration server did not start.', error);
          }
        }
      } else {
        console.warn(
          'Community editor server is disabled. Add SUPABASE_SECRET_KEY to .env.local and restart Vite.',
        );
      }

      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://community.local').pathname;
        const adaptedRequest = asApiRequest(request);
        const adaptedResponse = apiResponse(response);

        try {
          if (pathname === '/api/community/username-login') {
            const { default: handler } = await import('../api/community/username-login.js');
            await handler(adaptedRequest, adaptedResponse);
            return;
          }

          if (pathname === '/api/community/guardian-consent-request') {
            const { default: handler } = await import('../api/community/guardian-consent-request.js');
            await handler(adaptedRequest, adaptedResponse);
            return;
          }

          if (pathname === '/api/community/guardian-consent-otp') {
            const { default: handler } = await import('../api/community/guardian-consent-otp.js');
            await handler(adaptedRequest, adaptedResponse);
            return;
          }

          if (pathname === '/api/community/guardian-consent-verify') {
            const { default: handler } = await import('../api/community/guardian-consent-verify.js');
            await handler(adaptedRequest, adaptedResponse);
            return;
          }

          if (pathname === '/api/community/field-note-editor') {
            if (!serverConfigured) {
              adaptedResponse.status(503).json({
                error: 'COMMUNITY_EDITOR_SERVER_NOT_CONFIGURED',
              });
              return;
            }
            const { handleFieldNoteEditor } = await import(
              '../api/_lib/field-note-collaboration/editor.js'
            );
            await handleFieldNoteEditor(adaptedRequest, adaptedResponse);
            return;
          }

          if (pathname.startsWith('/api/community/field-note-comments/')) {
            if (!serverConfigured) {
              adaptedResponse.status(503).json({
                error: 'COMMUNITY_EDITOR_SERVER_NOT_CONFIGURED',
              });
              return;
            }
            const { handleFieldNoteComments } = await import(
              '../api/_lib/field-note-collaboration/comments.js'
            );
            await handleFieldNoteComments(adaptedRequest, adaptedResponse);
            return;
          }
        } catch (error) {
          sendMiddlewareFailure(response, error);
          return;
        }

        next();
      });
    },
  };
}
