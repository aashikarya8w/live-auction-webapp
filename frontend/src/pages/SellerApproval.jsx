import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { formatDate, formatPrice } from "../utils/helpers";

const SellerApproval = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    API.get("/seller/admin/pending").then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, action) => {
    setProcessing(id);
    try {
      await API.put(`/seller/admin/${action}/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch { alert("Failed"); }
    finally { setProcessing(null); }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 shadow-sm">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Seller Submissions</h1>
            <p className="text-gray-400 text-sm">{products.length} pending approval</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
            <p className="text-5xl mb-4">✅</p>
            <p className="text-gray-600 font-semibold">No pending submissions</p>
            <p className="text-gray-400 text-sm mt-1">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={p.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&h=100&fit=crop"} className="w-full h-full object-cover" alt={p.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800">{p.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{p.category} • {p.isAuction ? "Auction" : "Buy Now"}</p>
                    <p className="text-indigo-600 font-black text-sm mt-0.5">{formatPrice(p.price)}</p>
                    <p className="text-xs text-gray-400">By: {p.seller?.fullName || p.seller?.email} • {formatDate(p.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleAction(p.id, "approve")} disabled={processing === p.id}
                      className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50">
                      ✅ Approve
                    </button>
                    <button onClick={() => handleAction(p.id, "reject")} disabled={processing === p.id}
                      className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50">
                      ❌ Reject
                    </button>
                  </div>
                </div>
                {p.description && <p className="text-sm text-gray-500 mt-3 line-clamp-2">{p.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerApproval;
