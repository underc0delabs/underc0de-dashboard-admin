import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { RolesEnum } from "@/constants/rolesEnum";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: RolesEnum[];
  redirectTo?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = "/",
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  const userRoleNormalized = user?.role?.toLowerCase();
  const hasAllowedRole =
    user &&
    allowedRoles.some(
      (role) => role.toLowerCase() === userRoleNormalized
    );
  if (!hasAllowedRole) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}; 