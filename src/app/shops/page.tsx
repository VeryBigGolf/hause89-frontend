import getShops from "@/libs/getShops";
import ShopCard from "@/components/ShopCard";
import { Shop } from "../../../interfaces";

export default async function ShopsPage() {
  let shops: Shop[] = [];
  let error = null;

  try {
    const response = await getShops();
    shops = response.data || [];
  } catch (err) {
    error = "Failed to load massage shops. Please try again later.";
    console.error("Failed to fetch shops:", err);
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Massage Shops</h1>
        <p className="text-gray-600">
          Discover our collection of premium massage shops and book your
          relaxation session.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!error && shops.length === 0 && (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Shops Available
          </h2>
          <p className="text-gray-500">
            Check back later for new massage shops in your area.
          </p>
        </div>
      )}

      {/* Shops Grid */}
      {shops.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <ShopCard key={shop._id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
