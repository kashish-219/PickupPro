/**
 * =========================================
 * USERS ROUTES
 * =========================================
 * Handles user profiles and discovery
 * Created by: Abhimanyu Dudeja
 * =========================================
 */

import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/connection.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";

const router = express.Router();

// =========================================
// CONSTANTS
// =========================================

const VALID_SPORTS = [
  "Basketball",
  "Soccer",
  "Tennis",
  "Volleyball",
  "Baseball",
  "Cricket",
  "Badminton",
  "Running",
  "Other",
];

const VALID_SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];

// =========================================
// ROUTES
// =========================================

/**
 * GET /api/users
 * Search and list users
 * Created by: Abhimanyu Dudeja
 */
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const { search, sport, minRating, page = 1, limit = 20 } = req.query;

    const db = getDb();
    const usersCollection = db.collection("users");

    // Build filter
    const filter = {};

    // Text search on name
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Sport filter
    if (sport && VALID_SPORTS.includes(sport)) {
      filter.sports = sport;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 100);

    // Get users
    const users = await usersCollection
      .find(filter, { projection: { password: 0 } })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    const total = await usersCollection.countDocuments(filter);

    // Get ratings for all users
    const userIds = users.map((u) => u._id);
    const ratingsAgg = await db
      .collection("ratings")
      .aggregate([
        { $match: { toUserId: { $in: userIds } } },
        {
          $group: {
            _id: "$toUserId",
            avgRating: { $avg: "$score" },
            totalRatings: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const ratingsMap = {};
    ratingsAgg.forEach((r) => {
      ratingsMap[r._id.toString()] = {
        avgRating: r.avgRating,
        totalRatings: r.totalRatings,
      };
    });

    // Enhance users with ratings
    let enhancedUsers = users.map((user) => ({
      ...user,
      rating: ratingsMap[user._id.toString()] || {
        avgRating: 0,
        totalRatings: 0,
      },
    }));

    // Filter by minimum rating if specified
    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      enhancedUsers = enhancedUsers.filter(
        (u) => u.rating.avgRating >= minRatingNum || u.rating.totalRatings === 0
      );
    }

    res.json({
      success: true,
      data: {
        users: enhancedUsers,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id
 * Get user profile
 * Created by: Abhimanyu Dudeja
 */
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid user ID", 400);
    }

    const db = getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Get rating stats
    const ratingAgg = await db
      .collection("ratings")
      .aggregate([
        { $match: { toUserId: user._id } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$score" },
            totalRatings: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Get rating distribution
    const ratingDist = await db
      .collection("ratings")
      .aggregate([
        { $match: { toUserId: user._id } },
        {
          $group: {
            _id: "$score",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ])
      .toArray();

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingDist.forEach((r) => {
      distribution[r._id] = r.count;
    });

    // Get recent ratings
    const recentRatings = await db
      .collection("ratings")
      .aggregate([
        { $match: { toUserId: user._id } },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "fromUserId",
            foreignField: "_id",
            as: "fromUser",
          },
        },
        {
          $lookup: {
            from: "games",
            localField: "gameId",
            foreignField: "_id",
            as: "game",
          },
        },
        {
          $project: {
            score: 1,
            comment: 1,
            createdAt: 1,
            fromUser: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$fromUser",
                    as: "u",
                    in: { _id: "$$u._id", name: "$$u.name" },
                  },
                },
                0,
              ],
            },
            game: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$game",
                    as: "g",
                    in: {
                      _id: "$$g._id",
                      title: "$$g.title",
                      sport: "$$g.sport",
                    },
                  },
                },
                0,
              ],
            },
          },
        },
      ])
      .toArray();

    // Get games stats
    const gamesHosted = await db.collection("games").countDocuments({
      hostId: user._id,
    });

    const gamesPlayed = await db.collection("games").countDocuments({
      players: user._id,
      status: "completed",
    });

    res.json({
      success: true,
      data: {
        user,
        stats: {
          avgRating: ratingAgg[0]?.avgRating || 0,
          totalRatings: ratingAgg[0]?.totalRatings || 0,
          ratingDistribution: distribution,
          gamesHosted,
          gamesPlayed,
        },
        recentRatings,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/:id
 * Update user profile
 * Created by: Abhimanyu Dudeja
 */
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid user ID", 400);
    }

    // Check if user is updating their own profile
    if (req.user._id.toString() !== id) {
      throw new AppError("You can only update your own profile", 403);
    }

    const { name, bio, sports, skillLevels, avatarUrl } = req.body;

    const updates = { updatedAt: new Date() };

    // Validate and set updates
    if (name !== undefined) {
      if (name.length < 2 || name.length > 50) {
        throw new AppError("Name must be between 2 and 50 characters", 400);
      }
      updates.name = name.trim();
    }

    if (bio !== undefined) {
      if (bio.length > 500) {
        throw new AppError("Bio must be 500 characters or less", 400);
      }
      updates.bio = bio.trim();
    }

    if (sports !== undefined) {
      if (!Array.isArray(sports)) {
        throw new AppError("Sports must be an array", 400);
      }
      const validSports = sports.filter((s) => VALID_SPORTS.includes(s));
      updates.sports = validSports;
    }

    if (skillLevels !== undefined) {
      if (typeof skillLevels !== "object") {
        throw new AppError("Skill levels must be an object", 400);
      }
      const validSkillLevels = {};
      for (const [sport, level] of Object.entries(skillLevels)) {
        if (
          VALID_SPORTS.includes(sport) &&
          VALID_SKILL_LEVELS.includes(level)
        ) {
          validSkillLevels[sport] = level;
        }
      }
      updates.skillLevels = validSkillLevels;
    }

    if (avatarUrl !== undefined) {
      updates.avatarUrl = avatarUrl;
    }

    const db = getDb();
    const result = await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: "after", projection: { password: 0 } }
      );

    if (!result) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id/games
 * Get user's game history
 * Created by: Abhimanyu Dudeja
 */
