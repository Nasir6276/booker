import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.[\\w]+$|_next/image|_next/static|favicon.ico|legal/.*).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
