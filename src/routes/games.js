/**
 * =========================================
 * GAMES ROUTES
 * =========================================
 * Handles all game-related CRUD operations
 * Created by: Kashish Rahulbhai Khatri
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

const VALID_SKILL_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "All Levels",
];

const VALID_STATUSES = ["upcoming", "completed", "cancelled"];

// =========================================
// HELPER FUNCTIONS
// =========================================

/**
 * Get user details for player IDs
 * @param {Db} db Database instance
 * @param {ObjectId[]} playerIds Array of player ObjectIds
 * @returns {Promise<Object[]>} Array of player details
 */
async function getPlayerDetails(db, playerIds) {
  if (!playerIds || playerIds.length === 0) {
    return [];
  }

  const players = await db
    .collection("users")
    .find({ _id: { $in: playerIds } }, { projection: { password: 0 } })
    .toArray();

  // Get ratings for each player
  const playerRatings = await db
    .collection("ratings")
    .aggregate([
      { $match: { toUserId: { $in: playerIds } } },
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
  playerRatings.forEach((r) => {
    ratingsMap[r._id.toString()] = {
      avgRating: r.avgRating,
      totalRatings: r.totalRatings,
    };
  });

  return players.map((player) => ({
    ...player,
    rating: ratingsMap[player._id.toString()] || {
      avgRating: 0,
      totalRatings: 0,
    },
  }));
}

// =========================================
// ROUTES
// =========================================

/**
 * GET /api/games
 * List all games with filters
 * Created by: Kashish Rahulbhai Khatri
 */
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const {
      sport,
      status,
      city,
      startDate,
      endDate,
      hostId,
      playerId,
      search,
      page = 1,
      limit = 20,
      sortBy = "date",
      sortOrder = "asc",
    } = req.query;

    const db = getDb();
    const gamesCollection = db.collection("games");

    // Build filter query
    const filter = {};

    // Sport filter (can be comma-separated)
    if (sport) {
      const sports = sport.split(",").filter((s) => VALID_SPORTS.includes(s));
      if (sports.length > 0) {
        filter.sport = { $in: sports };
      }
    }

    // Status filter
    if (status && VALID_STATUSES.includes(status)) {
      filter.status = status;
    }

    // City filter
    if (city) {
      filter["location.city"] = { $regex: city, $options: "i" };
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Host filter
    if (hostId) {
      filter.hostId = new ObjectId(hostId);
    }

    // Player filter (games where user is a player)
    if (playerId) {
      filter.players = new ObjectId(playerId);
    }

    // Text search on title or description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.name": { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 100);

    // Sort configuration
    const sortConfig = {};
    const validSortFields = ["date", "createdAt", "sport", "title"];
    if (validSortFields.includes(sortBy)) {
      sortConfig[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sortConfig.date = 1;
    }

    // Execute query
    const [games, total] = await Promise.all([
      gamesCollection
        .find(filter)
        .sort(sortConfig)
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      gamesCollection.countDocuments(filter),
    ]);

    // Get host details for each game
    const hostIds = [...new Set(games.map((g) => g.hostId))];
    const hosts = await db
      .collection("users")
      .find({ _id: { $in: hostIds } }, { projection: { password: 0 } })
      .toArray();

    // Get host ratings
    const hostRatings = await db
      .collection("ratings")
      .aggregate([
        { $match: { toUserId: { $in: hostIds } } },
        {
          $group: {
            _id: "$toUserId",
            avgRating: { $avg: "$score" },
            totalRatings: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const hostsMap = {};
    hosts.forEach((host) => {
      const rating = hostRatings.find(
        (r) => r._id.toString() === host._id.toString(),
      );
      hostsMap[host._id.toString()] = {
        ...host,
        rating: rating || { avgRating: 0, totalRatings: 0 },
      };
    });

    // Enhance games with host info and user status
    const enhancedGames = games.map((game) => {
      const enhanced = {
        ...game,
        host: hostsMap[game.hostId.toString()],
        playerCount: game.players?.length || 0,
        waitlistCount: game.waitlist?.length || 0,
        spotsAvailable: game.maxPlayers - (game.players?.length || 0),
        isFull: (game.players?.length || 0) >= game.maxPlayers,
      };

      // Add user-specific info if authenticated
      if (req.user) {
        const userId = req.user._id.toString();
        enhanced.isHost = game.hostId.toString() === userId;
        enhanced.isPlayer = game.players?.some((p) => p.toString() === userId);
        enhanced.isWaitlisted = game.waitlist?.some(
          (p) => p.toString() === userId,
        );
        enhanced.waitlistPosition = enhanced.isWaitlisted
          ? game.waitlist.findIndex((p) => p.toString() === userId) + 1
          : null;
      }

      return enhanced;
    });

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
 * GET /api/games/:id
 * Get single game details
 * Created by: Kashish Rahulbhai Khatri
 */
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid game ID", 400);
    }

    const db = getDb();
    const game = await db.collection("games").findOne({
      _id: new ObjectId(id),
    });

    if (!game) {
      throw new AppError("Game not found", 404);
    }

    // Get host details
    const host = await db
      .collection("users")
      .findOne({ _id: game.hostId }, { projection: { password: 0 } });

    // Get host rating
    const hostRating = await db
      .collection("ratings")
      .aggregate([
        { $match: { toUserId: game.hostId } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$score" },
            totalRatings: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Get player details
    const players = await getPlayerDetails(db, game.players);
    const waitlist = await getPlayerDetails(db, game.waitlist);

    // Build response
    const enhancedGame = {
      ...game,
      host: {
        ...host,
        rating: hostRating[0] || { avgRating: 0, totalRatings: 0 },
      },
      players,
      waitlist,
      playerCount: game.players?.length || 0,
      waitlistCount: game.waitlist?.length || 0,
      spotsAvailable: game.maxPlayers - (game.players?.length || 0),
      isFull: (game.players?.length || 0) >= game.maxPlayers,
    };

    // Add user-specific info if authenticated
    if (req.user) {
      const userId = req.user._id.toString();
      enhancedGame.isHost = game.hostId.toString() === userId;
      enhancedGame.isPlayer = game.players?.some(
        (p) => p.toString() === userId,
      );
      enhancedGame.isWaitlisted = game.waitlist?.some(
        (p) => p.toString() === userId,
      );
      enhancedGame.waitlistPosition = enhancedGame.isWaitlisted
        ? game.waitlist.findIndex((p) => p.toString() === userId) + 1
        : null;
    }

    res.json({
      success: true,
      data: enhancedGame,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/games
 * Create a new game
 * Created by: Kashish Rahulbhai Khatri
 */
router.post("/", authenticate, async (req, res, next) => {
  try {
    const {
      sport,
      title,
      description,
      location,
      date,
      maxPlayers,
      minPlayers,
      skillLevel,
    } = req.body;

    // Validation
    if (!sport || !VALID_SPORTS.includes(sport)) {
      throw new AppError(
        `Invalid sport. Must be one of: ${VALID_SPORTS.join(", ")}`,
        400,
      );
    }

    if (!title || title.length < 3 || title.length > 100) {
      throw new AppError("Title must be between 3 and 100 characters", 400);
    }

    if (!location || !location.name || !location.city) {
      throw new AppError("Location name and city are required", 400);
    }

    if (!date) {
      throw new AppError("Date is required", 400);
    }

    const gameDate = new Date(date);
    if (isNaN(gameDate.getTime())) {
      throw new AppError("Invalid date format", 400);
    }

    if (gameDate <= new Date()) {
      throw new AppError("Game date must be in the future", 400);
    }

    const max = parseInt(maxPlayers) || 10;
    const min = parseInt(minPlayers) || 2;

    if (max < 2 || max > 50) {
      throw new AppError("Max players must be between 2 and 50", 400);
    }

    if (min < 1 || min > max) {
      throw new AppError(
        "Min players must be at least 1 and not exceed max",
        400,
      );
    }

    if (skillLevel && !VALID_SKILL_LEVELS.includes(skillLevel)) {
      throw new AppError(
        `Invalid skill level. Must be one of: ${VALID_SKILL_LEVELS.join(", ")}`,
        400,
      );
    }

    const db = getDb();

    // Create game
    const newGame = {
      _id: new ObjectId(),
      hostId: req.user._id,
      sport,
      title: title.trim(),
      description: description?.trim() || "",
      location: {
        name: location.name.trim(),
        address: location.address?.trim() || "",
        city: location.city.trim(),
        coordinates: location.coordinates || null,
      },
      date: gameDate,
      maxPlayers: max,
      minPlayers: min,
      players: [],
      waitlist: [],
      status: "upcoming",
      skillLevel: skillLevel || "All Levels",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("games").insertOne(newGame);

    res.status(201).json({
      success: true,
      message: "Game created successfully",
      data: newGame,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/games/:id
 * Update a game (host only)
 * Created by: Kashish Rahulbhai Khatri
 */
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid game ID", 400);
    }

    const db = getDb();
    const game = await db.collection("games").findOne({
      _id: new ObjectId(id),
    });

    if (!game) {
      throw new AppError("Game not found", 404);
    }

    // Check if user is the host
    if (game.hostId.toString() !== req.user._id.toString()) {
      throw new AppError("Only the host can edit this game", 403);
    }

    // Check if game is already completed or cancelled
    if (game.status !== "upcoming") {
      throw new AppError("Cannot edit a completed or cancelled game", 400);
    }

    const {
      sport,
      title,
      description,
      location,
      date,
      maxPlayers,
      minPlayers,
      skillLevel,
    } = req.body;

    const updates = { updatedAt: new Date() };

    // Validate and set updates
    if (sport) {
      if (!VALID_SPORTS.includes(sport)) {
        throw new AppError(
          `Invalid sport. Must be one of: ${VALID_SPORTS.join(", ")}`,
          400,
        );
      }
      updates.sport = sport;
    }

    if (title) {
      if (title.length < 3 || title.length > 100) {
        throw new AppError("Title must be between 3 and 100 characters", 400);
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description.trim();
    }

    if (location) {
      if (!location.name || !location.city) {
        throw new AppError("Location name and city are required", 400);
      }
      updates.location = {
        name: location.name.trim(),
        address: location.address?.trim() || game.location.address,
        city: location.city.trim(),
        coordinates: location.coordinates || game.location.coordinates,
      };
    }

    if (date) {
      const gameDate = new Date(date);
      if (isNaN(gameDate.getTime())) {
        throw new AppError("Invalid date format", 400);
      }
      if (gameDate <= new Date()) {
        throw new AppError("Game date must be in the future", 400);
      }
      updates.date = gameDate;
    }

    if (maxPlayers !== undefined) {
      const max = parseInt(maxPlayers);
      if (max < 2 || max > 50) {
        throw new AppError("Max players must be between 2 and 50", 400);
      }
      // Cannot reduce below current player count
      if (max < game.players.length) {
        throw new AppError(
          `Cannot set max players below current player count (${game.players.length})`,
          400,
        );
      }
      updates.maxPlayers = max;
    }

    if (minPlayers !== undefined) {
      const min = parseInt(minPlayers);
      const max = updates.maxPlayers || game.maxPlayers;
      if (min < 1 || min > max) {
        throw new AppError(
          "Min players must be at least 1 and not exceed max",
          400,
        );
      }
      updates.minPlayers = min;
    }

    if (skillLevel) {
      if (!VALID_SKILL_LEVELS.includes(skillLevel)) {
        throw new AppError(
          `Invalid skill level. Must be one of: ${VALID_SKILL_LEVELS.join(", ")}`,
          400,
        );
      }
      updates.skillLevel = skillLevel;
    }

    // Update game
    const result = await db
      .collection("games")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: "after" },
      );

    res.json({
      success: true,
      message: "Game updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/games/:id
 * Cancel a game (host only)
 * Created by: Kashish Rahulbhai Khatri
 */
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid game ID", 400);
    }

    const db = getDb();
    const game = await db.collection("games").findOne({
      _id: new ObjectId(id),
    });

    if (!game) {
      throw new AppError("Game not found", 404);
    }

    // Check if user is the host
    if (game.hostId.toString() !== req.user._id.toString()) {
      throw new AppError("Only the host can cancel this game", 403);
    }

    // Check if game is already cancelled
    if (game.status === "cancelled") {
      throw new AppError("Game is already cancelled", 400);
    }

    // Check if game is completed
    if (game.status === "completed") {
      throw new AppError("Cannot cancel a completed game", 400);
    }

    // Cancel the game (don't delete, keep for history)
    await db.collection("games").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "cancelled",
          updatedAt: new Date(),
        },
      },
    );

    res.json({
      success: true,
      message: "Game cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/games/:id/join
 * Join a game or waitlist
 * Created by: Kashish Rahulbhai Khatri
 */
router.post("/:id/join", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid game ID", 400);
    }

    const db = getDb();
    const game = await db.collection("games").findOne({
      _id: new ObjectId(id),
    });

    if (!game) {
      throw new AppError("Game not found", 404);
    }

    // Check if game is upcoming
    if (game.status !== "upcoming") {
      throw new AppError("Cannot join a completed or cancelled game", 400);
    }

    // Check if game date has passed
    if (new Date(game.date) <= new Date()) {
      throw new AppError("Cannot join a game that has already started", 400);
    }

    // Check if already a player
    if (game.players.some((p) => p.toString() === userId.toString())) {
      throw new AppError("You have already joined this game", 400);
    }

    // Check if already on waitlist
    if (game.waitlist.some((p) => p.toString() === userId.toString())) {
      throw new AppError("You are already on the waitlist", 400);
    }

    // Determine if joining roster or waitlist
    const isFull = game.players.length >= game.maxPlayers;

    if (isFull) {
      // Add to waitlist
      await db.collection("games").updateOne(
        { _id: new ObjectId(id) },
        {
          $push: { waitlist: userId },
          $set: { updatedAt: new Date() },
        },
      );

      const waitlistPosition = game.waitlist.length + 1;

      res.json({
        success: true,
        message: `Added to waitlist (position #${waitlistPosition})`,
        data: {
          status: "waitlisted",
          position: waitlistPosition,
        },
      });
    } else {
      // Add to players
      await db.collection("games").updateOne(
        { _id: new ObjectId(id) },
        {
          $push: { players: userId },
          $set: { updatedAt: new Date() },
        },
      );

      res.json({
        success: true,
        message: "Successfully joined the game",
        data: {
          status: "joined",
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/games/:id/leave
 * Leave a game
 * Created by: Kashish Rahulbhai Khatri
 */
router.post("/:id/leave", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid game ID", 400);
    }

    const db = getDb();
    const game = await db.collection("games").findOne({
      _id: new ObjectId(id),
    });

    if (!game) {
      throw new AppError("Game not found", 404);
    }

    // Check if game is upcoming
    if (game.status !== "upcoming") {
      throw new AppError("Cannot leave a completed or cancelled game", 400);
    }

    const isPlayer = game.players.some(
      (p) => p.toString() === userId.toString(),
    );
    const isWaitlisted = game.waitlist.some(
      (p) => p.toString() === userId.toString(),
    );

    if (!isPlayer && !isWaitlisted) {
      throw new AppError("You are not part of this game", 400);
    }

    if (isWaitlisted) {
      // Remove from waitlist
      await db.collection("games").updateOne(
        { _id: new ObjectId(id) },
        {
          $pull: { waitlist: userId },
          $set: { updatedAt: new Date() },
        },
      );

      res.json({
        success: true,
        message: "Successfully removed from waitlist",
      });
    } else {
      // Remove from players and promote first waitlisted
      const updateOps = {
        $pull: { players: userId },
        $set: { updatedAt: new Date() },
      };

      await db
        .collection("games")
        .updateOne({ _id: new ObjectId(id) }, updateOps);

      // If there's a waitlist, promote the first person
      if (game.waitlist.length > 0) {
        const promotedUser = game.waitlist[0];
        await db.collection("games").updateOne(
          { _id: new ObjectId(id) },
          {
            $push: { players: promotedUser },
            $pull: { waitlist: promotedUser },
            $set: { updatedAt: new Date() },
          },
        );
      }

      res.json({
        success: true,
        message: "Successfully left the game",
        data: {
          promotedFromWaitlist: game.waitlist.length > 0,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/games/:id/complete
 * Mark a game as completed (host only)
 * Created by: Kashish Rahulbhai Khatri
 */
router.put("/:id/complete", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid game ID", 400);
    }

    const db = getDb();
    const game = await db.collection("games").findOne({
      _id: new ObjectId(id),
    });

    if (!game) {
      throw new AppError("Game not found", 404);
    }

    // Check if user is the host
    if (game.hostId.toString() !== req.user._id.toString()) {
      throw new AppError("Only the host can complete this game", 403);
    }

    // Check if game is upcoming
    if (game.status !== "upcoming") {
      throw new AppError("Game is already completed or cancelled", 400);
    }

    // Update status to completed
    await db.collection("games").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "completed",
          updatedAt: new Date(),
        },
      },
    );

    res.json({
      success: true,
      message: "Game marked as completed. Players can now rate each other!",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/games/:id/roster
 * Get game roster and waitlist
 * Created by: Kashish Rahulbhai Khatri
 */
router.get("/:id/roster", optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid game ID", 400);
    }

    const db = getDb();
    const game = await db.collection("games").findOne({
      _id: new ObjectId(id),
    });

    if (!game) {
      throw new AppError("Game not found", 404);
    }

    // Get player and waitlist details
    const players = await getPlayerDetails(db, game.players);
    const waitlist = await getPlayerDetails(db, game.waitlist);

    // Get host details
    const host = await db
      .collection("users")
      .findOne({ _id: game.hostId }, { projection: { password: 0 } });

    res.json({
      success: true,
      data: {
        gameId: game._id,
        host,
        players,
        waitlist: waitlist.map((user, index) => ({
          ...user,
          position: index + 1,
        })),
        playerCount: players.length,
        waitlistCount: waitlist.length,
        maxPlayers: game.maxPlayers,
        spotsAvailable: game.maxPlayers - players.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
