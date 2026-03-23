export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/appointments/:path*',
    '/admin/:path*',
  ],
};
