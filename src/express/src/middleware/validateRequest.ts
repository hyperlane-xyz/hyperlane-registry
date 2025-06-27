import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiError } from '../errors/ApiError.js';
import AppConstants from '../constants/AppConstants.js';

export function validateQueryParams<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (parsed.success) {
      Object.assign(req.query, parsed.data);
      next();
    } else {
      const errorMessage = parsed.error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      next(
        new ApiError(
          `Validation error in query parameters: ${errorMessage}`,
          AppConstants.HTTP_STATUS_BAD_REQUEST,
        ),
      );
    }
  };
}

export function validateRequestParam<T extends z.ZodTypeAny>(name: string, schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params[name]);
    if (parsed.success) {
      req.params[name] = parsed.data;
      next();
    } else {
      const errorMessage = parsed.error.errors
        .map((err) => `${err.path.join('.') || name}: ${err.message}`)
        .join(', ');
      next(
        new ApiError(
          `Validation error for param '${name}': ${errorMessage}`,
          AppConstants.HTTP_STATUS_BAD_REQUEST,
        ),
      );
    }
  };
}

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (parsed.success) {
      req.body = parsed.data; // Assign the parsed (and potentially transformed) body back
      next();
    } else {
      const errorMessage = parsed.error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      next(
        new ApiError(
          `Validation error in body: ${errorMessage}`,
          AppConstants.HTTP_STATUS_BAD_REQUEST,
        ),
      );
    }
  };
}

export function validateQueryParam<T extends z.ZodTypeAny>(name: string, schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query[name]);
    if (parsed.success) {
      req.query[name] = parsed.data;
      next();
    } else {
      const errorMessage = parsed.error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      next(
        new ApiError(
          `Validation error in query: ${errorMessage}`,
          AppConstants.HTTP_STATUS_BAD_REQUEST,
        ),
      );
    }
  };
}
