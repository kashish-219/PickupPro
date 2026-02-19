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
export function notFoundHandler(req, res, _next) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

/**
 * Global error handler middleware
 * @param {Error} err Error object
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {Function} _next Next middleware function
 */
export function errorHandler(err, req, res, _next) {
  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(400).json({
      success: false,
      error: `A record with this ${field || "value"} already exists.`,
    });
  }

  // MongoDB validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: messages.join(", ") || "Validation failed",
    });
  }

  // MongoDB CastError (invalid ObjectId)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token expired",
    });
  }

  // Custom AppError
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

export default {
  AppError,
  notFoundHandler,
  errorHandler,
};
