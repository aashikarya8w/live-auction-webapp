import { useState, useEffect } from "react";
import { AuthContext } from "./authContextDef";
import { decodeToken } from "../utils/jwtDecode";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    try {
      if (savedToken) {
        const decoded = decodeToken(savedToken);
        if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
          setToken(savedToken);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("cart");
        }
      }
    } catch {
      localStorage.removeItem("token");
    }
    setLoading(false);
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    try {
      const decoded = decodeToken(newToken);
      if (decoded) { setUser(decoded); setToken(newToken); }
    } catch {}
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    setUser(null);
    setToken(null);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8f7ff" }}>
      <div style={{ width:40, height:40, border:"4px solid #e0e7ff", borderTop:"4px solid #4f46e5", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin: user?.role === "ADMIN", loading }}>
      {children}
    </AuthContext.Provider>
  );
};
