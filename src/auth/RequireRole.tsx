import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { User } from "../types"; 

interface RequireRoleProps {
  user: User | null;
  allowedRoles: string[];
  children: ReactNode;
}

// Filtro de autorización basado en roles
const RequireRole = ({ user, allowedRoles, children }: RequireRoleProps) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; 
  }

  return children;
};

export default RequireRole;