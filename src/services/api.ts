import axios from "axios";

const API_BASE_URL = "https://doctor-appointment-5j6e.onrender.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔒 Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or from a secure store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
