// src/components/ProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, token } = useSelector((state) => state.user) || {};

  // Also fall back to localStorage (for page refresh)
  const storedAuth = JSON.parse(
    localStorage.getItem("storyverse_auth") || "null"
  );

  const finalToken = token || storedAuth?.token;
  const finalUser = user || storedAuth?.user;

  // Not logged in
  if (!finalToken) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    (!finalUser || !allowedRoles.includes(finalUser.role))
  ) {
    // Just send them home
    return <Navigate to="/" replace />;
  }

  return children;
}
