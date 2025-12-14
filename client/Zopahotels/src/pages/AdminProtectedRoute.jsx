import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  const user = JSON.parse(localStorage.getItem("adminUser"));

 if (!token || !["admin", "staff"].includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
