import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction): void;
export declare function createError(message: string, statusCode?: number): AppError;
//# sourceMappingURL=errorHandler.d.ts.map