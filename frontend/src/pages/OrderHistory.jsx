import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getUserOrders } from "../services/orderService";
import useAuth from "../hooks/useAuth";
import { formatDate, formatPrice } from "../utils/helpers";

const TRACKING_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const stepColor = {
  PLACED: "bg-blue-500",
  CONFIRMED: "bg-indigo-500",
  SHIPPED: "bg-purple-500",
  DELIVERED: "bg-emerald-500",
};

const stepIcon = {
  PLACED: "📋",
  CONFIRMED: "✅",
  SHIPPED: "🚚",
  DELIVERED: "🎉",
};

const TrackingBar = ({ status }) => {
  const currentIdx = TRACKING_STEPS.indexOf(status || "PLACED");
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">Order Tracking</p>
      <div className="flex items-center gap-0">
        {TRACKING_STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                i <= currentIdx ? stepColor[step] + " text-white shadow-sm" : "bg-gray-100 text-gray-400"
              }`}>
                {i <= currentIdx ? stepIcon[step] : i + 1}
              </div>
              <p className={`text-[10px] mt-1 font-medium ${i <= currentIdx ? "text-gray-700" : "text-gray-400"}`}>
                {step.charAt(0) + step.slice(1).toLowerCase()}
              </p>
            </div>
            {i < TRACKING_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${i < currentIdx ? "bg-indigo-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    getUserOrders(user.id)
      .then(setOrders)
      .catch((err) => setError(err?.message || String(err)))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">My Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">⚠️ {error}</div>}

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-200 py-20">
            <span className="text-5xl mb-4">📦</span>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No orders yet</h3>
            <p className="text-gray-400 text-sm mb-6">Start shopping to see your orders here</p>
            <Link to="/" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all">
              Browse Products →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={order.product?.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&h=200&fit=crop"}
                      alt={order.product?.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Order #{order.id}</p>
                        <h3 className="font-bold text-gray-800 text-sm sm:text-base">{order.product?.name || "Product"}</h3>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(order.orderTime)}</p>
                      </div>
                      <p className="font-black text-lg text-indigo-600 flex-shrink-0">{formatPrice(order.totalPrice)}</p>
                    </div>
                  </div>
                </div>
                <TrackingBar status={order.trackingStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderHistory;
