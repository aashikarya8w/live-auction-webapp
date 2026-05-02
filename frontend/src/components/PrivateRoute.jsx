import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = () => {
  const { token, loading } = useAuth();

  // 🔄 Jab tak auth check ho raha hai
  if (loading) {
    return (
      <div className="full-screen">
        <p className="text-lg font-semibold text-gray-600">
          Loading...
        </p>
      </div>
    );
  }

  // ❌ Agar user login nahi hai
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Agar login hai
  return <Outlet />;
};

export default PrivateRoute;