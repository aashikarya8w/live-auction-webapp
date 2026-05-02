import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>

      {/* top gradient border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-40" />

      {/* background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900 rounded-full opacity-10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-900 rounded-full opacity-10 blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-black text-sm">BN</span>
              </div>
              <span className="text-white font-black text-lg tracking-tight">BidVault</span>
            </Link>

            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              India's premier live fashion auction platform. Bid, win, and wear premium clothes at unbeatable prices.
            </p>

            {/* Social icons */}
            <div className="flex gap-2.5">
              {[
                { icon: "𝕏", label: "Twitter" },
                { icon: "f", label: "Facebook" },
                { icon: "in", label: "LinkedIn" },
                { icon: "▶", label: "YouTube" },
              ].map((s) => (
                <button key={s.label}
                  className="w-9 h-9 bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 rounded-xl flex items-center justify-center text-xs text-gray-400 hover:text-white transition-all duration-200"
                  title={s.label}>
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/cart", label: "Cart" },
                { to: "/orders", label: "My Orders" },
                { to: "/bids", label: "My Bids" },
                { to: "/profile", label: "Profile" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to}
                    className="text-sm text-gray-500 hover:text-white flex items-center gap-2 group transition-colors">
                    <span className="w-1 h-1 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              Categories
            </h4>
            <ul className="space-y-3">
              {["Men's Fashion", "Women's Fashion", "Kids' Wear", "Accessories", "Footwear"].map((cat) => (
                <li key={cat}>
                  <span className="text-sm text-gray-500 hover:text-white flex items-center gap-2 group transition-colors cursor-pointer">
                    <span className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {cat}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              Contact Us
            </h4>

            <ul className="space-y-3 mb-6">
              {[
                { icon: "✉️", text: "support@bidvault.in" },
                { icon: "📞", text: "+91 98765 43210" },
                { icon: "📍", text: "Mumbai, Maharashtra, India" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm text-gray-500">
                  <span className="mt-0.5 text-base">{item.icon}</span>
                  <span className="hover:text-gray-300 transition-colors cursor-pointer">{item.text}</span>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs font-semibold text-white mb-1">Get Auction Alerts</p>
              <p className="text-xs text-gray-600 mb-3">Never miss a live auction</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS BAR ── */}
        <div className="grid grid-cols-3 gap-4 mb-10 py-8 border-y border-white/5">
          {[
            { value: "10,000+", label: "Happy Buyers" },
            { value: "500+", label: "Live Auctions" },
            { value: "₹2Cr+", label: "Items Sold" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} ClothesAuction. All rights reserved. Made with ❤️ in India
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Refund Policy"].map((item) => (
              <span key={item}
                className="text-xs text-gray-600 hover:text-gray-300 cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
