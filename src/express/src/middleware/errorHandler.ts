import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors/ApiError.js';
import type { Logger } from 'pino';

export function createErrorHandler(logger: Logger | Console) {
  return function errorHandler(err: any, _req: Request, res: Response, next: NextFunction) {
    // If we've already started sending a response, delegate to the default handler
    if (res.headersSent) {
      return next(err);
    }

    const apiError =
      err instanceof ApiError
        ? err
        : err instanceof Error
        ? new ApiError(`Internal Server Error: ${err.message}`, 500, err.stack)
        : new ApiError('Internal Server Error: unknown error', 500);

    logger.error('Error handling request:', err);

    res.status(apiError.status).json({
      message: apiError.message,
      stack: apiError.stack,
    });
  };
}