router.get("/:id/games", optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, role, page = 1, limit = 20 } = req.query;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid user ID", 400);
    }

    const db = getDb();
    const userId = new ObjectId(id);

    // Build filter
    const filter = {
      $or: [{ hostId: userId }, { players: userId }],
    };

    if (status && ["upcoming", "completed", "cancelled"].includes(status)) {
      filter.status = status;
    }

    if (role === "host") {
      delete filter.$or;
      filter.hostId = userId;
    } else if (role === "player") {
      delete filter.$or;
      filter.players = userId;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 100);

    // Get games
    const [games, total] = await Promise.all([
      db
        .collection("games")
        .find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      db.collection("games").countDocuments(filter),
    ]);

    // Enhance games with role info
    const enhancedGames = games.map((game) => ({
      ...game,
      role: game.hostId.toString() === id ? "host" : "player",
      playerCount: game.players?.length || 0,
    }));

    res.json({
      success: true,
      data: {
        games: enhancedGames,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id/ratings
 * Get ratings received by user
 * Created by: Abhimanyu Dudeja
 */
router.get("/:id/ratings", optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid user ID", 400);
    }

    const db = getDb();
    const userId = new ObjectId(id);

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 100);

    // Get ratings with details
    const ratings = await db
      .collection("ratings")
      .aggregate([
        { $match: { toUserId: userId } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: "users",
            localField: "fromUserId",
            foreignField: "_id",
            as: "fromUser",
          },
        },
        {
          $lookup: {
            from: "games",
            localField: "gameId",
            foreignField: "_id",
            as: "game",
          },
        },
        {
          $project: {
            score: 1,
            comment: 1,
            createdAt: 1,
            fromUser: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$fromUser",
                    as: "u",
                    in: { _id: "$$u._id", name: "$$u.name" },
                  },
                },
                0,
              ],
            },
            game: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$game",
                    as: "g",
                    in: {
                      _id: "$$g._id",
                      title: "$$g.title",
                      sport: "$$g.sport",
                      date: "$$g.date",
                    },
                  },
                },
                0,
              ],
            },
          },
        },
      ])
      .toArray();

    const total = await db.collection("ratings").countDocuments({
      toUserId: userId,
    });

    res.json({
      success: true,
      data: {
        ratings,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;  