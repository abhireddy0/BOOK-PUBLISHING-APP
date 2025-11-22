// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Pages
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AuthorDashboard from "./pages/AuthorDashboard";
import MyBooks from "./pages/MyBooks";
import EditBook from "./pages/EditBook";
import BookDetail from "./pages/BookDetail";
import MyPurchases from "./pages/MyPurchases";
import BooksList from "./pages/BooksList";
import CreateBook from "./pages/CreateBook";
import BookReader from "./pages/BookReader";
import AdminDashboard from "./pages/AdminDashboard";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile"; // 👈 NEW

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import ChatBot from "./components/ChatBot";

function AppInner() {
  const location = useLocation();

  // Hide Navbar on authentication pages
  const hideNavRoutes = ["/login", "/signup", "/forgot-password"];
  const showNavbar = !hideNavRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}

      {/* Adds spacing because Navbar is fixed */}
      <div className={showNavbar ? "pt-14" : ""}>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/books" element={<BooksList />} />
          <Route path="/books/:id" element={<BookDetail />} />

          {/* Auth pages */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Reader / Author / Admin pages */}
          <Route
            path="/purchases"
            element={
              <ProtectedRoute allowedRoles={["reader", "author", "admin"]}>
                <MyPurchases />
              </ProtectedRoute>
            }
          />

          {/* Profile page (all roles allowed) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["reader", "author", "admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Author-only pages */}
          <Route
            path="/dashboard/author"
            element={
              <ProtectedRoute allowedRoles={["author"]}>
                <AuthorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-books"
            element={
              <ProtectedRoute allowedRoles={["author"]}>
                <MyBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/new"
            element={
              <ProtectedRoute allowedRoles={["author"]}>
                <CreateBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["author"]}>
                <EditBook />
              </ProtectedRoute>
            }
          />

          {/* Book reader (any logged-in user) */}
          <Route
            path="/books/:id/read"
            element={
              <ProtectedRoute>
                <BookReader />
              </ProtectedRoute>
            }
          />

          {/* Admin-only */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Not found → redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Floating AI bot */}
      <ChatBot />
    </>
  );
}

export default AppInner;
