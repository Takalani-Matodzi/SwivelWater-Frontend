import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import CustomerDashboard from "./pages/CustomerDashboard";
import CreateOrder from "./pages/CreateOrder";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";
import LandingPage from "./pages/LandingPage";

function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  if (user.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === "EMPLOYEE" && user.employeeRole === "DRIVER") {
    return <Navigate to="/driver" replace />;
  }

  if (user.role === "EMPLOYEE") {
    return <Navigate to="/employee" replace />;
  }

  return <Navigate to="/customer" replace />;
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* Customer */}
      <Route element={<ProtectedRoute role="CUSTOMER" />}>
        <Route path="/customer" element={<CustomerDashboard />} />

        <Route path="/customer/orders/new" element={<CreateOrder />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Driver */}
      <Route element={<ProtectedRoute role="DRIVER" />}>
        <Route path="/driver" element={<DriverDashboard />} />
      </Route>

      {/* Employee */}
      <Route element={<ProtectedRoute role="EMPLOYEE" />}>
        <Route path="/employee" element={<EmployeeDashboard />} />
      </Route>

      {/* Unknown route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
