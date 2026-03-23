import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If logged in, redirect based on role
  if (session?.user) {
    if (session.user.role === 'admin') {
      redirect('/admin/shops');
    } else {
      redirect('/shops');
    }
  }

  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-600 to-emerald-500 text-white py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find Your Perfect <br />
            <span className="text-amber-300">Massage Experience</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-teal-100 max-w-3xl mx-auto">
            Discover top-rated massage shops and book your relaxation session in minutes.
            Your journey to wellness starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shops"
              className="bg-white text-teal-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-teal-50 transition-all shadow-lg"
            >
              Browse Massage Shops
            </Link>
            <Link
              href="/register"
              className="bg-amber-400 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-300 transition-all shadow-lg"
            >
              Get Started Free
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}
