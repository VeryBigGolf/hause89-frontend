import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import getAppointments from '@/libs/getAppointments';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user's appointments
  let appointments = [];
  let appointmentCount = 0;

  try {
    const response = await getAppointments(session.user.token);
    appointments = response.data || [];
    appointmentCount = response.count || appointments.length;
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
  }

  const isAdmin = session.user.role === 'admin';
  const remainingSlots = 3 - appointmentCount;

  return (
    <div className="page-container">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {session.user.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          {isAdmin
            ? 'Manage your massage shops and view all appointments.'
            : 'Here\'s your wellness dashboard.'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Your Appointments</p>
              <p className="text-2xl font-bold text-gray-800">{appointmentCount}</p>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Available Slots</p>
                <p className="text-2xl font-bold text-gray-800">
                  {remainingSlots} of 3
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">{isAdmin ? '👑' : '👤'}</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Account Type</p>
              <p className="text-2xl font-bold text-gray-800 capitalize">
                {session.user.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Browse Shops */}
        <Link href="/shops" className="card p-6 hover:ring-2 hover:ring-teal-500">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-50 rounded-lg flex items-center justify-center">
              <span className="text-3xl">🏪</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Browse Shops</h3>
              <p className="text-gray-500 text-sm">Explore massage shops</p>
            </div>
          </div>
        </Link>

        {/* My Appointments */}
        <Link href="/appointments" className="card p-6 hover:ring-2 hover:ring-teal-500">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 rounded-lg flex items-center justify-center">
              <span className="text-3xl">📋</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">My Appointments</h3>
              <p className="text-gray-500 text-sm">View & manage bookings</p>
            </div>
          </div>
        </Link>

        {/* Book New */}
        {!isAdmin && remainingSlots > 0 && (
          <Link href="/appointments/new" className="card p-6 hover:ring-2 hover:ring-teal-500">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center">
                <span className="text-3xl">➕</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Book New</h3>
                <p className="text-gray-500 text-sm">Schedule appointment</p>
              </div>
            </div>
          </Link>
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <>
            <Link href="/admin/shops" className="card p-6 hover:ring-2 hover:ring-amber-500">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-50 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">⚙️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Manage Shops</h3>
                  <p className="text-gray-500 text-sm">Add, edit, or delete</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/appointments" className="card p-6 hover:ring-2 hover:ring-amber-500">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-50 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">All Appointments</h3>
                  <p className="text-gray-500 text-sm">View all bookings</p>
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Recent Appointments */}
      {appointments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Appointments
          </h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.slice(0, 3).map((appt: any) => (
                  <tr key={appt._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {typeof appt.shop === 'object' ? appt.shop.name : 'Unknown Shop'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(appt.apptDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Confirmed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
