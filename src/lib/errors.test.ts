import { describe, it, expect } from 'vitest';
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from './errors';

describe('AppError', () => {
  it('has correct default statusCode and code', () => {
    const error = new AppError('something went wrong');
    expect(error.message).toBe('something went wrong');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.name).toBe('AppError');
  });

  it('accepts custom statusCode and code', () => {
    const error = new AppError('custom', 418, 'TEAPOT');
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('TEAPOT');
  });

  it('is an instance of Error', () => {
    const error = new AppError('test');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('NotFoundError', () => {
  it('has statusCode 404 and code NOT_FOUND', () => {
    const error = new NotFoundError();
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
  });

  it('uses custom resource name in message', () => {
    const error = new NotFoundError('Cause');
    expect(error.message).toBe('Cause not found');
  });

  it('is an instance of AppError', () => {
    expect(new NotFoundError()).toBeInstanceOf(AppError);
  });
});

describe('UnauthorizedError', () => {
  it('has statusCode 401 and code UNAUTHORIZED', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.message).toBe('Authentication required');
  });

  it('accepts custom message', () => {
    const error = new UnauthorizedError('Token expired');
    expect(error.message).toBe('Token expired');
  });

  it('is an instance of AppError', () => {
    expect(new UnauthorizedError()).toBeInstanceOf(AppError);
  });
});

describe('ForbiddenError', () => {
  it('has statusCode 403 and code FORBIDDEN', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
    expect(error.message).toBe('Access denied');
  });

  it('accepts custom message', () => {
    const error = new ForbiddenError('Insufficient permissions');
    expect(error.message).toBe('Insufficient permissions');
  });

  it('is an instance of AppError', () => {
    expect(new ForbiddenError()).toBeInstanceOf(AppError);
  });
});

describe('ValidationError', () => {
  it('has statusCode 400 and code VALIDATION_ERROR', () => {
    const error = new ValidationError();
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Validation failed');
  });

  it('accepts details object', () => {
    const details = { email: ['Email is required', 'Email is invalid'] };
    const error = new ValidationError('Invalid input', details);
    expect(error.details).toEqual(details);
    expect(error.message).toBe('Invalid input');
  });

  it('details is undefined when not provided', () => {
    const error = new ValidationError();
    expect(error.details).toBeUndefined();
  });

  it('is an instance of AppError', () => {
    expect(new ValidationError()).toBeInstanceOf(AppError);
  });
});

describe('ConflictError', () => {
  it('has statusCode 409 and code CONFLICT', () => {
    const error = new ConflictError();
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
    expect(error.message).toBe('Resource already exists');
  });

  it('accepts custom message', () => {
    const error = new ConflictError('Email already in use');
    expect(error.message).toBe('Email already in use');
  });

  it('is an instance of AppError', () => {
    expect(new ConflictError()).toBeInstanceOf(AppError);
  });
});
