import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";
import { useTheme } from "../context/ThemeContext";
import useCart from "../hooks/useCart";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggleDark } = useTheme();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const profileRef = useRef(null);
  const moreRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
    setProfileOpen(false);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = user ? [
    { to: "/", label: "Home" },
    { to: "/orders", label: "📦 Orders" },
    { to: "/bids", label: "🔨 My Bids" },
    ...(isAdmin ? [{ to: "/admin", label: "🛡️ Admin", special: "purple" }] : []),
  ] : [{ to: "/", label: "Home" }];

  const profileMenuItems = [
    { icon: "👤", label: "My Profile", to: "/profile" },
    { icon: "📦", label: "Orders", to: "/orders" },
    { icon: "🔨", label: "My Bids", to: "/bids" },
    { icon: "❤️", label: "Wishlist", to: "/wishlist" },
    ...(isAdmin ? [{ icon: "🛡️", label: "Admin Panel", to: "/admin", special: true }] : []),
  ];

  const moreItems = [
    { icon: "🏪", label: "Become a Seller", to: "/sell" },
    { icon: "🔔", label: "Notification Settings", to: "/profile" },
    { icon: "🎧", label: "24x7 Customer Care", to: "/" },
    { icon: "📢", label: "Advertise on BidNexus", to: "/" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-xs">BN</span>
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              BidNexus
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  link.special === "purple" ? "text-purple-600 hover:bg-purple-50 font-semibold" :
                  "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button onClick={toggleDark}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all text-base">
              {dark ? "☀️" : "🌙"}
            </button>

            {user && <NotificationBell />}

            {user ? (
              <div className="hidden md:flex items-center gap-2">

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button onClick={() => { setProfileOpen(!profileOpen); setMoreOpen(false); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {user?.sub?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">{user?.fullName || user?.sub?.split("@")[0]}</span>
                    <svg className={`w-3 h-3 text-gray-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {user?.sub?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate">{user?.fullName || "User"}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.sub}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        {profileMenuItems.map((item) => (
                          <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-indigo-50 ${item.special ? "text-purple-600 font-semibold" : "text-gray-700"}`}>
                            <span className="text-base w-5 text-center">{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <span className="text-base w-5 text-center">🚪</span>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* More Dropdown */}
                <div className="relative" ref={moreRef}>
                  <button onClick={() => { setMoreOpen(!moreOpen); setProfileOpen(false); }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
                    More
                    <svg className={`w-3 h-3 text-gray-500 transition-transform ${moreOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {moreOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-bold text-gray-800">More</p>
                      </div>
                      <div className="py-1">
                        {moreItems.map((item) => (
                          <Link key={item.label} to={item.to} onClick={() => setMoreOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors">
                            <span className="text-base w-5 text-center">{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart with badge */}
                <Link to="/cart" className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all">
                  <div className="relative">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                        {cart.length > 9 ? "9+" : cart.length}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">Cart</span>
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-3 py-2 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-all">Login</Link>
                <Link to="/register" className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all">Register</Link>
              </div>
            )}

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  link.special === "purple" ? "text-purple-600 bg-purple-50 font-semibold" :
                  "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                }`}>
                {link.label}
              </Link>
            ))}
            <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-indigo-50">
              <span>🛒 Cart</span>
              {cart.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cart.length}</span>}
            </Link>
            {[...profileMenuItems, ...moreItems].map(item => (
              <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-indigo-50 transition-all">
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}
            {user && (
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium">
                <span>🚪</span> Sign Out
              </button>
            )}
            {!user && (
              <div className="flex gap-2 px-4 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 border border-indigo-200 text-indigo-600 rounded-xl text-sm font-bold">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold">Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
