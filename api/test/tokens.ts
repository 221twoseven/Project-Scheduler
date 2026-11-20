// Locally signed stand-ins for Entra access tokens. The keys live only in memory for one test run.
import { Writable } from 'node:stream';
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair, type JWTPayload } from 'jose';
import { makeVerifier } from '../src/auth.ts';

export const TENANT = '70aa5330-416f-48cb-a64f-1a89f0196577';
export const AUDIENCE = '11111111-2222-3333-4444-555555555555'; // fictional API client ID
export const SCOPE = 'Systems.Access';
export const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // fictional person

const entra = await generateKeyPair('RS256');
const stranger = await generateKeyPair('RS256'); // a key Entra never published
const jwk = { ...(await exportJWK(entra.publicKey)), kid: 'test-key', alg: 'RS256' };

export const verify = makeVerifier({
  tenantId: TENANT,
  audience: AUDIENCE,
  scope: SCOPE,
  keys: createLocalJWKSet({ keys: [jwk] }),
});

/** A valid delegated token; `claims` overrides or (with undefined) removes any claim. */
export async function token(claims: Record<string, unknown> = {}, opts: { key?: 'stranger'; exp?: string } = {}) {
  const body: JWTPayload = {
    iss: `https://login.microsoftonline.com/${TENANT}/v2.0`,
    aud: AUDIENCE,
    tid: TENANT,
    oid: OID,
    scp: SCOPE,
    name: 'Test Person',
    ...claims,
  };
  for (const k of Object.keys(body)) if (body[k] === undefined) delete body[k];
  return new SignJWT(body)
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
    .setIssuedAt()
    .setExpirationTime(opts.exp ?? '5m')
    .sign(opts.key === 'stranger' ? stranger.privateKey : entra.privateKey);
}

/** Collects the app's JSON log lines. */
export function logSink() {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk, _enc, done) {
      lines.push(String(chunk));
      done();
    },
  });
  return { stream, lines };
}
