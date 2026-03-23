import type { Metadata } from 'next';
import './globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import ReduxProvider from '@/redux/ReduxProvider';
import NextAuthProvider from '@/providers/NextAuthProvider';
import TopMenu from '@/components/TopMenu';

export const metadata: Metadata = {
  title: 'Hause89 Spa',
  description: 'Book your perfect massage experience at top-rated',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <NextAuthProvider session={session}>
            <TopMenu />
            <main>{children}</main>
          </NextAuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
