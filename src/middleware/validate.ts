import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

export function validate<T>(schema: ZodSchema<T>, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      return next(result.error);
    }
    req[part] = result.data as typeof req[typeof part];
    next();
  };
}
