import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  role?: "CUSTOMER" | "ADMIN" | "DRIVER" | "EMPLOYEE";
}

function ProtectedRoute({
  role,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!role) {
    return <Outlet />;
  }

  const hasRequiredRole =
    role === "DRIVER"
      ? user.role === "EMPLOYEE" &&
        user.employeeRole === "DRIVER"
      : user.role === role;

  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;