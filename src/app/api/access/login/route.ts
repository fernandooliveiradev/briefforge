import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_COOKIE_NAME,
  createAccessToken,
  isAccessControlEnabled,
  isSafeRedirectPath,
} from '@/lib/access-control';

const sessionMaxAge = 60 * 60 * 12;

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const submittedPassword = formData?.get('password');
  const nextParam = request.nextUrl.searchParams.get('next');
  const nextPath = isSafeRedirectPath(nextParam) ? nextParam : '/dashboard';

  if (!isAccessControlEnabled()) {
    return NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
  }

  if (
    typeof submittedPassword !== 'string'
    || submittedPassword !== process.env['BRIEFFORGE_ACCESS_PASSWORD']?.trim()
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
    maxAge: sessionMaxAge,
  });

  return response;
}
