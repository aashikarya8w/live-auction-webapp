import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "../services/paymentService";
import { useCart } from "../context/CartContext";
import useAuth from "../hooks/useAuth";
import { createOrder } from "../services/orderService";
import { formatPrice } from "../utils/helpers";
import API from "../services/api";

const Checkout = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cart, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getTotalPrice();
  const discount = couponData?.discount || 0;
  const finalTotal = couponData?.finalAmount || subtotal;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponLoading(true);
      const res = await API.post("/coupons/validate", { code: couponCode, total: subtotal });
      setCouponData(res.data);
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid coupon");
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");
    if (!stripe || !elements) return;

    try {
      setLoading(true);
      const { clientSecret } = await createPaymentIntent(finalTotal);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) throw new Error(result.error.message);

      for (const item of cart) {
        await createOrder(user.id, item.id);
      }

      clearCart();
      navigate("/orders");
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <span className="text-5xl mb-4">🛒</span>
      <p className="text-gray-600 font-semibold mb-4">Your cart is empty</p>
      <Link to="/" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-sm">
        Browse Products →
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/cart" className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Checkout</h1>
            <p className="text-gray-400 text-sm mt-0.5">Complete your purchase securely</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-1">
          {[{ n: 1, label: "Review" }, { n: 2, label: "Payment" }].map((s, i) => (
            <div key={s.n} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${step >= s.n ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-400"}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step >= s.n ? "bg-white/20" : "bg-gray-100"}`}>{s.n}</span>
                {s.label}
              </div>
              {i < 1 && <div className={`w-8 h-0.5 ${step > s.n ? "bg-indigo-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left */}
          <div className="lg:col-span-2">

            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-800 mb-5">Order Review</h2>
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={item.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&h=100&fit=crop"}
                          alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-black text-indigo-600">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(2)}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all text-sm">
                  Continue to Payment →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-800 mb-5">Payment Details</h2>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <form onSubmit={handlePayment} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Card Details</label>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                      <CardElement options={{
                        style: {
                          base: { fontSize: "15px", color: "#1f2937", fontFamily: "Inter, sans-serif", "::placeholder": { color: "#9ca3af" } },
                          invalid: { color: "#ef4444" }
                        }
                      }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      🔒 Your payment is secured by Stripe
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)}
                      className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm">
                      ← Back
                    </button>
                    <button type="submit" disabled={loading || !stripe}
                      className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200 transition-all text-sm disabled:opacity-60">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Processing...
                        </span>
                      ) : `Pay ${formatPrice(subtotal)}`}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-gray-800 mb-4">Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Items ({cart.length})</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Coupon ({couponData.code})</span>
                    <span className="font-semibold text-emerald-600">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-black text-xl text-indigo-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Have a coupon?</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter code" value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button onClick={applyCoupon} disabled={couponLoading}
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-60">
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
                {couponData && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1.5">✅ {couponData.discountPercent}% off applied!</p>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                {["🔒 256-bit SSL encryption", "💳 Powered by Stripe", "↩️ 7-day return policy"].map(b => (
                  <p key={b} className="text-xs text-gray-400 flex items-center gap-2">{b}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
