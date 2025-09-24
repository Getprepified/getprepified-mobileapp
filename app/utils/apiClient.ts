import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Logger } from "./logger";

// Create axios instance with interceptors for comprehensive logging
const apiClient = axios.create({
  baseURL: "http://localhost:4000",
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const startTime = Date.now();
    (config as any).startTime = startTime;

    Logger.logRequest(
      config.method?.toUpperCase() || "UNKNOWN",
      `${config.baseURL}${config.url}`,
      config.headers,
      config.data
    );

    return config;
  },
  (error) => {
    Logger.error("❌ Request interceptor error", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const duration = Date.now() - (response.config as any).startTime;

    Logger.logResponse(
      response.config.method?.toUpperCase() || "UNKNOWN",
      `${response.config.baseURL}${response.config.url}`,
      response.status,
      response.data,
      duration
    );

    return response;
  },
  (error) => {
    const duration = error.config
      ? Date.now() - (error.config as any).startTime
      : 0;

    Logger.logError(
      error.config?.method?.toUpperCase() || "UNKNOWN",
      error.config
        ? `${error.config.baseURL}${error.config.url}`
        : "UNKNOWN_URL",
      error
    );

    // Log additional error details
    if (error.response) {
      Logger.error("📊 Error Response Details", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        duration: `${duration}ms`,
      });
    } else if (error.request) {
      Logger.error("🌐 Network Error Details", {
        request: error.request,
        message: error.message,
        duration: `${duration}ms`,
      });
    } else {
      Logger.error("⚠️ Request Setup Error", {
        message: error.message,
        duration: `${duration}ms`,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
