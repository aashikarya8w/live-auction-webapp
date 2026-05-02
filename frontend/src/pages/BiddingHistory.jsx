import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getUserBids } from "../services/bidService";
import useAuth from "../hooks/useAuth";
import { formatDate, formatPrice } from "../utils/helpers";

const BiddingHistory = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    getUserBids(user.id)
      .then(setBids)
      .catch((err) => setError(err?.message || String(err)))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : 0;

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">My Bids</h1>
          <p className="text-gray-400 text-sm mt-1">{bids.length} bid{bids.length !== 1 ? "s" : ""} placed</p>
        </div>

        {/* Stats */}
        {bids.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            {[
              { label: "Total Bids", value: bids.length, icon: "🔨", color: "bg-indigo-50 text-indigo-600" },
              { label: "Highest Bid", value: formatPrice(highestBid), icon: "👑", color: "bg-amber-50 text-amber-600" },
              { label: "Active Auctions", value: bids.filter(b => b.product?.status === "AVAILABLE").length, icon: "⚡", color: "bg-emerald-50 text-emerald-600" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
                <p className="text-2xl font-black text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">⚠️ {error}</div>
        )}

        {bids.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-200 py-20">
            <span className="text-5xl mb-4">🔨</span>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No bids yet</h3>
            <p className="text-gray-400 text-sm mb-6">Find live auctions and start bidding</p>
            <Link to="/" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all">
              Browse Auctions →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {[...bids].reverse().map((bid) => {
              const isWinning = bid.product?.currentHighestBid === bid.amount;
              const isEnded = bid.product?.status === "SOLD";
              return (
                <div key={bid.id} className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all ${isWinning && !isEnded ? "border-emerald-200" : "border-gray-100"}`}>
                  <div className="flex items-center gap-5">

                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={bid.product?.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&h=200&fit=crop"}
                        alt={bid.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-gray-800">{bid.product?.name || "Product"}</h3>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(bid.bidTime)}</p>
                          {isWinning && !isEnded && (
                            <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                              👑 Highest Bidder
                            </span>
                          )}
                          {isEnded && isWinning && (
                            <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                              🎉 You Won!
                            </span>
                          )}
                          {isEnded && !isWinning && (
                            <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                              Auction Ended
                            </span>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-400 mb-0.5">Your Bid</p>
                          <p className="font-black text-xl text-indigo-600">{formatPrice(bid.amount)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default BiddingHistory;
