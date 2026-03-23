"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import getShops from "@/libs/getShops";
import getAppointments from "@/libs/getAppointments";
import createAppointment from "@/libs/createAppointment";
import { Shop } from "../../../../interfaces";
import Link from "next/link";

export default function NewAppointmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedShopId = searchParams.get("shopId");

  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState(preselectedShopId || "");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointmentCount, setAppointmentCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      // Redirect admin to admin appointments page
      if (session?.user?.role === "admin") {
        router.push("/admin/appointments");
        return;
      }

      loadData();
    }
  }, [status, session]);

  const loadData = async () => {
    try {
      // Fetch shops and appointments in parallel
      const [shopsResponse, appointmentsResponse] = await Promise.all([
        getShops(),
        getAppointments(session?.user?.token || ""),
      ]);

      setShops(shopsResponse.data || []);
      setAppointmentCount(
        appointmentsResponse.count || appointmentsResponse.data?.length || 0,
      );
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedShopId) {
      setError("Please select a massage shop");
      return;
    }

    if (!appointmentDate) {
      setError("Please select a date");
      return;
    }

    // Check limit for non-admin users
    if (session?.user?.role !== "admin" && appointmentCount >= 3) {
      setError("You have reached the maximum of 3 appointments");
      return;
    }

    setLoading(true);

    try {
      await createAppointment(
        session?.user?.token || "",
        selectedShopId,
        appointmentDate,
      );

      router.push("/appointments");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create appointment",
      );
      setLoading(false);
    }
  };

  if (status === "loading" || pageLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === "admin";
  const remainingSlots = 3 - appointmentCount;
  const canBook = isAdmin || remainingSlots > 0;

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="page-container">
      {/* Back Button */}
      <Link
        href="/appointments"
        className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-6"
      >
        ← Back to Appointments
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Book Appointment
            </h1>
            <p className="text-gray-600 mt-2">
              Schedule your next massage session
            </p>
          </div>

          {/* Limit Warning */}
          {!isAdmin && !canBook && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-6 text-center">
              <p className="font-semibold">Maximum Appointments Reached</p>
              <p className="text-sm mt-1">
                You already have 3 appointments. Please cancel one to book more.
              </p>
              <Link
                href="/appointments"
                className="inline-block mt-3 text-sm underline"
              >
                View My Appointments
              </Link>
            </div>
          )}

          {/* Slots Info */}
          {!isAdmin && canBook && (
            <div className="bg-teal-50 border border-teal-200 text-teal-700 px-6 py-4 rounded-lg mb-6 text-center">
              <p>
                You have <strong>{remainingSlots}</strong> appointment slot
                {remainingSlots !== 1 ? "s" : ""} remaining
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          {canBook && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shop Selection */}
              <div>
                <label htmlFor="shop" className="label">
                  Select Massage Shop *
                </label>
                <select
                  id="shop"
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">-- Choose a shop --</option>
                  {shops.map((shop) => (
                    <option key={shop._id} value={shop._id}>
                      {shop.name} - {shop.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Shop Info */}
              {selectedShopId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {(() => {
                    const selectedShop = shops.find(
                      (s) => s._id === selectedShopId,
                    );
                    if (!selectedShop) return null;

                    const formatTime = (dateString: string) => {
                      try {
                        return new Date(dateString).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          },
                        );
                      } catch {
                        return dateString;
                      }
                    };

                    return (
                      <div className="space-y-2">
                        <p className="font-medium text-gray-800">
                          {selectedShop.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedShop.address}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedShop.tel || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTime(selectedShop.openTime)} -{" "}
                          {formatTime(selectedShop.closeTime)}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Date Selection */}
              <div>
                <label htmlFor="date" className="label">
                  Appointment Date *
                </label>
                <input
                  id="date"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={today}
                  className="input-field"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
