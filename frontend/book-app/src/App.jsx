// /src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "../src/pages/ForgotPassword"


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login"  element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* add other routes later */}
    </Routes>
  );
}
