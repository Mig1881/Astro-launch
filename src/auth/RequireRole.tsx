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
  const { user, isAuthenticated } = state; 

  //Si hay token (isAuthenticated) pero aún no hay datos del usuario todavia, se esperae
  if (isAuthenticated && user === null) {
    return (
      <div style={{ color: "white", padding: "2rem", textAlign: "center" }}>
        Verificando credenciales... 🚀
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; 
  }

  return <>{children}</>;
};

export default RequireRole;