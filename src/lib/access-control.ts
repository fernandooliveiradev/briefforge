export const ACCESS_COOKIE_NAME = 'briefforge_access';
export const ACCESS_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

const SESSION_VERSION = 1;

function getAccessPassword(): string {
  return process.env['BRIEFFORGE_ACCESS_PASSWORD']?.trim() || '';
}

function getSessionSecret(): string {
  return process.env['BRIEFFORGE_SESSION_SECRET']?.trim() || getAccessPassword();
}

export function isAccessControlEnabled(): boolean {
  return getAccessPassword().length > 0;
}

export function isSafeRedirectPath(value: string | null): value is string {
  return !!value && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\');
}

function bytesToBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes)
    .map((byte) => String.fromCharCode(byte))
    .join('');

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  let diff = a.length ^ b.length;
  const maxLength = Math.max(a.length, b.length);

  for (let index = 0; index < maxLength; index += 1) {
    diff |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }

  return diff === 0;
}

async function getSigningKey(): Promise<CryptoKey> {
  const secret = getSessionSecret();

  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`briefforge-session:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signSessionPayload(payload: string): Promise<Uint8Array> {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));

  return new Uint8Array(signature);
}

export async function createAccessToken(): Promise<string> {
  if (!isAccessControlEnabled()) {
    throw new Error('Access control is not enabled');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({
      v: SESSION_VERSION,
      iat: now,
      exp: now + ACCESS_SESSION_MAX_AGE_SECONDS,
    }))
  );
  const signature = bytesToBase64Url(await signSessionPayload(payload));

  return `${payload}.${signature}`;
}

export async function isValidAccessToken(token: string | undefined): Promise<boolean> {
  if (!isAccessControlEnabled() || !token) {
    return false;
  }

  const [payload, signature, extra] = token.split('.');

  if (!payload || !signature || extra) {
    return false;
  }

  try {
    const decodedPayload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as {
      v?: unknown;
      exp?: unknown;
    };

    if (
      decodedPayload.v !== SESSION_VERSION
      || typeof decodedPayload.exp !== 'number'
      || decodedPayload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return false;
    }

    return constantTimeEqual(base64UrlToBytes(signature), await signSessionPayload(payload));
  } catch {
    return false;
  }
}
