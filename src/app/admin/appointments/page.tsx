'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import getAppointments from '@/libs/getAppointments';
import deleteAppointment from '@/libs/deleteAppointment';
import updateAppointment from '@/libs/updateAppointment';
import { Appointment, Shop, User } from '../../../../interfaces';

export default function AdminAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchAppointments();
    }
  }, [status, session, router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointments(session?.user?.token || '');
      setAppointments(response.data || []);
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    setActionLoading(id);
    try {
      await deleteAppointment(session?.user?.token || '', id);
      setAppointments(appointments.filter((a) => a._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (appt: Appointment) => {
    setEditingId(appt._id);
    setEditDate(new Date(appt.apptDate).toISOString().split('T')[0]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate('');
  };

  const handleUpdate = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await updateAppointment(session?.user?.token || '', id, editDate);
      setAppointments(
        appointments.map((a) => (a._id === id ? response.data : a))
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getShopName = (shop: string | Shop) => {
    return typeof shop === 'object' ? shop.name : 'Unknown Shop';
  };

  const getUserName = (user: string | User) => {
    return typeof user === 'object' ? user.name : 'Unknown User';
  };

  const getUserEmail = (user: string | User) => {
    return typeof user === 'object' ? user.email : '';
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

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          All Appointments 📊
        </h1>
        <p className="text-gray-600">
          View and manage all user appointments across all shops
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-8">
          {error}
          <button onClick={() => setError('')} className="ml-4 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Empty State */}
      {appointments.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Appointments Yet
          </h2>
          <p className="text-gray-500">
            No users have booked appointments yet.
          </p>
        </div>
      )}

      {/* Appointments Table */}
      {appointments.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shop
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {getUserName(appt.user)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getUserEmail(appt.user)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💆</span>
                        <span className="text-gray-900">{getShopName(appt.shop)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === appt._id ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="input-field py-1 px-2 text-sm"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      ) : (
                        <span className="text-gray-700">
                          {formatDate(appt.apptDate)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Confirmed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === appt._id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(appt._id)}
                              className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                              disabled={actionLoading === appt._id}
                            >
                              {actionLoading === appt._id ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                              disabled={actionLoading === appt._id}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(appt)}
                              className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                              disabled={actionLoading !== null}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(appt._id)}
                              className="text-red-600 hover:text-red-700 font-medium text-sm"
                              disabled={actionLoading !== null}
                            >
                              {actionLoading === appt._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </>
                        )}
                      </div>
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
