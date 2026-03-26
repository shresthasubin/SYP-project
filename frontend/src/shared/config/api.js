import axios from "axios";

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const productionServerUrl = "https://cinemahub-backend.onrender.com";

// Mirror the Swagger servers: allow a hosted default but prefer deploy-time overrides.
const envApiServer = trimTrailingSlash(import.meta.env.VITE_API_SERVER_URL);
const envApiBase = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL);

const resolvedServerUrl = envApiServer || productionServerUrl;

// Guard against malformed VITE_API_BASE_URL values that simply append "api" without a slash.
const shouldRebuildBaseFromServer =
  envApiBase &&
  envApiServer &&
  envApiBase.startsWith(envApiServer) &&
  !envApiBase.slice(envApiServer.length).startsWith("/");

const resolvedApiBase =
  !envApiBase || shouldRebuildBaseFromServer
    ? `${resolvedServerUrl}/api`
    : envApiBase;

export const API_BASE_URL = resolvedApiBase;
export const API_SERVER_URL = resolvedServerUrl;


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Allows cookies to be sent with requests
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Adds authorization token to headers before each request
 */
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve token from localStorage if available
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Handles response data extraction and centralized error handling
 */
apiClient.interceptors.response.use(
  (response) => {
    // Extract data from response payload if it follows a standard format
    const payload = response.data;
    if (payload && typeof payload === "object" && "data" in payload) {
      return payload.data;
    }
    return payload;
  },
  (error) => {
    // Centralized error handling
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred";
    console.error("API Error:", errorMessage);

    // Handle specific HTTP status codes
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      // Forbidden - access denied
      console.error("Access Forbidden:", errorMessage);
    } else if (error.response?.status === 500) {
      // Server error
      console.error("Server Error:", errorMessage);
    }

    // Show user-friendly error messages
    if (error.response?.data?.message) {
      error.userMessage = error.response.data.message;
    }

    return Promise.reject(error);
  },
);

export default apiClient;
