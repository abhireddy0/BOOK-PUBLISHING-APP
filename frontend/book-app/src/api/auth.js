// src/api/auth.js
import axios from "axios";
import { serverUrl } from "../config/server" // or wherever you defined serverUrl

// 🛰️ Reusable axios instance
const api = axios.create({
  baseURL: serverUrl, // "http://localhost:3990"
  withCredentials: true, // send cookie if backend sets one
});

// ===== AUTH APIS =====

export const signup = async (formData) => {
  const res = await api.post("/auth/signup", formData);
  return res.data; // { message, user, ... }
};

export const login = async (formData) => {
  const res = await api.post("/auth/login", formData);
  return res.data; // { message, token, user }
};

export const logout = async () => {
  const res = await api.post("/auth/logout");
  return res.data; // { message }
};

// ===== FORGOT PASSWORD FLOW =====

export const sendOtp = async (email) => {
  const res = await api.post("/auth/sendotp", { email });
  return res.data; // { message }
};

export const verifyOtp = async (email, otp) => {
  const res = await api.post("/auth/verifyotp", { email, otp });
  return res.data; // { message }
};

export const resetPassword = async (email, password) => {
  const res = await api.post("/auth/resetpassword", { email, password });
  return res.data; // { message }
};
