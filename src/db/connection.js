/**
 * =========================================
 * DATABASE CONNECTION MODULE
 * =========================================
 * Handles MongoDB connection using native driver
 * Created by: Kashish Rahulbhai Khatri
 * =========================================
 */

import { MongoClient } from "mongodb";

let client = null;
let db = null;

/**
 * Connect to MongoDB database
 * @returns {Promise<Db>} MongoDB database instance
 */
export async function connectToDatabase() {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    client = new MongoClient(uri);
    await client.connect();

    // Extract database name from URI or use default
    const dbName = new URL(uri).pathname.slice(1) || "pickuppro";
    db = client.db(dbName);

    console.log(`✅ Connected to MongoDB database: ${dbName}`);

    // Create indexes
    await createIndexes(db);

    return db;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    throw error;
  }
}

/**
 * Get database instance
 * @returns {Db} MongoDB database instance
 */
export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToDatabase first.");
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("🔌 MongoDB connection closed");
  }
}

/**
 * Create database indexes for optimal query performance
 * @param {Db} database MongoDB database instance
 */
async function createIndexes(database) {
  try {
    // Users collection indexes
    const usersCollection = database.collection("users");
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ name: "text" });
    await usersCollection.createIndex({ sports: 1 });

    // Games collection indexes
    const gamesCollection = database.collection("games");
    await gamesCollection.createIndex({ hostId: 1 });
    await gamesCollection.createIndex({ sport: 1 });
    await gamesCollection.createIndex({ date: 1 });
    await gamesCollection.createIndex({ status: 1 });
    await gamesCollection.createIndex({ "location.city": "text" });
    await gamesCollection.createIndex({ sport: 1, date: 1, status: 1 });

    // Ratings collection indexes
    const ratingsCollection = database.collection("ratings");
    await ratingsCollection.createIndex({ gameId: 1 });
    await ratingsCollection.createIndex({ toUserId: 1 });
    await ratingsCollection.createIndex(
      { fromUserId: 1, toUserId: 1, gameId: 1 },
      { unique: true },
    );

    console.log("✅ Database indexes created successfully");
  } catch (error) {
    console.error("⚠️ Error creating indexes:", error.message);
  }
}

export default {
  connectToDatabase,
  getDb,
  closeConnection,
};
