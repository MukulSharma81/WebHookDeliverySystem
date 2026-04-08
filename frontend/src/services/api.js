// src/services/api.js
// Centralized Axios instance for all API calls

import axios from "axios";

// Base URL points to /api — all endpoint paths are relative to this
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor — attach auth token if available ──
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle global errors ──
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // Normalize error message for display
    error.userMessage =
      error.response?.data?.message ||
      (error.code === "ECONNABORTED" ? "Request timed out. Is the server running?" : "Something went wrong.");

    return Promise.reject(error);
  }
);

// ── Webhook Endpoints ─────────────────────────────────────
// GET  /api/webhooks
export const fetchAllWebhooks = () => API.get("/webhooks");

// GET  /api/webhooks/:id
export const fetchWebhookById = (id) => API.get(`/webhooks/${id}`);

// POST /api/webhooks
export const createWebhook = (data) => API.post("/webhooks", data);

export default API;
