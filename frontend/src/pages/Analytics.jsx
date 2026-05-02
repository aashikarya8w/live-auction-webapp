import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import { formatPrice } from "../utils/helpers";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/admin/analytics"),
      API.get("/admin/analytics/monthly"),
    ]).then(([statsRes, monthlyRes]) => {
      setData(statsRes.data);
      setMonthly(monthlyRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: "Total Revenue", value: formatPrice(data?.totalRevenue || 0), icon: "💰", bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Total Orders", value: data?.totalOrders || 0, icon: "📦", bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Total Users", value: data?.totalUsers || 0, icon: "👥", bg: "bg-purple-50", text: "text-purple-600" },
    { label: "Total Bids", value: data?.totalBids || 0, icon: "🔨", bg: "bg-orange-50", text: "text-orange-600" },
    { label: "Active Auctions", value: data?.activeAuctions || 0, icon: "🔥", bg: "bg-red-50", text: "text-red-600" },
    { label: "Products Sold", value: data?.soldProducts || 0, icon: "✅", bg: "bg-green-50", text: "text-green-600" },
    { label: "Conversion Rate", value: `${data?.conversionRate || 0}%`, icon: "📈", bg: "bg-indigo-50", text: "text-indigo-600" },
    { label: "Auction Success", value: `${data?.auctionSuccessRate || 0}%`, icon: "🏆", bg: "bg-yellow-50", text: "text-yellow-600" },
    { label: "Avg Order Value", value: formatPrice(data?.avgOrderValue || 0), icon: "💳", bg: "bg-pink-50", text: "text-pink-600" },
  ];

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: "#f3f4f6" } }, x: { grid: { display: false } } },
  };

  const lineOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true, grid: { color: "#f3f4f6" } }, x: { grid: { display: false } } },
  };

  const revenueData = {
    labels: monthly?.labels || [],
    datasets: [{
      label: "Revenue (₹)",
      data: monthly?.revenue || [],
      backgroundColor: "rgba(99,102,241,0.15)",
      borderColor: "#6366f1",
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#6366f1",
    }],
  };

  const ordersData = {
    labels: monthly?.labels || [],
    datasets: [{
      label: "Orders",
      data: monthly?.orders || [],
      backgroundColor: "rgba(59,130,246,0.8)",
      borderRadius: 8,
    }],
  };

  const usersData = {
    labels: monthly?.labels || [],
    datasets: [{
      label: "New Users",
      data: monthly?.users || [],
      backgroundColor: "rgba(168,85,247,0.8)",
      borderRadius: 8,
    }],
  };

  const bidsData = {
    labels: monthly?.labels || [],
    datasets: [{
      label: "Bids",
      data: monthly?.bids || [],
      backgroundColor: "rgba(249,115,22,0.8)",
      borderRadius: 8,
    }],
  };

  const doughnutData = {
    labels: ["Sold", "Active Auctions", "Available"],
    datasets: [{
      data: [
        data?.soldProducts || 0,
        data?.activeAuctions || 0,
        (data?.totalProducts || 0) - (data?.soldProducts || 0) - (data?.activeAuctions || 0),
      ],
      backgroundColor: ["#10b981", "#6366f1", "#f59e0b"],
      borderWidth: 0,
    }],
  };

  return (
    <motion.div className="min-h-screen bg-gray-50 py-6 sm:py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-indigo-600 font-semibold text-sm mb-1">Admin</p>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Analytics Dashboard</h1>
          </div>
          <Link to="/admin" className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            ← Back
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
              <p className={`text-xl sm:text-2xl font-black ${s.text}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">Revenue Trend (Last 6 Months)</h2>
          <Line data={revenueData} options={lineOptions} />
        </div>

        {/* Orders + Users Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="font-bold text-gray-800 mb-4">Monthly Orders</h2>
            <Bar data={ordersData} options={chartOptions} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="font-bold text-gray-800 mb-4">New Users</h2>
            <Bar data={usersData} options={chartOptions} />
          </div>
        </div>

        {/* Bids + Doughnut */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="font-bold text-gray-800 mb-4">Monthly Bids</h2>
            <Bar data={bidsData} options={chartOptions} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="font-bold text-gray-800 mb-4">Product Status</h2>
            <div className="flex items-center justify-center h-48">
              <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
            </div>
          </div>
        </div>

        {/* Revenue Highlight */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium mb-1">Total Platform Revenue</p>
              <p className="text-3xl sm:text-5xl font-black">{formatPrice(data?.totalRevenue || 0)}</p>
              <p className="text-white/60 text-sm mt-2">From {data?.totalOrders || 0} completed orders</p>
            </div>
            <div className="text-6xl sm:text-8xl opacity-20">💰</div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
export default Analytics;
