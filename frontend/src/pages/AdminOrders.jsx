import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { formatDate, formatPrice } from "../utils/helpers";

const STATUSES = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const statusColor = {
  PLACED: "bg-blue-50 text-blue-600 border-blue-100",
  CONFIRMED: "bg-indigo-50 text-indigo-600 border-indigo-100",
  SHIPPED: "bg-purple-50 text-purple-600 border-purple-100",
  DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    API.get("/orders/all").then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await API.put(`/orders/${orderId}/tracking`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trackingStatus: status } : o));
    } catch (err) { alert("Failed to update"); }
    finally { setUpdating(null); }
  };

  const filtered = orders.filter(o =>
    o.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 shadow-sm">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Manage Orders</h1>
            <p className="text-gray-400 text-sm">{orders.length} total orders</p>
          </div>
        </div>

        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input type="text" placeholder="Search by product or user..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <p className="text-4xl mb-3">📦</p><p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={order.product?.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&h=100&fit=crop"} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{order.product?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.email} • {formatDate(order.orderTime)}</p>
                    <p className="text-indigo-600 font-black text-sm mt-0.5">{formatPrice(order.totalPrice)}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <select value={order.trackingStatus || "PLACED"} onChange={e => updateStatus(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className={`text-xs font-bold px-3 py-2 rounded-xl border cursor-pointer focus:outline-none ${statusColor[order.trackingStatus || "PLACED"]}`}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
