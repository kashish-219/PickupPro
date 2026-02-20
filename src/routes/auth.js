/**
 * =========================================
 * AUTHENTICATION ROUTES
 * =========================================
 * Handles user registration, login, and profile
 * Created by: Abhimanyu Dudeja
 * =========================================
 */

import express from "express";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDb } from "../db/connection.js";
import { authenticate, generateToken } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";

const router = express.Router();

// =========================================
// VALIDATION HELPERS
// =========================================

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

// =========================================
// ROUTES
// =========================================

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name, bio, sports, skillLevels } = req.body;

    // Validation
    if (!email || !password || !name) {
      throw new AppError("Email, password, and name are required", 400);
    }

    if (!validateEmail(email)) {
      throw new AppError("Invalid email format", 400);
    }

    if (!validatePassword(password)) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    if (name.length < 2 || name.length > 50) {
      throw new AppError("Name must be between 2 and 50 characters", 400);
    }

    const db = getDb();
    const usersCollection = db.collection("users");

    // Check if email already exists
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      _id: new ObjectId(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      bio: bio?.trim() || "",
      sports: sports || [],
      skillLevels: skillLevels || {},
      avatarUrl: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await usersCollection.insertOne(newUser);

    // Generate token
    const token = generateToken(newUser._id);

    // Return user without password
    const { password: _password, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const db = getDb();
    const usersCollection = db.collection("users");

    // Find user by email
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user without password
    const { password: _password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const db = getDb();

    // Get user's stats
    const gamesHosted = await db.collection("games").countDocuments({
      hostId: req.user._id,
    });

    const gamesPlayed = await db.collection("games").countDocuments({
      players: req.user._id,
      status: "completed",
    });

    // Get average rating
    const ratingAgg = await db
      .collection("ratings")
      .aggregate([
        { $match: { toUserId: req.user._id } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$score" },
            totalRatings: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const stats = {
      gamesHosted,
      gamesPlayed,
      avgRating: ratingAgg[0]?.avgRating || 0,
      totalRatings: ratingAgg[0]?.totalRatings || 0,
    };

    res.json({
      success: true,
      data: {
        user: req.user,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
