'use client';
import { Appointment, Shop } from '../../interfaces';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import deleteAppointment from '@/libs/deleteAppointment';
import updateAppointment from '@/libs/updateAppointment';

interface AppointmentCardProps {
  appointment: Appointment;
  onDelete?: (id: string) => void;
  onUpdate?: (appointment: Appointment) => void;
  showUserInfo?: boolean;
}

export default function AppointmentCard({
  appointment,
  onDelete,
  onUpdate,
  showUserInfo = false,
}: AppointmentCardProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState(
    new Date(appointment.apptDate).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shop = typeof appointment.shop === 'object' ? appointment.shop : null;
  const user = typeof appointment.user === 'object' ? appointment.user : null;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    setLoading(true);
    setError('');

    try {
      await deleteAppointment(session?.user?.token || '', appointment._id);
      onDelete?.(appointment._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await updateAppointment(
        session?.user?.token || '',
        appointment._id,
        editDate
      );
      onUpdate?.(response.data);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="card p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-semibold text-gray-800">
              {shop?.name || 'Unknown Shop'}
            </h3>
            {showUserInfo && user && (
              <p className="text-sm text-gray-500">
                Booked by: {typeof user === 'object' ? user.name : user}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="label">New Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="btn-primary py-2 px-4 text-sm"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="btn-secondary py-2 px-4 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <span>{formatDate(appointment.apptDate)}</span>
            </div>

            {shop && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>{shop.address}</span>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary py-2 px-4 text-sm"
              >
                Edit Date
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="btn-danger py-2 px-4 text-sm"
              >
                {loading ? 'Canceling...' : 'Cancel'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
