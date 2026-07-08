import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectPath = "/login",
}) => {
  const { isAuthenticated, hasRole } = useAuth();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Si está autenticado pero se especificaron roles requeridos y no los cumple, redirigir al dashboard general
  if (allowedRoles && allowedRoles.length > 0) {
    const userHasAccess = allowedRoles.some((role) => hasRole(role));
    if (!userHasAccess) {
      return <Navigate to="/inicio" replace />;
    }
  }

  // Renderizar los componentes hijos (si cumple las condiciones)
  return <Outlet />;
};
