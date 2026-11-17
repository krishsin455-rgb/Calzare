
import { Navigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function ProtectedRoute({ children, admin = false }) {
  const { user } = useStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow both Admin and Super Admin
  if (admin && !["admin", "superadmin"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
