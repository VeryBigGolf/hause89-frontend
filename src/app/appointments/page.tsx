'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import getAppointments from '@/libs/getAppointments';
import AppointmentCard from '@/components/AppointmentCard';
import { Appointment } from '../../../interfaces';
import Link from 'next/link';

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      // Redirect admin to admin appointments page
      if (session?.user?.role === 'admin') {
        router.push('/admin/appointments');
        return;
      }
      
      if (session?.user?.token) {
        fetchAppointments();
      }
    }
  }, [status, session]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointments(session?.user?.token || '');
      setAppointments(response.data || []);
    } catch (err) {
      setError('Failed to load appointments. Please try again.');
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setAppointments(appointments.filter((appt) => appt._id !== id));
  };

  const handleUpdate = (updatedAppt: Appointment) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((appt) => {
        if (appt._id !== updatedAppt._id) return appt;

        return {
          ...updatedAppt,
          user: typeof updatedAppt.user === 'object' ? updatedAppt.user : appt.user,
          shop: typeof updatedAppt.shop === 'object' ? updatedAppt.shop : appt.shop,
        };
      })
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  const remainingSlots = 3 - appointments.length;
  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            My Appointments
          </h1>
          <p className="text-gray-600">
            {isAdmin
              ? 'Manage your personal appointments'
              : `You have ${appointments.length} of 3 appointments booked`}
          </p>
        </div>

        {!isAdmin && remainingSlots > 0 && (
          <Link href="/appointments/new" className="btn-primary">
            + Book New
          </Link>
        )}
      </div>

      {/* Remaining Slots Warning */}
      {!isAdmin && appointments.length >= 3 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <p>You&apos;ve reached the maximum of 3 appointments. Cancel one to book more.</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Empty State */}
      {appointments.length === 0 && (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Appointments Yet
          </h2>
          <p className="text-gray-500 mb-6">
            Book your first massage appointment today!
          </p>
          <Link href="/appointments/new" className="btn-primary">
            Book Your First Appointment
          </Link>
        </div>
      )}

      {/* Appointments Grid */}
      {appointments.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
