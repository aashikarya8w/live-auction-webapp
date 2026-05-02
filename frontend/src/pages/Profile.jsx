import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-gray-500">Please login to view your profile</p>
      <Link to="/login" className="mt-4 text-indigo-600 font-medium hover:underline">Login →</Link>
    </div>
  );

  const initials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.sub?.charAt(0)?.toUpperCase() || "U";

  const menuItems = [
    { icon: "📦", label: "My Orders", to: "/orders", desc: "View your purchase history" },
    { icon: "🔨", label: "My Bids", to: "/bids", desc: "Track your auction bids" },
    { icon: "🛒", label: "Cart", to: "/cart", desc: "Items in your cart" },
  ];

  return (
    <motion.div className="min-h-screen bg-gray-50 py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">

          {/* Cover */}
          <div className="h-28 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black border-4 border-white shadow-lg">
                {initials}
              </div>
              {user?.role === "ADMIN" && (
                <Link to="/admin" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all shadow-sm">
                  Admin Panel →
                </Link>
              )}
            </div>

            <h1 className="text-2xl font-black text-gray-900">{user?.fullName || "User"}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{user?.sub}</p>

            <div className="flex items-center gap-3 mt-3">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                user?.role === "ADMIN"
                  ? "bg-purple-50 text-purple-600 border-purple-100"
                  : "bg-indigo-50 text-indigo-600 border-indigo-100"
              }`}>
                {user?.role === "ADMIN" ? "🛡️ Admin" : "👤 Member"}
              </span>
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                ✓ Verified Account
              </span>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Email</p>
            <p className="font-semibold text-gray-800 text-sm truncate">{user?.sub}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Full Name</p>
            <p className="font-semibold text-gray-800 text-sm">{user?.fullName || "Not set"}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-800">Quick Access</h2>
          </div>
          {menuItems.map((item, i) => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${i < menuItems.length - 1 ? "border-b border-gray-50" : ""}`}>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button onClick={logout}
          className="w-full py-4 bg-white border border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-all text-sm shadow-sm">
          Sign Out
        </button>

      </div>
    </motion.div>
  );
};
export default Profile;
