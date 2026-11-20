import { randomUUID } from 'node:crypto';
import Fastify, { LogController } from 'fastify';
import { AuthError, type Caller } from './auth.ts';

declare module 'fastify' {
  interface FastifyRequest {
    caller?: Caller;
  }
  interface FastifyContextConfig {
    public?: boolean;
  }
}

export type AppOptions = {
  verify: (authorization: string | undefined) => Promise<Caller>;
  logStream?: NodeJS.WritableStream; // tests capture the log lines
};

export function buildApp({ verify, logStream }: AppOptions) {
  const app = Fastify({
    // Fastify's own request logs include the caller's IP; ours (onResponse below) carry only what §E10 lists.
    logController: new LogController({ disableRequestLogging: true }),
    logger: logStream ? { stream: logStream } : true,
    genReqId: () => randomUUID(),
    requestIdHeader: false, // our ID, never one a caller sends
  });

  app.addHook('onRequest', async (req, reply) => {
    reply.header('x-request-id', req.id);
    if (req.routeOptions.config?.public) return;
    // Secure by default: every route, and every unknown path, needs a valid token.
    try {
      req.caller = await verify(req.headers.authorization);
    } catch (e) {
      if (!(e instanceof AuthError)) throw e;
      return reply.code(e.status).send({ error: e.message, requestId: req.id });
    }
  });

  // The one log line per request: request ID (as reqId), caller oid, route, status, duration.
  // Never the token, a name, an email, a body or the raw URL's query string.
  app.addHook('onResponse', async (req, reply) => {
    req.log.info(
      {
        oid: req.caller?.oid ?? null,
        method: req.method,
        route: req.routeOptions.url ?? null,
        status: reply.statusCode,
        ms: Math.round(reply.elapsedTime),
      },
      'request',
    );
  });

  // Turning Fastify's request logs off also silences its error log; keep the error, without the request.
  app.addHook('onError', async (req, _reply, err) => {
    req.log.error({ err }, 'error');
  });

  app.get('/health', { config: { public: true } }, async () => ({ ok: true }));

  app.get('/api/me', async (req) => ({ oid: req.caller!.oid, name: req.caller!.name }));

  return app;
}
