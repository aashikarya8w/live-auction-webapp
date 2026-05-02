import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CountdownTimer from "./CountdownTimer";
import { formatPrice } from "../utils/helpers";
import useWishlist from "../hooks/useWishlist";

const ProductCard = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const isSold = product?.status === "SOLD";
  const wishlisted = isWishlisted(product?.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-indigo-100 transition-shadow duration-300 cursor-pointer"
    >

      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gray-100 cursor-pointer"
        onClick={() => product?.id && navigate(`/product/${product.id}`)}>
        <img
          src={product?.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=300&fit=crop"}
          alt={product?.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product?.isAuction && !isSold && (
            <span className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          )}
          {isSold && (
            <span className="bg-gray-900/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">SOLD</span>
          )}
          {!product?.isAuction && !isSold && (
            <span className="bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">BUY NOW</span>
          )}
        </div>

        {/* Wishlist heart */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
            wishlisted
              ? "bg-red-500 text-white scale-110"
              : "bg-white/90 text-gray-400 hover:text-red-500 hover:scale-110"
          }`}
        >
          <svg className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Hover CTA */}
        <div
          onClick={() => product?.id && navigate(`/product/${product.id}`)}
          className="absolute inset-x-0 bottom-0 flex justify-center pb-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <span className="bg-white/95 backdrop-blur-sm text-indigo-700 text-xs font-bold px-5 py-2 rounded-full shadow-lg cursor-pointer">
            View Details →
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 cursor-pointer" onClick={() => product?.id && navigate(`/product/${product.id}`)}>
        <h2 className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors mb-3">
          {product?.name || "Unnamed Product"}
        </h2>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-medium mb-0.5 uppercase tracking-wide">
              {product?.isAuction ? "Starting" : "Price"}
            </p>
            <p className="text-indigo-600 font-black text-lg leading-none">
              {formatPrice(product?.price)}
            </p>
          </div>
          {product?.currentHighestBid && (
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-medium mb-0.5 uppercase tracking-wide">Top Bid</p>
              <p className="text-emerald-600 font-black text-lg leading-none">
                {formatPrice(product.currentHighestBid)}
              </p>
            </div>
          )}
        </div>

        {product?.isAuction && product?.auctionEndTime && !isSold && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Ends in</span>
            <span className="text-xs font-bold text-red-500">
              <CountdownTimer endTime={product.auctionEndTime} />
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
