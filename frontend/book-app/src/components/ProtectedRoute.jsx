// src/components/ProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const slice = useSelector((state) => state.user); 
  const userFromStore = slice?.user || null;
  const tokenFromStore = slice?.token || null;

  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  const finalUser = userFromStore || (storedUser ? JSON.parse(storedUser) : null);
  const finalToken = tokenFromStore || storedToken;

  // not logged in at all
  if (!finalToken || !finalUser) {
    return <Navigate to="/login" replace />;
  }

  // logged in but wrong role
  if (allowedRoles && !allowedRoles.includes(finalUser.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
