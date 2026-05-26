import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import {
  ACCESS_COOKIE_NAME,
  ACCESS_SESSION_MAX_AGE_SECONDS,
  createAccessToken,
  isAccessControlEnabled,
  isSafeRedirectPath,
} from '@/lib/access-control';
import { limitLogin, rateLimitResponse } from '@/lib/rate-limit';

function safePasswordMatches(submittedPassword: string, expectedPassword: string): boolean {
  const submittedHash = createHash('sha256').update(submittedPassword).digest();
  const expectedHash = createHash('sha256').update(expectedPassword).digest();

  return timingSafeEqual(submittedHash, expectedHash);
}

export async function POST(request: NextRequest) {
  const limit = limitLogin(request);
  if (!limit.ok) {
    return rateLimitResponse(limit);
  }

  const formData = await request.formData().catch(() => null);
  const submittedPassword = formData?.get('password');
  const nextParam = request.nextUrl.searchParams.get('next');
  const nextPath = isSafeRedirectPath(nextParam) ? nextParam : '/dashboard';
  const expectedPassword = process.env['BRIEFFORGE_ACCESS_PASSWORD']?.trim() || '';

  if (!isAccessControlEnabled()) {
    return NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
  }

  if (
    typeof submittedPassword !== 'string'
    || !safePasswordMatches(submittedPassword, expectedPassword)
  ) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', '1');
    loginUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: await createAccessToken(),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env['NODE_ENV'] === 'production',
    path: '/',
    maxAge: ACCESS_SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
