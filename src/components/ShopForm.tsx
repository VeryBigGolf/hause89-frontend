'use client';
import { useState, useEffect } from 'react';
import { Shop } from '../../interfaces';

interface ShopFormProps {
  shop?: Shop | null;
  onSubmit: (data: Omit<Shop, '_id'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ShopForm({ shop, onSubmit, onCancel, loading = false }: ShopFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    tel: '',
    openTime: '09:00',
    closeTime: '21:00',
  });
  const [error, setError] = useState('');

  const extractTimeForInput = (value: string) => {
    if (/^\d{2}:\d{2}$/.test(value)) return value;

    const isoTimeMatch = value.match(/T(\d{2}:\d{2})/);
    if (isoTimeMatch) return isoTimeMatch[1];

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toTimeString().slice(0, 5);
    }

    return '';
  };

  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name,
        address: shop.address,
        tel: shop.tel || '',
        openTime: extractTimeForInput(shop.openTime) || '09:00',
        closeTime: extractTimeForInput(shop.closeTime) || '21:00',
      });
      return;
    }

    setFormData({
      name: '',
      address: '',
      tel: '',
      openTime: '09:00',
      closeTime: '21:00',
    });
  }, [shop]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Shop name is required');
      return;
    }

    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }

    if (formData.name.length > 50) {
      setError('Shop name cannot exceed 50 characters');
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(formData.openTime) || !/^\d{2}:\d{2}$/.test(formData.closeTime)) {
      setError('Please provide valid opening and closing times');
      return;
    }

    const [openHour, openMinute] = formData.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = formData.closeTime.split(':').map(Number);
    const openTotalMinutes = openHour * 60 + openMinute;
    const closeTotalMinutes = closeHour * 60 + closeMinute;

    if (!shop && closeTotalMinutes <= openTotalMinutes) {
      setError('Closing time must be after opening time');
      return;
    }

    try {
      // Build ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ
      const buildIsoTime = (timePart: string) => {
        const [hours, minutes] = timePart.split(':').map(Number);
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const [yyyy, mm, dd] = today.split('-');
        const hh = String(hours).padStart(2, '0');
        const min = String(minutes).padStart(2, '0');
        
        return `${yyyy}-${mm}-${dd}T${hh}:${min}:00Z`;
      };

      const openTimeIso = buildIsoTime(formData.openTime);
      const closeTimeIso = buildIsoTime(formData.closeTime);

      const payload: Omit<Shop, '_id'> = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        tel: formData.tel.trim() || (shop?.tel ?? ''),
        openTime: openTimeIso,
        closeTime: closeTimeIso,
      };

      console.log('Payload being sent:', payload);
      console.log('openTime format:', openTimeIso);
      console.log('closeTime format:', closeTimeIso);

      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save shop');
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {shop ? 'Edit Shop' : 'Add New Shop'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="label">
            Shop Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Zen Garden Spa"
            maxLength={50}
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            {formData.name.length}/50 characters
          </p>
        </div>

        <div>
          <label htmlFor="address" className="label">
            Address *
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input-field resize-none"
            placeholder="Full shop address"
            rows={3}
            required
          />
        </div>

        <div>
          <label htmlFor="tel" className="label">
            Phone Number
          </label>
          <input
            id="tel"
            name="tel"
            type="tel"
            value={formData.tel}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., 0812345678"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="openTime" className="label">
              Opening Time *
            </label>
            <input
              id="openTime"
              name="openTime"
              type="time"
              value={formData.openTime}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="closeTime" className="label">
              Closing Time *
            </label>
            <input
              id="closeTime"
              name="closeTime"
              type="time"
              value={formData.closeTime}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : shop ? 'Update Shop' : 'Create Shop'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 btn-secondary py-3"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
