import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../services/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.newPassword || form.newPassword.length < 6)
      return setError("Password must be at least 6 characters");
    if (form.newPassword !== form.confirmPassword)
      return setError("Passwords do not match");
    if (!token) return setError("Invalid reset link");

    try {
      setLoading(true);
      await API.post("/auth/reset-password", { token, newPassword: form.newPassword });
      alert("Password reset successfully! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally { setLoading(false); }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">❌</p>
        <p className="text-gray-600 font-semibold">Invalid reset link</p>
        <Link to="/forgot-password" className="mt-4 text-indigo-600 font-medium hover:underline block">
          Request new link →
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm">BN</span>
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">BidNexus</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-8">
          <div className="text-center mb-7">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Reset Password</h1>
            <p className="text-gray-400 text-sm mt-1">Enter your new password</p>
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                  value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                  className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {/* Strength bar */}
              {form.newPassword.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                      form.newPassword.length >= i * 3
                        ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-yellow-400" : i <= 3 ? "bg-blue-400" : "bg-green-500"
                        : "bg-gray-200"
                    }`} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input type={showPass ? "text" : "password"} placeholder="Re-enter password"
                  value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
              </div>
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {form.confirmPassword && form.newPassword === form.confirmPassword && (
                <p className="text-xs text-emerald-500 mt-1">✓ Passwords match</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-60 mt-2">
              {loading ? "Resetting..." : "Reset Password →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
