'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import getShops from '@/libs/getShops';
import createShop from '@/libs/createShop';
import updateShop from '@/libs/updateShop';
import deleteShop from '@/libs/deleteShop';
import { Shop } from '../../../../interfaces';
import ShopForm from '@/components/ShopForm';

export default function AdminShopsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/shops');
        return;
      }
      fetchShops();
    }
  }, [status, session, router]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await getShops();
      setShops(response.data || []);
    } catch (err) {
      setError('Failed to load shops');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Omit<Shop, '_id'>) => {
    setActionLoading(true);
    try {
      const response = await createShop(session?.user?.token || '', data);
      setShops([...shops, response.data]);
      setShowForm(false);
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: Omit<Shop, '_id'>) => {
    if (!editingShop) return;
    setActionLoading(true);
    try {
      const response = await updateShop(session?.user?.token || '', editingShop._id, data);
      setShops(shops.map((s) => (s._id === editingShop._id ? response.data : s)));
      setEditingShop(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shop? All appointments will also be deleted.')) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteShop(session?.user?.token || '', id);
      setShops(shops.filter((s) => s._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete shop');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditForm = (shop: Shop) => {
    setEditingShop(shop);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingShop(null);
  };

  const formatTime = (dateString: string) => {
    try {
      // Extract time from ISO format (YYYY-MM-DDTHH:mm:ssZ) without timezone conversion
      const timeMatch = dateString.match(/T(\d{2}):(\d{2})/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = timeMatch[2];
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${displayHours}:${minutes} ${period}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shops...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Manage Shops
          </h1>
          <p className="text-gray-600">
            Add, edit, or remove massage shops from the platform
          </p>
        </div>

        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add New Shop
          </button>
        )}
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

      {/* Shop Form Modal */}
      {showForm && (
        <div className="mb-8">
          <ShopForm
            shop={editingShop}
            onSubmit={editingShop ? handleUpdate : handleCreate}
            onCancel={closeForm}
            loading={actionLoading}
          />
        </div>
      )}

      {/* Empty State */}
      {shops.length === 0 && !showForm && (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Shops Yet
          </h2>
          <p className="text-gray-500 mb-6">
            Create your first massage shop to get started.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Your First Shop
          </button>
        </div>
      )}

      {/* Shops Table */}
      {shops.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shop
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shops.map((shop) => (
                <tr key={shop._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{shop.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                    {shop.address}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {shop.tel || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {formatTime(shop.openTime)} - {formatTime(shop.closeTime)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditForm(shop)}
                        className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                        disabled={actionLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(shop._id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
