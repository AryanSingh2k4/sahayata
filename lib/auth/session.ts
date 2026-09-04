import { AuthUser } from './roles';

const DEFAULT_SECRET = process.env.SESSION_SECRET || 'sahayata_hadr_secret_key_2026_defense_auth_hmac256';
export const SESSION_COOKIE_NAME = 'sahayata_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// Base64url encoding/decoding helpers
function toBase64Url(str: string): string {
  if (typeof btoa === 'function') {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return Buffer.from(str).toString('base64url');
}

function fromBase64Url(base64url: string): string {
  if (typeof atob === 'function') {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
    return atob(base64 + pad);
  }
  return Buffer.from(base64url, 'base64url').toString('utf8');
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Creates a signed JWT-compatible token using Web Crypto HMAC-SHA256
 */
export async function createSessionToken(
  user: AuthUser,
  secret: string = DEFAULT_SECRET
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    ...user,
    iat: now,
    exp: now + SESSION_MAX_AGE
  };

  const headerB64 = toBase64Url(JSON.stringify(header));
  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const dataToSign = `${headerB64}.${payloadB64}`;

  const key = await getCryptoKey(secret);
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));

  // Convert signature buffer to base64url
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureBinary = String.fromCharCode(...signatureArray);
  const signatureB64 = toBase64Url(signatureBinary);

  return `${dataToSign}.${signatureB64}`;
}

/**
 * Verifies a signed JWT-compatible token using Web Crypto HMAC-SHA256
 */
export async function verifySessionToken(
  token: string,
  secret: string = DEFAULT_SECRET
): Promise<AuthUser | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const dataToVerify = `${headerB64}.${payloadB64}`;

  try {
    const key = await getCryptoKey(secret);
    const enc = new TextEncoder();

    // Decode signature from base64url to Uint8Array
    const binarySignature = fromBase64Url(signatureB64);
    const signatureBytes = new Uint8Array(binarySignature.length);
    for (let i = 0; i < binarySignature.length; i++) {
      signatureBytes[i] = binarySignature.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      enc.encode(dataToVerify)
    );

    if (!isValid) return null;

    const payloadJson = fromBase64Url(payloadB64);
    const payload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload as AuthUser;
  } catch (err) {
    console.error('Session token verification failed:', err);
    return null;
  }
}
