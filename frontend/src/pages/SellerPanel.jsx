import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import useAuth from "../hooks/useAuth";
import { uploadImage } from "../services/uploadService";
import { formatPrice, formatDate } from "../utils/helpers";

const CATEGORIES = ["MEN", "WOMEN", "KIDS", "FOOTWEAR", "ELECTRONICS", "ACCESSORIES", "BEAUTY", "SPORTS"];

const SellerPanel = () => {
  const { user } = useAuth();
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "MEN", isAuction: false, auctionEndTime: "", imageUrl: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    API.get(`/seller/my/${user.id}`)
      .then(r => setMyProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.name || !form.price) return setError("Name and price required");
    try {
      setSubmitting(true);
      let imageUrl = form.imageUrl;
      if (imageFile) imageUrl = await uploadImage(imageFile);
      const res = await API.post(`/seller/submit/${user.id}`, { ...form, price: Number(form.price), imageUrl });
      setMyProducts(prev => [res.data, ...prev]);
      setSuccess("Product submitted for review!");
      setForm({ name: "", description: "", price: "", category: "MEN", isAuction: false, auctionEndTime: "", imageUrl: "" });
      setImageFile(null); setImagePreview(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = { PENDING: "bg-yellow-50 text-yellow-600 border-yellow-100", APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100", REJECTED: "bg-red-50 text-red-600 border-red-100" };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Seller Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Submit your products for review and listing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

          {/* Submit Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-5">Submit New Product</h2>

            {error && <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">⚠️ {error}</div>}
            {success && <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl px-4 py-3 mb-4 text-sm">✅ {success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image */}
              {imagePreview ? (
                <div className="relative h-40 rounded-xl overflow-hidden">
                  <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs">✕</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/50 cursor-pointer hover:bg-indigo-50 transition-all">
                  <span className="text-2xl mb-1">📸</span>
                  <span className="text-xs text-indigo-600 font-semibold">Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}

              <input type="text" placeholder="Product Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />

              <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />

              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Price (₹) *" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">Enable Auction</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, isAuction: !f.isAuction }))}
                  className={`relative w-11 h-6 rounded-full transition-all ${form.isAuction ? "bg-indigo-600" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isAuction ? "left-5" : "left-0.5"}`} />
                </button>
              </div>

              {form.isAuction && (
                <input type="datetime-local" value={form.auctionEndTime} onChange={e => setForm(f => ({ ...f, auctionEndTime: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              )}

              <button type="submit" disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit for Review →"}
              </button>
            </form>
          </div>

          {/* My Products */}
          <div>
            <h2 className="font-bold text-gray-800 mb-4">My Submissions ({myProducts.length})</h2>
            {loading ? (
              <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" /></div>
            ) : myProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                <p className="text-gray-400 text-sm">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myProducts.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={p.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&h=100&fit=crop"} className="w-full h-full object-cover" alt={p.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{p.name}</p>
                      <p className="text-indigo-600 font-bold text-sm">{formatPrice(p.price)}</p>
                      <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColor[p.status] || ""}`}>{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerPanel;
