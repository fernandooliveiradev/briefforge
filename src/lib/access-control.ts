export const ACCESS_COOKIE_NAME = 'briefforge_access';

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

export async function createAccessToken(): Promise<string> {
  const password = getAccessPassword();
  const secret = getSessionSecret();
  const input = new TextEncoder().encode(`${password}:${secret}`);
  const digest = await crypto.subtle.digest('SHA-256', input);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function isValidAccessToken(token: string | undefined): Promise<boolean> {
  if (!isAccessControlEnabled() || !token) {
    return false;
  }

  return token === await createAccessToken();
}
