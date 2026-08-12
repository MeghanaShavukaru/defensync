import { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  const errors = err.errors || [];

  res.status(status).json({
    success: false,
    message,
    errors,
  });
};
