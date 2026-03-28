import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface RequireRoleProps {
  allowedRoles: string[];
  children: ReactNode;
}

// Filtro de autorización basado en roles
const RequireRole = ({ allowedRoles, children }: RequireRoleProps) => {
  const { state } = useAuth();
  const { user } = state;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; 
  }

  return children;
};

export default RequireRole;