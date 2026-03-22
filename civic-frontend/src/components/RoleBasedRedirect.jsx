import { Navigate } from "react-router-dom";

function RoleBasedRedirect() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/login" />;

  if (user.role === "user") return <Navigate to="/issues" />;
  if (user.role === "admin") return <Navigate to="/admin" />;
  if (user.role === "department_admin") return <Navigate to="/department" />;

  return <Navigate to="/login" />;
}

export default RoleBasedRedirect;