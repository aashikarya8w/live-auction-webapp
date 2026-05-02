import { useState } from "react";
import { placeBid } from "../services/bidService";
import { setAutoBid } from "../services/autoBidService";
import useAuth from "../hooks/useAuth";
import { formatPrice } from "../utils/helpers";

const BidModal = ({ product, onClose }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState("manual"); // manual | auto
  const [amount, setAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [increment, setIncrement] = useState("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentHighest = product.currentHighestBid || product.price || 0;

  const handleManualBid = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const bidAmount = Number(amount);
    if (!bidAmount || bidAmount <= 0) return setError("Enter valid bid amount");
    if (bidAmount <= currentHighest) return setError(`Bid must be higher than ₹${currentHighest}`);
    if (!user?.id) return setError("You must be logged in");
    try {
      setLoading(true);
      await placeBid({ productId: product.id, userId: user.id, amount: bidAmount });
      setSuccess("Bid placed successfully! 🎉");
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || String(err));
    } finally { setLoading(false); }
  };

  const handleAutoBid = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const max = Number(maxAmount);
    const inc = Number(increment);
    if (!max || max <= currentHighest) return setError(`Max amount must be higher than ₹${currentHighest}`);
    if (!user?.id) return setError("You must be logged in");
    try {
      setLoading(true);
      await setAutoBid(user.id, product.id, max, inc);
      setSuccess("Auto-bid activated! System will bid for you up to ₹" + max);
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || String(err));
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">Place Bid</h2>
              <p className="text-sm text-gray-400 truncate max-w-[200px]">{product.name}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all text-gray-500">✕</button>
          </div>

          {/* Current bid info */}
          <div className="bg-indigo-50 rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-indigo-400 font-medium">Starting Price</p>
                <p className="text-indigo-700 font-black text-lg">{formatPrice(product.price)}</p>
              </div>
              {product.currentHighestBid && (
                <div className="text-right">
                  <p className="text-xs text-indigo-400 font-medium">Highest Bid</p>
                  <p className="text-indigo-700 font-black text-lg">{formatPrice(product.currentHighestBid)}</p>
                </div>
              )}
            </div>
            {product.reservePrice && (
              <p className="text-xs text-orange-500 mt-2 font-medium">
                🔒 Reserve price: {formatPrice(product.reservePrice)}
              </p>
            )}
            {product.antiSnipingEnabled && (
              <p className="text-xs text-blue-500 mt-1 font-medium">
                ⚡ Anti-sniping active — last-minute bids extend auction
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
            <button onClick={() => setTab("manual")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === "manual" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500"}`}>
              🔨 Manual Bid
            </button>
            <button onClick={() => setTab("auto")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === "auto" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500"}`}>
              🤖 Auto Bid
            </button>
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">⚠️ {error}</div>}
          {success && <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl px-4 py-3 mb-4 text-sm">✅ {success}</div>}

          {/* Manual Bid */}
          {tab === "manual" && (
            <form onSubmit={handleManualBid} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Bid Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input type="number" placeholder={`More than ₹${currentHighest}`} value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" autoFocus />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-sm disabled:opacity-60">
                  {loading ? "Placing..." : "Place Bid 🔨"}
                </button>
              </div>
            </form>
          )}

          {/* Auto Bid */}
          {tab === "auto" && (
            <form onSubmit={handleAutoBid} className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                🤖 <strong>Auto Bid:</strong> System will automatically bid for you when someone outbids you, up to your max amount.
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Maximum Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input type="number" placeholder={`More than ₹${currentHighest}`} value={maxAmount}
                    onChange={e => setMaxAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bid Increment (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input type="number" placeholder="100" value={increment}
                    onChange={e => setIncrement(e.target.value)}
                    className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Amount to increase each time you're outbid</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-sm disabled:opacity-60">
                  {loading ? "Setting..." : "Activate Auto Bid 🤖"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidModal;
