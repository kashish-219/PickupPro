/**
 * =========================================
 * ERROR HANDLING MIDDLEWARE
 * =========================================
 * Centralized error handling for the application
 * Created by: Kashish Rahulbhai Khatri
 * =========================================
 */

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle 404 Not Found errors
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {Function} next Next middleware function
 */
export function errorHandler(err, req, res, _next) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
}
