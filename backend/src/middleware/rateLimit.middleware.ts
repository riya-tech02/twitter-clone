import { Request, Response, NextFunction } from "express";

export const messageLimiter = (req: Request, res: Response, next: NextFunction) => {
  next();
};
