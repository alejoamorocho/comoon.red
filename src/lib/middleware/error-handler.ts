import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { AppError, ValidationError } from '../errors';

export const errorHandler: ErrorHandler = (err, c) => {
  const correlationId = crypto.randomUUID();

  if (err instanceof AppError) {
    console.error(`[${correlationId}] ${err.code}: ${err.message}`);
    return c.json(
      {
        error: err.message,
        code: err.code,
        correlationId,
        ...(err instanceof ValidationError && err.details ? { details: err.details } : {}),
      },
      err.statusCode as ContentfulStatusCode,
    );
  }

  // Unhandled errors
  console.error(`[${correlationId}] Unhandled error:`, err);
  return c.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      correlationId,
    },
    500,
  );
};
