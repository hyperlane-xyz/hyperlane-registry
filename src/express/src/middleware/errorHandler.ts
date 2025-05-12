import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors/ApiError.js';

interface ErrorResponse {
  error: {
    message: string;
  };
}

export function errorHandler(err: any, _req: Request, res: Response, next: NextFunction) {
  // If we've already started sending a response, delegate to the default handler
  if (res.headersSent) {
    return next(err);
  }

  const apiError = err instanceof ApiError ? err : new ApiError('Internal Server Error', 500);
  const status = apiError.status;
  const body: ErrorResponse['error'] = {
    message: apiError.message,
  };

  res.status(status).json(body);
}
