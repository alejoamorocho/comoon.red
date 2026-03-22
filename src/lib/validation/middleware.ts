import type { ZodSchema } from 'zod';
import { createMiddleware } from 'hono/factory';

export function validateBody<T extends ZodSchema>(schema: T) {
  return createMiddleware(async (c, next) => {
    const body = await c.req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return c.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: result.error.flatten().fieldErrors,
        },
        400,
      );
    }
    c.set('validatedBody', result.data);
    await next();
  });
}

export function validateQuery<T extends ZodSchema>(schema: T) {
  return createMiddleware(async (c, next) => {
    const query = c.req.query();
    const result = schema.safeParse(query);
    if (!result.success) {
      return c.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: result.error.flatten().fieldErrors,
        },
        400,
      );
    }
    c.set('validatedQuery', result.data);
    await next();
  });
}

export function validateParams<T extends ZodSchema>(schema: T) {
  return createMiddleware(async (c, next) => {
    const params = c.req.param();
    const result = schema.safeParse(params);
    if (!result.success) {
      return c.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: result.error.flatten().fieldErrors,
        },
        400,
      );
    }
    c.set('validatedParams', result.data);
    await next();
  });
}
