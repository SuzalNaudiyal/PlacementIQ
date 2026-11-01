export interface DatabaseHealth {
  status: 'connected' | 'disconnected' | string;
  database: string;
  latency_ms?: number | null;
  error?: string | null;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | string;
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
  database: DatabaseHealth;
  services: Record<string, string>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}
