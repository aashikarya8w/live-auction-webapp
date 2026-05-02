import { useEffect, useState } from "react";
import { getRecommendations } from "../services/recommendationService";
import ProductCard from "./ProductCard";
import useAuth from "../hooks/useAuth";

const RecommendedSection = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendations(user?.id)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-indigo-600 font-semibold text-sm mb-1">
            {user ? "✨ Personalized for you" : "🔥 Trending Now"}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            {user ? "Recommended for You" : "Popular Products"}
          </h2>
          {user && (
            <p className="text-gray-400 text-sm mt-1">
              Based on your bids and activity
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RecommendedSection;
