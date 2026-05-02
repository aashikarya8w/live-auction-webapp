import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import OrderHistory from "./pages/OrderHistory";
import BiddingHistory from "./pages/BiddingHistory";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import ManageProducts from "./pages/ManageProducts";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Wishlist from "./pages/Wishlist";
import SellerPanel from "./pages/SellerPanel";
import Analytics from "./pages/Analytics";
import AdminOrders from "./pages/AdminOrders";
import SellerApproval from "./pages/SellerApproval";
import UserManagement from "./pages/UserManagement";
import DirectChat from "./pages/DirectChat";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

// Stripe
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Cart
import { CartProvider } from "./context/CartContext";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder");

function App() {
  const location = useLocation();
  return (
    <CartProvider>
      <Elements stripe={stripePromise}>
        <div className="flex flex-col min-h-screen">

          <Navbar />

          <main className="flex-grow">
            <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

              {/* PUBLIC */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* PRODUCT */}
              <Route path="/product/:id" element={<ProductDetails />} />

              {/* PRIVATE */}
              <Route element={<PrivateRoute />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/bids" element={<BiddingHistory />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/sell" element={<SellerPanel />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/analytics" element={<Analytics />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/sellers" element={<SellerApproval />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/add-product" element={<AddProduct />} />
                <Route path="/admin/edit-product/:id" element={<EditProduct />} />
                <Route path="/admin/manage-products" element={<ManageProducts />} />
              </Route>

              {/* PRIVATE */}
              <Route element={<PrivateRoute />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/bids" element={<BiddingHistory />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/sell" element={<SellerPanel />} />
                <Route path="/chat/:userId2" element={<DirectChat />} />
              </Route>

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="center-flex flex-col h-[60vh]">
                    <h1 className="text-3xl font-bold text-gray-700">
                      404 - Page Not Found
                    </h1>
                  </div>
                }
              />

            </Routes>
            </AnimatePresence>
          </main>

          <Footer />
        </div>
      </Elements>
    </CartProvider>
  );
}

export default App;
