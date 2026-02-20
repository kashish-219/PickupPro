/**
 * =========================================
 * DATABASE SEED SCRIPT
 * =========================================
 * Generates 1000+ games and sample users/ratings
 * Run with: npm run seed
 * Created by: Kashish Rahulbhai Khatri
 * =========================================
 */

import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// =========================================
// CONFIGURATION DATA
// =========================================

const SPORTS = [
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

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

// Boston area locations (majority)
const BOSTON_LOCATIONS = [
  {
    name: "Cabot Physical Education Center",
    address: "219 Cabot St",
    city: "Boston",
    lat: 42.3396,
    lng: -71.0897,
  },
  {
    name: "Marino Recreation Center",
    address: "259 Huntington Ave",
    city: "Boston",
    lat: 42.3406,
    lng: -71.0894,
  },
  {
    name: "Boston Common",
    address: "139 Tremont St",
    city: "Boston",
    lat: 42.3551,
    lng: -71.0657,
  },
  {
    name: "Magazine Beach",
    address: "719 Memorial Dr",
    city: "Cambridge",
    lat: 42.3571,
    lng: -71.1122,
  },
  {
    name: "MIT Athletic Fields",
    address: "120 Vassar St",
    city: "Cambridge",
    lat: 42.3601,
    lng: -71.0942,
  },
  {
    name: "Harvard Athletic Complex",
    address: "65 N Harvard St",
    city: "Boston",
    lat: 42.3668,
    lng: -71.1247,
  },
  {
    name: "Charles River Esplanade",
    address: "Storrow Dr",
    city: "Boston",
    lat: 42.3544,
    lng: -71.0737,
  },
  {
    name: "Fens Park",
    address: "Park Dr",
    city: "Boston",
    lat: 42.3429,
    lng: -71.0969,
  },
  {
    name: "Jamaica Pond",
    address: "507 Jamaicaway",
    city: "Boston",
    lat: 42.3169,
    lng: -71.1216,
  },
  {
    name: "Franklin Park",
    address: "1 Franklin Park Rd",
    city: "Boston",
    lat: 42.3053,
    lng: -71.0927,
  },
  {
    name: "Somerville Recreation Center",
    address: "19 Walnut St",
    city: "Somerville",
    lat: 42.3876,
    lng: -71.0995,
  },
  {
    name: "Brookline High School Courts",
    address: "115 Greenough St",
    city: "Brookline",
    lat: 42.3418,
    lng: -71.1234,
  },
  {
    name: "Burlington Recreation",
    address: "61 Center St",
    city: "Burlington",
    lat: 42.5048,
    lng: -71.1956,
  },
  {
    name: "Medford Community Center",
    address: "111 High St",
    city: "Medford",
    lat: 42.4184,
    lng: -71.1062,
  },
  {
    name: "Malden YMCA",
    address: "99 Dartmouth St",
    city: "Malden",
    lat: 42.4251,
    lng: -71.0662,
  },
];

// Other US city locations (minority)
const OTHER_LOCATIONS = [
  // San Francisco
  {
    name: "Golden Gate Park",
    address: "501 Stanyan St",
    city: "San Francisco",
    lat: 37.7694,
    lng: -122.4862,
  },
  {
    name: "Dolores Park",
    address: "19th & Dolores St",
    city: "San Francisco",
    lat: 37.7596,
    lng: -122.4269,
  },
  // New York
  {
    name: "Central Park Great Lawn",
    address: "79th St Transverse",
    city: "New York",
    lat: 40.7812,
    lng: -73.9665,
  },
  {
    name: "Brooklyn Bridge Park",
    address: "334 Furman St",
    city: "Brooklyn",
    lat: 40.7024,
    lng: -73.9969,
  },
  {
    name: "Prospect Park",
    address: "95 Prospect Park West",
    city: "Brooklyn",
    lat: 40.6602,
    lng: -73.969,
  },
];

const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Jamie",
  "Avery",
  "Quinn",
  "Reese",
  "Mohit",
  "Priya",
  "Raj",
  "Ananya",
  "Vikram",
  "Neha",
  "Arjun",
  "Divya",
  "Rahul",
  "Kavya",
  "Joy",
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Sophia",
  "Marcus",
  "Isabella",
  "Lucas",
  "Mia",
  "Wei",
  "Chen",
  "Yuki",
  "Hiro",
  "Min",
  "Soo",
  "Ahmed",
  "Fatima",
  "Omar",
  "Layla",
];

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Patel",
  "Shah",
  "Kumar",
  "Singh",
  "Sharma",
  "Gupta",
  "Khatri",
  "Dudeja",
  "Chen",
  "Wang",
  "Li",
  "Zhang",
  "Liu",
  "Kim",
  "Lee",
  "Park",
  "Tanaka",
  "Sato",
  "Yamamoto",
  "Anderson",
];

