import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const AdminRoute = () => {
  const { token, isAdmin, loading } = useAuth();

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="full-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Not admin
  if (!isAdmin) {
    return (
      <div className="full-screen flex-col gap-4">
        <h1 className="text-2xl font-bold text-red-500">
          Access Denied 🚫
        </h1>
        <p className="text-gray-500">
          You are not authorized to access this page.
        </p>
      </div>
    );
  }

  // ✅ Admin allowed
  return <Outlet />;
};

export default AdminRoute;