export interface SuccessResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ErrorResponse {
  error: string;
  code: string;
  correlationId?: string;
  details?: Record<string, string[]>;
}

export function success<T>(data: T, meta?: Record<string, unknown>): SuccessResponse<T> {
  return { data, ...(meta ? { meta } : {}) };
}
