// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AuthorDashboard from "./pages/AuthorDashboard";
import MyBooks from "./pages/MyBooks";
import EditBook from "./pages/EditBook";
import BookDetail from "./pages/BookDetail";
import MyPurchases from "./pages/MyPurchases";
import BooksList from "./pages/BooksList"; // ✅ new

import ProtectedRoute from "./components/ProtectedRoute";

// simple placeholder until you build real AdminDashboard
const AdminDashboard = () => (
  <div className="w-screen h-screen flex items-center justify-center">
    <h1 className="text-2xl font-semibold">Admin Dashboard (coming soon)</h1>
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Public home -> show all books */}
      <Route path="/" element={<BooksList />} />

      {/* Auth pages */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Public book detail page (but buying needs login) */}
      <Route path="/books/:id" element={<BookDetail />} />

      {/* Author-only dashboard */}
      <Route
        path="/dashboard/author"
        element={
          <ProtectedRoute allowedRoles={["author"]}>
            <AuthorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin-only dashboard */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Author my-books */}
      <Route
        path="/my-books"
        element={
          <ProtectedRoute allowedRoles={["author"]}>
            <MyBooks />
          </ProtectedRoute>
        }
      />

      {/* Edit book */}
      <Route
        path="/books/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["author"]}>
            <EditBook />
          </ProtectedRoute>
        }
      />

      {/* My purchases / library */}
      <Route
        path="/purchases"
        element={
          <ProtectedRoute allowedRoles={["reader", "author", "admin"]}>
            <MyPurchases />
          </ProtectedRoute>
        }
      />

      {/* fallback if route not found */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
