import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getAllProducts, deleteProduct } from "../services/productService";
import { formatPrice } from "../utils/helpers";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getAllProducts()
      .then((data) => {
        // Handle paginated response
        const list = data?.content || data;
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Products", value: products.length, icon: "📦", color: "bg-indigo-50 text-indigo-600" },
    { label: "Live Auctions", value: products.filter(p => p.isAuction && p.status === "AVAILABLE").length, icon: "🔥", color: "bg-orange-50 text-orange-600" },
    { label: "Sold Items", value: products.filter(p => p.status === "SOLD").length, icon: "✅", color: "bg-emerald-50 text-emerald-600" },
    { label: "Buy Now", value: products.filter(p => !p.isAuction).length, icon: "🛒", color: "bg-blue-50 text-blue-600" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div className="min-h-screen bg-gray-50 py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-indigo-600 font-semibold text-sm mb-1">Admin Panel</p>
            <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/analytics" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm shadow-sm">
              📊 Analytics
            </Link>
            <Link to="/admin/orders" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm shadow-sm">
              📦 Orders
            </Link>
            <Link to="/admin/sellers" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm shadow-sm">
              🏪 Sellers
            </Link>
            <Link to="/admin/users" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm shadow-sm">
              👥 Users
            </Link>
            <Link to="/admin/add-product" className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200 transition-all text-sm">
              <span className="text-lg">+</span> Add Product
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
              <p className="text-3xl font-black text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search + Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-50 gap-3">
            <h2 className="font-bold text-gray-800">All Products</h2>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input type="text" placeholder="Search products..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56" />
            </div>
          </div>
          <div className="overflow-x-auto">

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="text-4xl mb-3">📭</span>
              <p className="text-gray-500 font-medium">No products found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((product) => (
                <div key={product.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">

                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&h=100&fit=crop"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{product.category || "—"}</span>
                      <span className="text-gray-200">•</span>
                      <span className={`text-xs font-semibold ${product.isAuction ? "text-orange-500" : "text-blue-500"}`}>
                        {product.isAuction ? "🔥 Auction" : "🛒 Buy Now"}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="font-black text-indigo-600">{formatPrice(product.price)}</p>
                    {product.currentHighestBid && (
                      <p className="text-xs text-emerald-500 mt-0.5">Bid: {formatPrice(product.currentHighestBid)}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0 hidden md:block">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      product.status === "SOLD"
                        ? "bg-gray-50 text-gray-400 border-gray-100"
                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    }`}>
                      {product.status === "SOLD" ? "Sold" : "Active"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id}
                      className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                      {deleting === product.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>{/* end overflow-x-auto */}
        </div>
      </div>
    </motion.div>
  );
};
export default AdminDashboard;
