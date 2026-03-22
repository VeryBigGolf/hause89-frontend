'use client';
import { Shop } from '../../interfaces';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface ShopCardProps {
  shop: Shop;
  showBookButton?: boolean;
}

export default function ShopCard({ shop, showBookButton = true }: ShopCardProps) {
  const { data: session } = useSession();

  // Format time helper
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="card p-6">
      {/* Shop Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
            <span className="text-2xl">💆</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{shop.name}</h3>
            <p className="text-sm text-gray-500">Massage Shop</p>
          </div>
        </div>
      </div>

      {/* Shop Details */}
      <div className="space-y-3 mb-6">
        {/* Address */}
        <div className="flex items-start gap-3">
          <span className="text-gray-400 text-lg">📍</span>
          <div>
            <p className="text-xs text-gray-400 uppercase">Address</p>
            <p className="text-gray-700">{shop.address}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <span className="text-gray-400 text-lg">📞</span>
          <div>
            <p className="text-xs text-gray-400 uppercase">Phone</p>
            <p className="text-gray-700">{shop.tel || 'Not provided'}</p>
          </div>
        </div>

        {/* Hours */}
        <div className="flex items-start gap-3">
          <span className="text-gray-400 text-lg">🕐</span>
          <div>
            <p className="text-xs text-gray-400 uppercase">Hours</p>
            <p className="text-gray-700">
              {formatTime(shop.openTime)} - {formatTime(shop.closeTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Book Button */}
      {showBookButton && (
        <div>
          {session?.user ? (
            <Link
              href={`/appointments/new?shopId=${shop._id}`}
              className="block w-full btn-primary text-center py-3"
            >
              Book Appointment
            </Link>
          ) : (
            <Link
              href="/login"
              className="block w-full btn-secondary text-center py-3"
            >
              Login to Book
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
