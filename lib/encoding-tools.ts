// Pure encoding/decoding helpers for the /lab/workbench instrument.
// Hashing itself is async (WebCrypto) and lives in the component; everything
// here is synchronous string work and safe to unit-test.

export function toBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

export function fromBase64(input: string): string | null {
  try {
    const bin = atob(input.trim().replace(/\s+/g, ''));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    return null;
  }
}

export function toHex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function urlEncode(input: string): string {
  try {
    return encodeURIComponent(input);
  } catch {
    return '';
  }
}

export function urlDecode(input: string): string | null {
  try {
    return decodeURIComponent(input.trim());
  } catch {
    return null;
  }
}

function base64UrlDecode(part: string): string | null {
  const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
  return fromBase64(padded);
}

export interface JwtDecoded {
  header: unknown;
  payload: Record<string, unknown>;
  signature: string;
  /** Human-readable notes on time-based claims. */
  claimNotes: string[];
  error?: string;
}

const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/;

export function looksLikeJwt(input: string): boolean {
  return JWT_RE.test(input.trim());
}

export function decodeJwt(token: string): JwtDecoded | null {
  const t = token.trim();
  if (!looksLikeJwt(t)) return null;
  const [h, p, s] = t.split('.');
  const headerRaw = base64UrlDecode(h);
  const payloadRaw = base64UrlDecode(p);
  if (headerRaw === null || payloadRaw === null) {
    return { header: null, payload: {}, signature: s ?? '', claimNotes: [], error: 'Not valid base64url in the token.' };
  }
  try {
    const header = JSON.parse(headerRaw);
    const payload = JSON.parse(payloadRaw) as Record<string, unknown>;
    const claimNotes: string[] = [];
    const now = Math.floor(Date.now() / 1000);
    const fmt = (n: number) => new Date(n * 1000).toISOString().replace('.000', '');
    if (typeof payload.exp === 'number') {
      claimNotes.push(
        `exp: ${fmt(payload.exp)} (${payload.exp < now ? 'EXPIRED' : 'valid'})`
      );
    }
    if (typeof payload.iat === 'number') claimNotes.push(`iat: issued ${fmt(payload.iat)}`);
    if (typeof payload.nbf === 'number') claimNotes.push(`nbf: not before ${fmt(payload.nbf)}`);
    return { header, payload, signature: s ?? '', claimNotes };
  } catch {
    return { header: null, payload: {}, signature: s ?? '', claimNotes: [], error: 'Token parts are not valid JSON.' };
  }
}
