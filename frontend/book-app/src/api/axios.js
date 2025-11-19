// src/api/axios.js
import axios from "axios";
import { serverUrl } from "../config/server"

export const api = axios.create({
  baseURL: serverUrl,
});

// attach token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
