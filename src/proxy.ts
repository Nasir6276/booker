import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('booker_session');

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!session || !session.value) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Redirect signed-in users away from auth pages to dashboard
  if ((pathname === '/sign-in' || pathname === '/sign-up') && session?.value) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.[\\w]+$|_next/image|_next/static|favicon.ico|legal/.*).*)',
    '/(api|trpc)(.*)',
  ],
};
