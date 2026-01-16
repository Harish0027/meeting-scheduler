import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "./errorHandler";

export const validateRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      const message = error.errors?.[0]?.message || "Validation failed";
      throw new AppError(message, 400);
    }
  };

export const validateQueryParams =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error: any) {
      const message = error.errors?.[0]?.message || "Validation failed";
      throw new AppError(message, 400);
    }
  };

export const validateParams =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error: any) {
      const message = error.errors?.[0]?.message || "Validation failed";
      throw new AppError(message, 400);
    }
  };
