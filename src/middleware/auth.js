/**
 * =========================================
 * AUTHENTICATION MIDDLEWARE
 * =========================================
 * JWT-based authentication for protected routes
 * Created by: Abhimanyu Dudeja
 * =========================================
 */

import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDb } from "../db/connection.js";

/**
 * Middleware to verify JWT token and attach user to request
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {Function} next Next middleware function
 */
export async function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please provide a valid token.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const db = getDb();
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found. Please login again.",
      });
    }

    // Attach user to request (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token. Please login again.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired. Please login again.",
      });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication failed.",
    });
  }
}

/**
 * Optional authentication - attaches user if token present, continues if not
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {Function} next Next middleware function
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const db = getDb();
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
    }

    next();
  } catch (_error) {
    // Token invalid or expired, continue without user
    next();
  }
}

/**
 * Generate JWT token for user
 * @param {ObjectId} userId User ID
 * @returns {string} JWT token
 */
export function generateToken(userId) {
  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export default {
  authenticate,
  optionalAuth,
  generateToken,
};
