import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useCart from "../hooks/useCart";
import { formatPrice } from "../utils/helpers";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  if (cart.length === 0) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">🛒</span>
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Looks like you haven't added anything yet</p>
        <Link to="/" className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all text-sm">
          Browse Products →
        </Link>
      </div>
    </div>
  );

  const subtotal = getTotalPrice();
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <motion.div className="min-h-screen bg-gray-50 py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Shopping Cart</h1>
            <p className="text-gray-400 text-sm mt-1">{cart.length} item{cart.length > 1 ? "s" : ""} in your cart</p>
          </div>
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors">
            Clear all
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={item.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&h=200&fit=crop"}
                    alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm truncate">{item.name}</h3>
                  {item.category && <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>}
                  <p className="text-indigo-600 font-black text-base mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2 bg-gray-50 rounded-xl p-1 w-fit">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600 font-bold text-lg">−</button>
                    <span className="w-6 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600 font-bold text-lg">+</button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-gray-800 text-sm">{formatPrice(item.price * item.quantity)}</p>
                  <button onClick={() => removeFromCart(item.id)}
                    className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors font-medium">Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-black text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({cart.length} items)</span>
                  <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-black text-xl text-indigo-600">{formatPrice(total)}</span>
                </div>
              </div>

              <button onClick={() => navigate("/checkout")}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200 transition-all text-sm mb-3">
                Proceed to Checkout →
              </button>

              <Link to="/" className="block text-center text-sm text-indigo-600 font-medium hover:underline">
                ← Continue Shopping
              </Link>

              {/* Trust */}
              <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-center gap-4">
                {["🔒 Secure", "⚡ Fast", "↩️ Returns"].map(b => (
                  <span key={b} className="text-xs text-gray-400">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default Cart;
