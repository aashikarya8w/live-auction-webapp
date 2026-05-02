import { useEffect, useState } from "react";
import { getSimilarProducts } from "../services/recommendationService";
import ProductCard from "./ProductCard";

const SimilarProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!productId) return;
    getSimilarProducts(productId)
      .then(setProducts)
      .catch(() => {});
  }, [productId]);

  if (products.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-10">
      <div className="mb-5">
        <p className="text-indigo-600 font-semibold text-sm mb-1">You may also like</p>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">Similar Products</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
