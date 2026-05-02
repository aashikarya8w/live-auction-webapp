import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import useWishlist from "../hooks/useWishlist";

const Wishlist = () => {
  const { wishlist } = useWishlist();

  return (
    <motion.div className="min-h-screen bg-gray-50 py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">My Wishlist</h1>
          <p className="text-gray-400 text-sm mt-1">{wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-200 py-20">
            <span className="text-5xl mb-4">🤍</span>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No saved items</h3>
            <p className="text-gray-400 text-sm mb-6">Click the heart icon on any product to save it</p>
            <Link to="/" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all">
              Browse Products →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default Wishlist;
