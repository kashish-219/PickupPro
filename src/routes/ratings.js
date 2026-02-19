/**
 * =========================================
 * RATINGS ROUTES
 * =========================================
 * Handles player ratings and reviews
 * Created by: Abhimanyu Dudeja
 * =========================================
 */

import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/connection.js";
import { authenticate } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";

const router = express.Router();

// =========================================
// ROUTES
// =========================================

/**
 * POST /api/ratings
 * Rate a player after a completed game
 * Created by: Abhimanyu Dudeja
 */
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { gameId, toUserId, score, comment } = req.body;
    const fromUserId = req.user._id;

    // Validation
    if (!gameId || !ObjectId.isValid(gameId)) {
      throw new AppError("Valid game ID is required", 400);
    }

    if (!toUserId || !ObjectId.isValid(toUserId)) {
      throw new AppError("Valid user ID to rate is required", 400);
    }

    if (!score || score < 1 || score > 5 || !Number.isInteger(score)) {
      throw new AppError("Score must be an integer between 1 and 5", 400);
    }

    if (comment && comment.length > 500) {
      throw new AppError("Comment must be 500 characters or less", 400);
    }

    // Cannot rate yourself
    if (fromUserId.toString() === toUserId) {
      throw new AppError("You cannot rate yourself", 400);
    }

    const db = getDb();

    // Check if game exists and is completed
    const game = await db.collection("games").findOne({
      _id: new ObjectId(gameId),
    });

    if (!game) {
      throw new AppError("Game not found", 404);
    }

    if (game.status !== "completed") {
      throw new AppError("Can only rate players from completed games", 400);
    }

    // Check if both users participated in the game
    const allParticipants = [game.hostId.toString(), ...game.players.map((p) => p.toString())];

    if (!allParticipants.includes(fromUserId.toString())) {
      throw new AppError("You must have participated in this game to rate", 403);
    }

    if (!allParticipants.includes(toUserId)) {
      throw new AppError("The user you are rating must have participated in this game", 400);
    }

    // Check if already rated this person for this game
    const existingRating = await db.collection("ratings").findOne({
      gameId: new ObjectId(gameId),
      fromUserId: fromUserId,
      toUserId: new ObjectId(toUserId),
    });

    if (existingRating) {
      throw new AppError("You have already rated this player for this game", 400);
    }

    // Create rating
    const newRating = {
      _id: new ObjectId(),
      gameId: new ObjectId(gameId),
      fromUserId: fromUserId,
      toUserId: new ObjectId(toUserId),
      score: parseInt(score),
      comment: comment?.trim() || "",
      createdAt: new Date(),
    };

    await db.collection("ratings").insertOne(newRating);

    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: newRating,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ratings/game/:gameId
 * Get all ratings for a game
 * Created by: Abhimanyu Dudeja
 */
router.get("/game/:gameId", async (req, res, next) => {
  try {
    const { gameId } = req.params;

    if (!ObjectId.isValid(gameId)) {
      throw new AppError("Invalid game ID", 400);
    }

    const db = getDb();

    // Check if game exists
    const game = await db.collection("games").findOne({
      _id: new ObjectId(gameId),
    });

    if (!game) {
      throw new AppError("Game not found", 404);
    }

    // Get ratings with user details
    const ratings = await db
      .collection("ratings")
      .aggregate([
        { $match: { gameId: new ObjectId(gameId) } },
        { $sort: { createdAt: -1 } },
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
            from: "users",
            localField: "toUserId",
            foreignField: "_id",
            as: "toUser",
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
            toUser: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$toUser",
                    as: "u",
                    in: { _id: "$$u._id", name: "$$u.name" },
                  },
                },
                0,
              ],
            },
          },
        },
      ])
      .toArray();

    res.json({
      success: true,
      data: {
        game: {
          _id: game._id,
          title: game.title,
          sport: game.sport,
          date: game.date,
        },
        ratings,
        totalRatings: ratings.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ratings/pending
 * Get games where current user can rate players
 * Created by: Abhimanyu Dudeja
 */
router.get("/pending", authenticate, async (req, res, next) => {
  try {
    const db = getDb();
    const userId = req.user._id;

    // Find completed games where user participated
    const games = await db
      .collection("games")
      .find({
        status: "completed",
        $or: [{ hostId: userId }, { players: userId }],
      })
      .sort({ date: -1 })
      .limit(20)
      .toArray();

    // For each game, find which players haven't been rated yet
    const pendingRatings = [];

    for (const game of games) {
      // Get all participants except self
      const allParticipants = [
        game.hostId,
        ...game.players,
      ].filter((p) => p.toString() !== userId.toString());

      // Get existing ratings from this user for this game
      const existingRatings = await db
        .collection("ratings")
        .find({
          gameId: game._id,
          fromUserId: userId,
        })
        .toArray();

      const ratedUserIds = existingRatings.map((r) => r.toUserId.toString());

      // Filter to unrated participants
      const unratedParticipants = allParticipants.filter(
        (p) => !ratedUserIds.includes(p.toString()),
      );

      if (unratedParticipants.length > 0) {
        // Get user details for unrated participants
        const unratedUsers = await db
          .collection("users")
          .find(
            { _id: { $in: unratedParticipants } },
            { projection: { password: 0 } },
          )
          .toArray();

        pendingRatings.push({
          game: {
            _id: game._id,
            title: game.title,
            sport: game.sport,
            date: game.date,
            location: game.location,
          },
          unratedPlayers: unratedUsers,
          ratedCount: ratedUserIds.length,
          totalParticipants: allParticipants.length,
        });
      }
    }

    res.json({
      success: true,
      data: {
        pendingRatings,
        totalGamesWithPending: pendingRatings.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
