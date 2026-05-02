import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import RecommendedSection from "../components/RecommendedSection";
import useAuth from "../hooks/useAuth";
import { connectSocket, disconnectSocket } from "../services/socketService";

const features = [
  { icon: "⚡", title: "Live Bidding", desc: "Real-time auction updates", color: "bg-amber-50 border-amber-100 text-amber-600" },
  { icon: "🔒", title: "Secure Payments", desc: "Stripe-powered checkout", color: "bg-emerald-50 border-emerald-100 text-emerald-600" },
  { icon: "🚚", title: "Fast Delivery", desc: "Quick dispatch after winning", color: "bg-sky-50 border-sky-100 text-sky-600" },
  { icon: "↩️", title: "Easy Returns", desc: "7-day hassle-free returns", color: "bg-violet-50 border-violet-100 text-violet-600" },
];

const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(() => {
    API.get("/products?page=0&size=200")
      .then((res) => {
        const data = res.data?.content || res.data;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();

    // Real-time WebSocket — try silently
    try {
      connectSocket((data) => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === data.productId
              ? { ...p, currentHighestBid: data.amount }
              : p
          )
        );
      });
    } catch (e) {}

    return () => { try { disconnectSocket(); } catch {} };
  }, [fetchProducts]);

  const auctionProducts = products.filter((p) => p.isAuction);
  const regularProducts = products.filter((p) => !p.isAuction);

  const categoryFiltered = activeCategory === "ALL"
    ? products
    : products.filter((p) => p.category === activeCategory);

  const displayProducts = categoryFiltered
    .filter((p) => activeTab === "auction" ? p.isAuction : activeTab === "buy" ? !p.isAuction : true)
    .filter((p) => search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

  return (
    <div className="bg-[#f8f7ff]">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative bg-gradient-to-135 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>

        {/* subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        {/* glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full opacity-20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-28 flex flex-col lg:flex-row items-center gap-10 lg:gap-0">

          {/* ── LEFT COPY ── */}
          <div className="flex-1 z-10">
            {/* pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-7 backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-xs font-semibold tracking-wide uppercase">Live Auctions Running Now</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Bid. Win.<br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-400 bg-clip-text text-transparent">
                  Wear Fashion.
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 9 Q75 2 150 9 Q225 16 298 9" stroke="url(#u)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="u" x1="0" y1="0" x2="300" y2="0">
                      <stop stopColor="#fde68a"/><stop offset="1" stopColor="#f9a8d4"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-md">
              Discover premium clothes at unbeatable prices through live auctions.
              Bid in real-time and win your style.
            </p>

            <div className="flex flex-wrap gap-4 mb-14">
              <a href="#products"
                className="group flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold rounded-2xl hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all text-sm">
                Explore Auctions
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              {!user && (
                <Link to="/register"
                  className="px-7 py-3.5 bg-white/10 border border-white/25 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all text-sm backdrop-blur-sm">
                  Join Free →
                </Link>
              )}
            </div>

            {/* stats */}
            <div className="flex gap-6 sm:gap-10">
              {[
                { val: "10K+", lbl: "Happy Buyers" },
                { val: "500+", lbl: "Live Auctions" },
                { val: "₹2Cr+", lbl: "Items Sold" },
              ].map((s) => (
                <div key={s.lbl}>
                  <p className="text-2xl sm:text-3xl font-black text-white">{s.val}</p>
                  <p className="text-white/40 text-xs mt-0.5 font-medium">{s.lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT IMAGE COLLAGE ── */}
          <div className="hidden lg:flex flex-1 justify-end z-10">
            <div className="relative w-[340px] h-[420px] lg:w-[420px] lg:h-[500px]">

              {/* main big card */}
              <div className="absolute top-0 right-0 w-64 h-80 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-white/10">
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop&crop=faces"
                  alt="fashion" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/20">
                    <p className="text-white text-xs font-semibold">Premium Jacket</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-yellow-300 font-bold text-sm">₹2,499</p>
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* second card */}
              <div className="absolute bottom-0 left-0 w-52 h-64 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-white/10">
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop&crop=faces"
                  alt="fashion" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-2.5 border border-white/20">
                    <p className="text-white text-xs font-semibold">Summer Dress</p>
                    <p className="text-yellow-300 font-bold text-sm mt-0.5">₹1,299</p>
                  </div>
                </div>
              </div>

              {/* floating bid card */}
              <div className="absolute top-16 left-0 bg-white rounded-2xl shadow-2xl p-3.5 w-44 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">R</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Rahul placed bid</p>
                    <p className="text-[10px] text-gray-400">2 sec ago</p>
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-xl px-3 py-1.5 text-center">
                  <p className="text-indigo-700 font-black text-base">₹3,200</p>
                </div>
              </div>

              {/* floating timer */}
              <div className="absolute top-4 left-8 bg-gray-900/90 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/10">
                <p className="text-[10px] text-gray-400 mb-0.5 font-medium">Ends in</p>
                <p className="text-white font-black text-sm tracking-widest">02:14:38</p>
              </div>

            </div>
          </div>
        </div>

        {/* bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z" fill="#f8f7ff"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRUST BAR
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 -mt-1 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className={`flex items-center gap-3 p-4 bg-white rounded-2xl border ${f.color.split(" ")[1]} shadow-sm hover:shadow-md transition-all`}>
              <div className={`w-10 h-10 rounded-xl ${f.color.split(" ")[0]} flex items-center justify-center text-xl flex-shrink-0`}>
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                <p className="text-gray-400 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-indigo-600 font-semibold text-sm mb-1">Browse</p>
            <h2 className="text-3xl font-black text-gray-900">Shop by Category</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Men", key: "MEN", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=300&fit=crop", count: "120+ items" },
            { label: "Women", key: "WOMEN", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop", count: "240+ items" },
            { label: "Kids", key: "KIDS", img: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&h=300&fit=crop", count: "80+ items" },
            { label: "Footwear", key: "FOOTWEAR", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop", count: "60+ items" },
            { label: "Electronics", key: "ELECTRONICS", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop", count: "90+ items" },
            { label: "Accessories", key: "ACCESSORIES", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop", count: "150+ items" },
            { label: "Beauty", key: "BEAUTY", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop", count: "70+ items" },
            { label: "Sports", key: "SPORTS", img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop", count: "50+ items" },
          ].map((cat) => (
            <div key={cat.label}
              onClick={() => {
                setActiveCategory(cat.key);
                setActiveTab("all");
                document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative h-44 md:h-56 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="text-white font-black text-xl">{cat.label}</p>
                <p className="text-white/60 text-xs mt-0.5">{cat.count}</p>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white rounded-full px-3 py-1 text-xs font-bold text-gray-800 shadow-lg">Shop →</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRODUCTS
      ══════════════════════════════════════ */}
      <section id="products" className="max-w-7xl mx-auto px-6 lg:px-8 py-10">

        {/* Header + Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-indigo-600 font-semibold text-sm mb-1">Discover</p>
            <h2 className="text-3xl font-black text-gray-900">
              {activeCategory !== "ALL"
                ? `${activeCategory.charAt(0) + activeCategory.slice(1).toLowerCase()}'s Collection`
                : activeTab === "auction" ? "Live Auctions"
                : activeTab === "buy" ? "Buy Now" : "All Products"}
            </h2>
          </div>
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl p-1 shadow-sm gap-1 overflow-x-auto">
            {[
              { key: "all", label: "All" },
              { key: "auction", label: `🔥 Live (${auctionProducts.length})` },
              { key: "buy", label: `🛒 Buy (${regularProducts.length})` },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search products..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
            {search && <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-semibold transition-all shadow-sm ${
              showFilters ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters {(activeCategory !== "ALL" || priceRange[1] < 50000) && <span className="w-2 h-2 bg-yellow-400 rounded-full" />}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Category</p>
                <div className="flex flex-wrap gap-2">
                  {["ALL", "MEN", "WOMEN", "KIDS", "FOOTWEAR", "ELECTRONICS", "ACCESSORIES", "BEAUTY", "SPORTS"].map((cat) => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeCategory === cat ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}>
                      {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Max Price: <span className="text-indigo-600">₹{priceRange[1].toLocaleString()}</span>
                </p>
                <input type="range" min={0} max={50000} step={500} value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="w-full accent-indigo-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₹0</span><span>₹50,000</span>
                </div>
              </div>
              <div className="flex items-end">
                <button onClick={() => { setActiveCategory("ALL"); setPriceRange([0, 50000]); setSearch(""); setShowFilters(false); }}
                  className="px-4 py-2 bg-red-50 text-red-500 text-xs font-bold rounded-xl hover:bg-red-100 transition-all">
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <p className="text-sm text-gray-400 mb-4">
            Showing <span className="font-bold text-gray-700">{displayProducts.length}</span> products
            {search && <span> for "<span className="text-indigo-600">{search}</span>"</span>}
          </p>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-4xl mb-3">😕</p>
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && (
          displayProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-5xl mb-4">🛍️</p>
              <p className="text-gray-600 font-semibold">No products yet</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon for new arrivals</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.05 } }
              }}
            >
              {displayProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </motion.div>
          )
        )}
      </section>

      {/* ══════════════════════════════════════
          RECOMMENDED FOR YOU
      ══════════════════════════════════════ */}
      <RecommendedSection />

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section className="bg-white border-y border-gray-100 py-16 mt-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-indigo-600 font-semibold text-sm mb-1">Simple Process</p>
            <h2 className="text-3xl font-black text-gray-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200" />
            {[
              { step: "01", icon: "🔍", title: "Browse", desc: "Explore hundreds of live auctions and buy-now items" },
              { step: "02", icon: "📝", title: "Register", desc: "Create your free account in under 60 seconds" },
              { step: "03", icon: "💰", title: "Place Bid", desc: "Bid on your favourite items in real-time" },
              { step: "04", icon: "🎉", title: "Win & Pay", desc: "Win the auction and checkout securely with Stripe" },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-3xl flex items-center justify-center text-3xl mb-4 shadow-sm z-10 bg-white">
                  {item.icon}
                </div>
                <span className="text-xs font-black text-indigo-300 mb-1 tracking-widest">{item.step}</span>
                <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      {!user && (
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="relative overflow-hidden rounded-[2rem] p-10 md:p-16 text-center"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full" />
            <div className="relative">
              <p className="text-white/60 font-semibold text-sm mb-3 uppercase tracking-widest">Limited Time</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Start Bidding Today.<br />
                <span className="text-yellow-300">It's Free.</span>
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-lg mx-auto">
                Join 10,000+ fashion lovers already winning auctions every day.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register"
                  className="px-10 py-4 bg-white text-indigo-700 font-black rounded-2xl hover:bg-gray-50 transition-all shadow-xl text-sm">
                  Create Free Account →
                </Link>
                <Link to="/login"
                  className="px-10 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all text-sm">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
