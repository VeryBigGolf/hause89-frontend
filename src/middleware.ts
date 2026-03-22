export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard',
    '/appointments/:path*',
    '/admin/:path*',
  ],
};