const GAME_TITLE_TEMPLATES = {
  Basketball: [
    "Sunday Hoops",
    "5v5 Full Court",
    "Pickup Basketball",
    "Morning Ball",
    "Evening Runs",
    "Open Gym Session",
    "3v3 Tournament",
  ],
  Soccer: [
    "Weekly Soccer",
    "Sunday League",
    "Pickup Football",
    "Evening Kickabout",
    "6v6 Small Sided",
    "Casual Scrimmage",
  ],
  Tennis: [
    "Tennis Doubles",
    "Singles Practice",
    "Morning Tennis",
    "Evening Rally",
    "Mixed Doubles",
    "Tennis Clinic",
  ],
  Volleyball: [
    "Beach Volleyball",
    "Indoor Volleyball",
    "6v6 Volleyball",
    "Pickup Volleyball",
    "Casual Bump Set Spike",
  ],
  Baseball: [
    "Softball Game",
    "Baseball Practice",
    "Pickup Baseball",
    "Batting Practice",
    "Sunday Baseball",
  ],
  Cricket: [
    "Weekend Cricket",
    "T20 Match",
    "Cricket Practice",
    "Gully Cricket",
    "Net Session",
  ],
  Badminton: [
    "Badminton Doubles",
    "Singles Smash",
    "Evening Badminton",
    "Casual Rally",
    "Badminton Clinic",
  ],
  Other: ["Pickup Game", "Casual Meetup", "Open Play", "Friendly Match"],
  Running: [
    "Morning Run Club",
    "5K Training",
    "Evening Jog",
    "Trail Run",
    "Marathon Training",
    "Casual Run",
  ],
};

const GAME_DESCRIPTIONS = [
  "All skill levels welcome! Come have fun and get some exercise.",
  "Looking for competitive players. Bring your A-game!",
  "Casual game, just here to have fun. No pressure.",
  "Regular weekly game. New players always welcome.",
  "Bring water and appropriate gear. See you there!",
  "Great group of regulars. Friendly competition.",
  "Perfect for beginners looking to improve.",
  "Intermediate level preferred but all welcome.",
  "We play rain or shine. Check weather beforehand.",
  "Post-game hangout at the nearby cafe. Join us!",
  "",
  "",
  "",
];

const RATING_COMMENTS = [
  "Great player! Always shows up on time.",
  "Excellent sportsmanship.",
  "Really fun to play with.",
  "Skilled player, very competitive.",
  "Super friendly and welcoming to newcomers.",
  "Great attitude, win or lose.",
  "Always brings positive energy.",
  "Reliable and consistent.",
  "Good communicator on the field.",
  "Helped organize the game well.",
  "A bit too competitive but overall fine.",
  "Solid player, would play again.",
  "Very encouraging to less experienced players.",
  "Fair player, calls fouls honestly.",
  "Great hustle and effort.",
  "",
  "",
  "",
  "",
];

// =========================================
// HELPER FUNCTIONS
// =========================================

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startDate, endDate) {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
}

