/**
 * =========================================
 * PICKUPPRO - MAIN SERVER
 * =========================================
 * Express server with MongoDB backend
 * Authors: Kashish Rahulbhai Khatri & Abhimanyu Dudeja
 * Course: CS5610 Web Development
 * =========================================
 */

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Import database connection
import { connectToDatabase, closeConnection } from "./db/connection.js";

// Import routes
import authRoutes from "./routes/auth.js";
import gamesRoutes from "./routes/games.js";
import usersRoutes from "./routes/users.js";
import ratingsRoutes from "./routes/ratings.js";

// Import middleware
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// =========================================
// MIDDLEWARE
// =========================================

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Request logging in development
if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
  });
}

// =========================================
// API ROUTES
// =========================================

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "PickupPro API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/ratings", ratingsRoutes);

// =========================================
// FRONTEND ROUTES (SPA)
// =========================================

// Serve index.html for all non-API routes (SPA support)
app.get("*", (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// =========================================
// ERROR HANDLING
// =========================================

// 404 handler for API routes
app.use("/api/*", notFoundHandler);

// Global error handler
app.use(errorHandler);

// =========================================
// SERVER STARTUP
// =========================================

async function startServer() {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log("\n=========================================");
      console.log("🏀 PickupPro Server Started");
      console.log("=========================================");
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("=========================================\n");
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        console.log("HTTP server closed");
        await closeConnection();
        console.log("Database connection closed");
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error("Forcing shutdown...");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
