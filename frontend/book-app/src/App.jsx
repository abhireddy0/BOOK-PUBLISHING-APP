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
import BooksList from  "./pages/BooksList"
import CreateBook from "./pages/CreateBook";
import BookReader from "./pages/BookReader"
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard"
import Landing from "./pages/Landing"



export default function App() {
  return (
    <Routes>
      {/* Public home -> show all books */}
       <Route path="/" element={<Landing />} />
      <Route path="/books" element={<BooksList />} />
      {/* <Route path="/" element={<BooksList />} /> */}

      {/* Auth pages */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Public book detail page */}
      <Route path="/books/:id" element={<BookDetail />} />

      {/* Create new book – author only */}
      <Route
        path="/books/new"
        element={
          <ProtectedRoute allowedRoles={["author"]}>
            <CreateBook />
          </ProtectedRoute>
        }
      />

      {/* Edit book – author only */}
      <Route
        path="/books/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["author"]}>
            <EditBook />
          </ProtectedRoute>
        }
      />

      {/* Author dashboard */}
      <Route
        path="/dashboard/author"
        element={
          <ProtectedRoute allowedRoles={["author"]}>
            <AuthorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin dashboard */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* My books */}
      <Route
        path="/my-books"
        element={
          <ProtectedRoute allowedRoles={["author"]}>
            <MyBooks />
          </ProtectedRoute>
        }
      />

      <Route
    path="/books/:id/read"
    element={
      <ProtectedRoute>
        <BookReader />
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

      

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
