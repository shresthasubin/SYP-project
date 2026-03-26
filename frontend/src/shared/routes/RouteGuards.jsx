import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import PageLoader from "../components/PageLoader.jsx";

const getHomeByRole = (role) => {
  if (role === "admin") return "/admin";
  if (role === "hall-admin") return "/halladmin";
  return "/";
};

const RouteLoading = () => (
  <div className="grid min-h-[60vh] place-items-center text-sm text-slate-300">
   <PageLoader/>
  </div>
);

export const ProtectedRoute = ({ allowedRoles = null }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <RouteLoading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = user?.role;
    if (!allowedRoles.includes(role)) {
      return <Navigate to={getHomeByRole(role)} replace />;
    }
  }

  return <Outlet />;
};

export const PublicOnlyRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <RouteLoading />;

  if (isAuthenticated) {
    return <Navigate to={getHomeByRole(user?.role)} replace />;
  }

  return <Outlet />;
};

