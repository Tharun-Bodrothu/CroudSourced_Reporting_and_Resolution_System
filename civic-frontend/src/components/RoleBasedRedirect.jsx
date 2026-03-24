import { Navigate } from "react-router-dom";

function RoleBasedRedirect() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user || !user.role) return <Navigate to="/login" />;

  if (user.role === "admin")            return <Navigate to="/admin" />;
  if (user.role === "department_admin") return <Navigate to="/department" />;
  if (user.role === "user")             return <Navigate to="/dashboard" />;
  if (user.role === "citizen")          return <Navigate to="/dashboard" />;

  return <Navigate to="/login" />;
}

export default RoleBasedRedirect;