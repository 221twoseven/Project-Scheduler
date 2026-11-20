import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

export type Caller = { oid: string; name: string };

export type AuthConfig = {
  tenantId: string;
  audience: string; // the API registration's Application (client) ID: v2 access tokens carry it as `aud`
  scope: string; // the delegated scope every token must hold, e.g. Systems.Access
  keys?: JWTVerifyGetKey; // tests pass local keys; production fetches Entra's published keys
};

/** 401: no usable token. 403: a valid token that lacks the scope. */
export class AuthError extends Error {
  status: 401 | 403;
  constructor(status: 401 | 403, code: string) {
    super(code);
    this.status = status;
  }
}

/** Validates an Entra v2 access token: signature against Entra's keys, issuer, tenant, audience, scope. */
export function makeVerifier(cfg: AuthConfig) {
  const keys =
    cfg.keys ??
    createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${cfg.tenantId}/discovery/v2.0/keys`));
  const issuer = `https://login.microsoftonline.com/${cfg.tenantId}/v2.0`;

  return async function verify(authorization: string | undefined): Promise<Caller> {
    const m = /^Bearer ([^\s]+)$/i.exec(authorization ?? '');
    if (!m) throw new AuthError(401, 'TOKEN_MISSING');
    let payload;
    try {
      ({ payload } = await jwtVerify(m[1], keys, { issuer, audience: cfg.audience, algorithms: ['RS256'] }));
    } catch {
      throw new AuthError(401, 'TOKEN_INVALID'); // never echo why: the reason can hint at the token
    }
    if (payload.tid !== cfg.tenantId) throw new AuthError(401, 'TOKEN_INVALID');
    if (typeof payload.oid !== 'string' || !payload.oid) throw new AuthError(401, 'TOKEN_INVALID');
    // Delegated tokens carry `scp`; app-only tokens carry `roles` instead and are refused here.
    const scopes = typeof payload.scp === 'string' ? payload.scp.split(' ') : [];
    if (!scopes.includes(cfg.scope)) throw new AuthError(403, 'SCOPE_MISSING');
    return { oid: payload.oid, name: typeof payload.name === 'string' ? payload.name : '' };
  };
}
