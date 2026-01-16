import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  statusCode?: number;
}

export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
  }
}

export const errorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = (err as any)?.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[${new Date().toISOString()}] Error:`, {
    message,
    statusCode,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
    },
  });
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
