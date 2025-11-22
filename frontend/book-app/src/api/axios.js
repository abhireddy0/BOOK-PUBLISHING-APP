import axios from "axios";
import { serverUrl } from "../config/server";

export const api = axios.create({
  baseURL: serverUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
