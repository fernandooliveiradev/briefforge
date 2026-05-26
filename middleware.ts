import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_COOKIE_NAME,
  isAccessControlEnabled,
  isSafeRedirectPath,
  isValidAccessToken,
} from './src/lib/access-control';

const publicFiles = /\.(?:ico|png|jpg|jpeg|gif|webp|svg|css|js|map|txt|xml)$/i;

function isPublicPath(pathname: string): boolean {
  return pathname === '/login'
    || pathname.startsWith('/share/')
    || pathname.startsWith('/api/access/')
    || pathname.startsWith('/_next/')
    || publicFiles.test(pathname);
}

export async function middleware(request: NextRequest) {
  if (!isAccessControlEnabled() || isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (await isValidAccessToken(token)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set('next', isSafeRedirectPath(nextPath) ? nextPath : '/dashboard');

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
