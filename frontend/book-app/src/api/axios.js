import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3990",
  withCredentials: true, // send cookie if your backend sets one
});

// attach token from redux/localStorage if present
api.interceptors.request.use((config) => {
  const saved = localStorage.getItem("bp_auth");
  const token = saved ? JSON.parse(saved).token : "";
  if (token) config.headers.Authorization = token; // your backend expects raw token
  return config;
});

export default api;
