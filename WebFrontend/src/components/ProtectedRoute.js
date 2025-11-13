import React from "react";
import { Navigate } from "react-router-dom";
import { authStore } from "../api/client";

/**
 * Protects routes that require authentication.
 * Redirects to /login if the user is not authenticated.
 */
export default function ProtectedRoute({ children }) {
  const authed = authStore.isAuthenticated();
  if (!authed) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