function generateEmail(firstName, lastName) {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "northeastern.edu"];
  const num = randomInt(1, 999);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${num}@${randomElement(domains)}`;
}

// =========================================
// DATA GENERATORS
// =========================================

async function generateUsers(count) {
  const users = [];
  const password = await bcrypt.hash("password123", 10);

  for (let i = 0; i < count; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const numSports = randomInt(1, 4);
    const userSports = [];
    const skillLevels = {};

    for (let j = 0; j < numSports; j++) {
      const sport = randomElement(SPORTS);
      if (!userSports.includes(sport)) {
        userSports.push(sport);
        skillLevels[sport] = randomElement(
          SKILL_LEVELS.filter((s) => s !== "All Levels"),
        );
      }
    }

    users.push({
      _id: new ObjectId(),
      email: generateEmail(firstName, lastName),
      password: password,
      name: `${firstName} ${lastName}`,
      bio:
        randomInt(0, 1) === 1
          ? `Love playing ${userSports[0].toLowerCase()}! Looking for regular games.`
          : "",
      sports: userSports,
      skillLevels: skillLevels,
      avatarUrl: "",
      createdAt: randomDate(new Date("2024-01-01"), new Date("2025-01-01")),
      updatedAt: new Date(),
    });
  }

  return users;
}

function generateGames(users, count) {
  const games = [];
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const threeMonthsFromNow = new Date(now);
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  for (let i = 0; i < count; i++) {
    const host = randomElement(users);
    const sport = randomElement(SPORTS);
    const titles = GAME_TITLE_TEMPLATES[sport];
    const title = randomElement(titles);

    // 70% Boston, 30% other locations
    const location =
      Math.random() < 0.7
        ? randomElement(BOSTON_LOCATIONS)
        : randomElement(OTHER_LOCATIONS);

    const maxPlayers = sport === "Tennis" ? 4 : randomInt(6, 16);
    const minPlayers = Math.max(2, Math.floor(maxPlayers / 2));

    // Generate game date
    const gameDate = randomDate(oneYearAgo, threeMonthsFromNow);

    // Set game time (between 6am and 9pm)
    gameDate.setHours(randomInt(6, 21), randomInt(0, 1) * 30, 0, 0);

    // Determine status based on date
    let status = "upcoming";
    if (gameDate < now) {
      status = Math.random() < 0.9 ? "completed" : "cancelled";
    }

    // Generate players for the game
    const numPlayers =
      status === "cancelled"
        ? randomInt(0, minPlayers - 1)
        : randomInt(minPlayers, maxPlayers);
    const availableUsers = users.filter(
      (u) => u._id.toString() !== host._id.toString(),
    );
    const players = [];
    const waitlist = [];

    for (let j = 0; j < numPlayers && j < availableUsers.length; j++) {
      const player = availableUsers[j];
      if (!players.some((p) => p.toString() === player._id.toString())) {
        players.push(player._id);
      }
    }

    // Add waitlist for some games
    if (players.length >= maxPlayers && Math.random() < 0.3) {
      const waitlistCount = randomInt(1, 5);
      for (let k = 0; k < waitlistCount; k++) {
        const idx = numPlayers + k;
        if (idx < availableUsers.length) {
          waitlist.push(availableUsers[idx]._id);
        }
      }
    }

    games.push({
      _id: new ObjectId(),
      hostId: host._id,
      sport: sport,
      title: title,
      description: randomElement(GAME_DESCRIPTIONS),
      location: {
        name: location.name,
        address: location.address,
        city: location.city,
        coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
      },
      date: gameDate,
      maxPlayers: maxPlayers,
      minPlayers: minPlayers,
      players: players,
      waitlist: waitlist,
      status: status,
      skillLevel: randomElement(SKILL_LEVELS),
      createdAt: new Date(
        gameDate.getTime() - randomInt(1, 30) * 24 * 60 * 60 * 1000,
      ),
      updatedAt: new Date(),
    });
  }

  return games;
}

function generateRatings(users, games) {
  const ratings = [];
  const completedGames = games.filter((g) => g.status === "completed");

  for (const game of completedGames) {
    const allPlayers = [game.hostId, ...game.players];

    // Each player rates some other players
    for (const fromUserId of allPlayers) {
      const otherPlayers = allPlayers.filter(
        (p) => p.toString() !== fromUserId.toString(),
      );

      // Rate 50-100% of other players
      const numToRate = Math.max(
        1,
        Math.floor(otherPlayers.length * (0.5 + Math.random() * 0.5)),
      );

      for (let i = 0; i < numToRate && i < otherPlayers.length; i++) {
        const toUserId = otherPlayers[i];

        // Skip if already rated
        if (
          ratings.some(
            (r) =>
              r.fromUserId.toString() === fromUserId.toString() &&
              r.toUserId.toString() === toUserId.toString() &&
              r.gameId.toString() === game._id.toString(),
          )
        ) {
          continue;
        }

        // Generate rating (weighted towards positive)
        const score = Math.random() < 0.7 ? randomInt(4, 5) : randomInt(2, 3);

        ratings.push({
          _id: new ObjectId(),
          gameId: game._id,
          fromUserId: fromUserId,
          toUserId: toUserId,
          score: score,
          comment: Math.random() < 0.6 ? randomElement(RATING_COMMENTS) : "",
          createdAt: new Date(
            game.date.getTime() + randomInt(1, 48) * 60 * 60 * 1000,
          ),
        });
      }
    }
  }

  return ratings;
}

// =========================================
// MAIN SEED FUNCTION
// =========================================

async function seed() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI environment variable is not set");
    console.log("Please create a .env file with MONGODB_URI");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const dbName = new URL(uri).pathname.slice(1) || "pickuppro";
    const db = client.db(dbName);

    // Clear existing data
    console.log("Clearing existing data...");
    await db.collection("users").deleteMany({});
    await db.collection("games").deleteMany({});
    await db.collection("ratings").deleteMany({});

    // Generate data
    console.log("Generating users...");
    const users = await generateUsers(100);

    console.log("Generating 1000+ games...");
    const games = generateGames(users, 1100);

    console.log("Generating ratings...");
    const ratings = generateRatings(users, games);

    // Insert data
    console.log("Inserting users...");
    await db.collection("users").insertMany(users);

    console.log("Inserting games...");
    await db.collection("games").insertMany(games);

    console.log("Inserting ratings...");
    if (ratings.length > 0) {
      await db.collection("ratings").insertMany(ratings);
    }

    // Create demo user
    console.log("Creating demo user...");
    const demoPassword = await bcrypt.hash("demo123", 10);
    await db.collection("users").insertOne({
      _id: new ObjectId(),
      email: "demo@pickuppro.com",
      password: demoPassword,
      name: "Demo User",
      bio: "This is a demo account. Feel free to explore!",
      sports: ["Basketball", "Soccer", "Tennis"],
      skillLevels: {
        Basketball: "Intermediate",
        Soccer: "Beginner",
        Tennis: "Advanced",
      },
      avatarUrl: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Summary
    console.log("\nSeed completed successfully!");
    console.log("=====================================");
    console.log(`Users created: ${users.length + 1}`);
    console.log(`Games created: ${games.length}`);
    console.log(`Ratings created: ${ratings.length}`);
    console.log("=====================================");
    console.log("\nDemo account:");
    console.log("   Email: demo@pickuppro.com");
    console.log("   Password: demo123");
    console.log("=====================================\n");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
}

seed();