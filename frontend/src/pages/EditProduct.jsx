import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getProductById, updateProduct } from "../services/productService";
import { uploadImage } from "../services/uploadService";

const CATEGORIES = ["MEN", "WOMEN", "KIDS", "FOOTWEAR", "ELECTRONICS", "ACCESSORIES", "BEAUTY", "SPORTS"];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "MEN",
    imageUrl: "", isAuction: false, auctionEndTime: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProductById(id)
      .then((data) => {
        setForm({
          name: data.name || "",
          description: data.description || "",
          price: data.price || "",
          category: data.category || "MEN",
          imageUrl: data.imageUrl || "",
          isAuction: data.isAuction || false,
          auctionEndTime: data.auctionEndTime ? data.auctionEndTime.slice(0, 16) : "",
        });
        if (data.imageUrl) setImagePreview(data.imageUrl);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.price) return setError("Name and price are required");

    try {
      setSaving(true);
      let finalImageUrl = form.imageUrl;

      if (imageFile) {
        setUploading(true);
        finalImageUrl = await uploadImage(imageFile);
        setUploading(false);
      }

      await updateProduct(id, {
        ...form,
        price: Number(form.price),
        imageUrl: finalImageUrl,
        auctionEndTime: form.isAuction && form.auctionEndTime ? form.auctionEndTime : null,
      });

      navigate("/admin");
    } catch (err) {
      setError(err?.message || String(err));
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Edit Product</h1>
            <p className="text-gray-400 text-sm">Update product details</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Image */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">Product Image</h2>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden h-56 bg-gray-100">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                <label className="absolute bottom-3 right-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer hover:bg-indigo-700 transition-all shadow-md">
                  Change Image
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/50 cursor-pointer hover:bg-indigo-50 transition-all">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-indigo-600">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-800 mb-2">Product Details</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                  <input type="number" name="price" value={form.price} onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all">
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Auction */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-800">Auction Settings</h2>
                <p className="text-gray-400 text-xs mt-0.5">Enable to list as live auction</p>
              </div>
              <button type="button" onClick={() => setForm({ ...form, isAuction: !form.isAuction })}
                className={`relative w-12 h-6 rounded-full transition-all ${form.isAuction ? "bg-indigo-600" : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isAuction ? "left-6" : "left-0.5"}`} />
              </button>
            </div>

            {form.isAuction && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Auction End Date & Time</label>
                <input type="datetime-local" name="auctionEndTime" value={form.auctionEndTime} onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
              </div>
            )}
          </div>

          <button type="submit" disabled={saving || uploading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-60 text-sm">
            {uploading ? "⬆️ Uploading image..." : saving ? "Saving..." : "Save Changes →"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default EditProduct;
