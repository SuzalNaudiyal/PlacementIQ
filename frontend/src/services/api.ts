import axios from 'axios';
import type { HealthResponse } from '../types/system';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Authorization token if valid and present in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('placementiq_jwt_token');
  const isValid = token && token !== 'undefined' && token !== 'null' && token.trim().length > 10;
  if (isValid && config.headers) {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  } else if (!isValid && config.headers?.Authorization) {
    delete config.headers.Authorization;
  }
  return config;
});

// Interceptor to automatically purge invalid/expired sessions on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('placementiq_jwt_token');
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch system health and connectivity metrics from the backend.
 */
export const fetchSystemHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};

/**
 * Simple ping check to measure round-trip network latency.
 */
export const pingBackend = async (): Promise<{ message: string; latencyMs: number }> => {
  const start = performance.now();
  const response = await apiClient.get('/ping');
  const latencyMs = Math.round(performance.now() - start);
  return {
    message: response.data.message,
    latencyMs,
  };
};
