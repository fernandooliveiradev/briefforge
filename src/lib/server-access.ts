import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE_NAME,
  isAccessControlEnabled,
  isSafeRedirectPath,
  isValidAccessToken,
} from '@/lib/access-control';
import { unauthorizedResponse } from '@/lib/api-response';

async function hasAccessCookie(): Promise<boolean> {
  if (!isAccessControlEnabled()) {
    return true;
  }

  const cookieStore = await cookies();
  return isValidAccessToken(cookieStore.get(ACCESS_COOKIE_NAME)?.value);
}

export async function requirePageAccess(nextPath: string): Promise<void> {
  if (await hasAccessCookie()) {
    return;
  }

  const safeNextPath = isSafeRedirectPath(nextPath) ? nextPath : '/dashboard';
  redirect(`/login?next=${encodeURIComponent(safeNextPath)}`);
}

export async function requireApiAccess(): Promise<NextResponse | null> {
  if (await hasAccessCookie()) {
    return null;
  }

  return unauthorizedResponse();
}
