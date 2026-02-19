# PickupPro - Design Document

## Table of Contents
1. [Project Description](#project-description)
2. [User Personas](#user-personas)
3. [User Stories](#user-stories)
4. [System Architecture](#system-architecture)
5. [Database Design](#database-design)
6. [API Endpoints](#api-endpoints)
7. [Design Mockups](#design-mockups)

---

## Project Description

**PickupPro** is a community-driven platform that connects local athletes looking to play casual pickup sports games without the hassle of group chat coordination. 

### Problem Statement
Finding pickup games is frustrating. Group chats become cluttered, confirmations get lost, and there's no accountability for no-shows or poor sportsmanship. People new to a city have no easy way to discover local games or build a network of reliable playing partners.

### Solution
PickupPro provides a centralized platform where:
- **Players can create games** by specifying sport type, location, date, time, and player limits
- **Others browse and join** with a single click
- **Automatic roster management** handles player caps and waitlists
- **Reputation system** allows post-game ratings, fostering accountability
- **Player discovery** helps users find reliable playing partners

### Supported Sports
- 🏀 Basketball
- ⚽ Soccer/Football
- 🎾 Tennis
- 🏐 Volleyball
- ⚾ Baseball
- 🏏 Cricket
- 🏸 Badminton
- 🏃 Running/Jogging

### Key Features
1. **Game Management** - Create, edit, cancel, and complete games
2. **Smart Joining** - Join games or auto-waitlist when full
3. **Reputation System** - Rate players on sportsmanship after games
4. **Player Profiles** - Showcase sports interests, skill levels, and ratings
5. **Player Discovery** - Search and find players in the community

---

## User Personas

### Persona 1: Newcomer Athlete ("Mohit")

```
┌─────────────────────────────────────────────────────────────────┐
│  👤 MOHIT SHARMA                                                │
│  Age: 26 | Software Engineer | Boston, MA                       │
├─────────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                     │
│  • Recently moved to Boston for work at a tech startup          │
│  • Played basketball and cricket throughout college in India    │
│  • Doesn't know anyone in the city who plays sports             │
│  • Lives in Burlington, works remotely most days                │
├─────────────────────────────────────────────────────────────────┤
│  GOALS                                                          │
│  • Find pickup basketball games near Northeastern campus        │
│  • Meet people with similar interests                           │
│  • Stay active and maintain work-life balance                   │
├─────────────────────────────────────────────────────────────────┤
│  FRUSTRATIONS                                                   │
│  • Doesn't know local parks or courts                           │
│  • Facebook groups are cluttered and hard to navigate           │
│  • Nervous about showing up to games alone                      │
├─────────────────────────────────────────────────────────────────┤
│  TECH COMFORT                                                   │
│  ████████████░░░ Advanced                                       │
│  Uses apps daily, comfortable with new platforms                │
└─────────────────────────────────────────────────────────────────┘
```

**Quote:** *"I just want to find a game, know it's actually happening, and show up without awkwardness."*

---

### Persona 2: Pickup Game Organizer ("Joy")

```
┌─────────────────────────────────────────────────────────────────┐
│  👤 JOY CHEN                                                    │
│  Age: 32 | Marketing Manager | Cambridge, MA                    │
├─────────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                     │
│  • Organizes weekly Sunday soccer games for 3 years             │
│  • Uses WhatsApp group with 45 members                          │
│  • Spends hours every week chasing confirmations                │
│  • Games often have too many or too few players                 │
├─────────────────────────────────────────────────────────────────┤
│  GOALS                                                          │
│  • Stop being the "group chat admin"                            │
│  • Let players self-organize and confirm attendance             │
│  • Maintain consistent player count for balanced games          │
├─────────────────────────────────────────────────────────────────┤
│  FRUSTRATIONS                                                   │
│  • "Who's in?" messages get buried in chat                      │
│  • People say "maybe" and don't show up                         │
│  • No easy way to track who confirmed vs who showed up          │
├─────────────────────────────────────────────────────────────────┤
│  TECH COMFORT                                                   │
│  ██████████░░░░░ Intermediate                                   │
│  Comfortable with common apps, values simplicity                │
└─────────────────────────────────────────────────────────────────┘
```

**Quote:** *"I love playing, but organizing has become a part-time job. I need something that handles the logistics."*

---

### Persona 3: Cautious Player ("Emma")

```
┌─────────────────────────────────────────────────────────────────┐
│  👤 EMMA RODRIGUEZ                                              │
│  Age: 28 | Graduate Student | Somerville, MA                    │
├─────────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                     │
│  • Plays recreational tennis and volleyball                     │
│  • Had bad experiences with overly competitive players          │
│  • Once showed up to a "casual" game that was way too intense   │
│  • Values inclusive, friendly environments                      │
├─────────────────────────────────────────────────────────────────┤
│  GOALS                                                          │
│  • Find games with the right skill level and vibe               │
│  • Know who she's playing with before committing                │
│  • Avoid aggressive or unreliable players                       │
├─────────────────────────────────────────────────────────────────┤
│  FRUSTRATIONS                                                   │
│  • No way to know if players are reliable or friendly           │
│  • "Casual" means different things to different people          │
│  • Feels unsafe showing up to random games alone                │
├─────────────────────────────────────────────────────────────────┤
│  TECH COMFORT                                                   │
│  ████████░░░░░░░ Moderate                                       │
│  Uses apps but prefers intuitive interfaces                     │
└─────────────────────────────────────────────────────────────────┘
```

**Quote:** *"I want to play sports, not deal with drama. Knowing someone has good ratings would make me way more likely to join."*

---

## User Stories

### Games Management (Kashish Rahulbhai Khatri)

#### Story 1: Create a Pickup Game
**As a** player  
**I want to** create a pickup game with sport, location, date, time, and max players  
**So that** others can find and join it

**Acceptance Criteria:**
- User can select from 8 supported sports
- User can enter location with address details
- User can set date and time (must be in future)
- User can set minimum and maximum player limits
- User can add optional description and skill level
- Game appears in browse list immediately after creation

**Example Scenario:**
> Mohit wants to organize a basketball game at Cabot Physical Education Center on Saturday at 2pm. He creates a game, sets max players to 10, marks it as "Intermediate" skill level, and adds "Bring both light and dark shirts for teams!"

---

#### Story 2: Browse and Filter Games
**As a** player  
**I want to** browse and filter games by sport, date, and location  
**So that** I can find games that fit my schedule

**Acceptance Criteria:**
- User can view all upcoming games in a list/card view
- User can filter by sport type (multi-select)
- User can filter by date range
- User can search by location keyword
- Results update in real-time as filters change
- Games show key info: sport, date, time, location, spots available

**Example Scenario:**
> Emma wants to find a tennis game this weekend in Cambridge. She filters by "Tennis" and "This Weekend" and sees three games with open spots.

---

#### Story 3: Join a Game or Waitlist
**As a** player  
**I want to** join a game or be added to waitlist if full  
**So that** I can secure my spot

**Acceptance Criteria:**
- "Join Game" button visible for games with open spots
- "Join Waitlist" button visible for full games
- User cannot join their own games
- User cannot join games in the past
- User receives confirmation of join/waitlist status
- Waitlist position shown to waitlisted users

**Example Scenario:**
> Mohit finds Joy's Sunday soccer game. It shows 12/12 players, so he clicks "Join Waitlist" and sees he's #2 on the waitlist.

---

#### Story 4: Leave a Game
**As a** player  
**I want to** leave a game I previously joined  
**So that** my spot opens for others

**Acceptance Criteria:**
- "Leave Game" button visible on games user has joined
- Leaving moves first waitlisted player to roster automatically
- User receives confirmation of leaving
- Cannot leave games that have already completed

**Example Scenario:**
> Emma realizes she has a conflict and needs to leave Sunday's volleyball game. She clicks "Leave" and the system notifies the first waitlisted player that they're now on the roster.

---

#### Story 5: Manage Game as Host
**As a** host  
**I want to** edit, cancel, or mark a game as completed  
**So that** I can manage the game lifecycle

**Acceptance Criteria:**
- Host can edit game details before game starts
- Host can cancel game (with optional reason)
- Host can mark game as "Completed" after it ends
- Completed status enables rating functionality
- Cancelled games show as cancelled, not deleted

**Example Scenario:**
> Joy's Sunday soccer game finishes. She marks it as "Completed" so players can now rate each other's sportsmanship.

---

#### Story 6: View and Manage Roster
**As a** host  
**I want to** view and manage the roster of players who joined my game  
**So that** I can see who's participating

**Acceptance Criteria:**
- Host sees list of all confirmed players
- Host sees waitlist with position numbers
- Host can remove players if needed
- Roster shows player names and ratings
- Player count updates in real-time

**Example Scenario:**
> Joy checks her game roster and sees 12 confirmed players with an average rating of 4.2 stars, plus 3 people on the waitlist.

---

### User Profiles & Reputation (Abhimanyu Dudeja)

#### Story 7: Create and Edit Profile
**As a** new user  
**I want to** create and edit my profile with sports interests and skill levels  
**So that** others know who I am

**Acceptance Criteria:**
- User can set display name and bio
- User can select favorite sports (multi-select)
- User can set skill level per sport (Beginner/Intermediate/Advanced)
- User can add optional profile photo URL
- Profile changes save immediately

**Example Scenario:**
> Mohit creates his profile, selects Basketball (Advanced) and Cricket (Intermediate), and adds a bio: "Software engineer who misses his college basketball days!"

---

#### Story 8: Rate Another Player
**As a** player  
**I want to** rate another player's sportsmanship after a completed game  
**So that** the community knows who's reliable

**Acceptance Criteria:**
- Can only rate players from games both participated in
- Can only rate after game is marked complete
- Rating is 1-5 stars for sportsmanship
- Optional written comment (max 500 chars)
- Each player can only rate another player once per game

**Example Scenario:**
> After Sunday's soccer game, Joy rates Mohit 5 stars with comment: "Great attitude, showed up on time, and played fair!"

---

#### Story 9: View Own Profile
**As a** player  
**I want to** view my own profile with average rating and rating history  
**So that** I understand my reputation

**Acceptance Criteria:**
- Profile shows average rating (1-5 stars)
- Profile shows total number of ratings received
- Profile shows recent ratings with comments
- Profile shows list of sports and skill levels
- Profile shows games hosted count

**Example Scenario:**
> Mohit checks his profile and sees he has a 4.7 average rating from 12 ratings, with his most recent being "Always brings positive energy!"

---

#### Story 10: View Another Player's Profile
**As a** player  
**I want to** view another player's profile with their average rating, recent ratings, and game history  
**So that** I can decide whether to join their game

**Acceptance Criteria:**
- Can view any public player profile
- Shows average rating and breakdown
- Shows recent ratings (last 10)
- Shows games hosted and participated
- Shows sports interests and skill levels

**Example Scenario:**
> Emma is considering joining Joy's soccer game. She clicks Joy's name and sees she has a 4.8 rating with 50+ reviews praising her organization skills.

---

#### Story 11: View Past Games and Ratings
**As a** player  
**I want to** see a list of my past games and ratings I've received  
**So that** I can track my activity

**Acceptance Criteria:**
- Shows list of all games participated in
- Shows list of all games hosted
- Separated by completed/upcoming/cancelled
- Shows ratings received for each completed game
- Can filter by sport type

**Example Scenario:**
> Mohit views his history and sees he's played 8 games in the past month: 5 basketball and 3 soccer, with ratings for each.

---

#### Story 12: Search and Discover Players
**As a** player  
**I want to** search for and discover other players in the community  
**So that** I can find regular playing partners

**Acceptance Criteria:**
- Can search players by name
- Can filter by sport interest
- Can filter by minimum rating
- Results show name, rating, and sports
- Can click through to full profile

**Example Scenario:**
> Emma searches for tennis players with 4+ rating and finds 15 players in the Boston area she might want to play with.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                               │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    Vanilla JavaScript SPA                        │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│   │  │  Games   │  │  Users   │  │ Profiles │  │  Auth    │        │   │
│   │  │  Module  │  │  Module  │  │  Module  │  │  Module  │        │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│   │                                                                  │   │
│   │  Client-Side Rendering │ Fetch API │ ES Modules                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTP/REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              SERVER LAYER                               │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     Node.js + Express                            │   │
│   │                                                                  │   │
│   │  ┌──────────────────┐  ┌──────────────────┐                     │   │
│   │  │   Routes         │  │   Middleware     │                     │   │
│   │  │  • /api/games    │  │  • JWT Auth      │                     │   │
│   │  │  • /api/users    │  │  • Error Handler │                     │   │
│   │  │  • /api/ratings  │  │  • CORS          │                     │   │
│   │  │  • /api/auth     │  │  • Static Files  │                     │   │
│   │  └──────────────────┘  └──────────────────┘                     │   │
│   │                                                                  │   │
│   │  ES Modules │ No Mongoose │ Native MongoDB Driver               │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ MongoDB Protocol
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                 │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      MongoDB Database                            │   │
│   │                                                                  │   │
│   │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │   │
│   │  │     users      │  │     games      │  │    ratings     │     │   │
│   │  │  Collection    │  │  Collection    │  │  Collection    │     │   │
│   │  │                │  │  (1000+ docs)  │  │                │     │   │
│   │  └────────────────┘  └────────────────┘  └────────────────┘     │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | Vanilla JS + HTML5 + CSS3 | Per requirements, no frameworks |
| Backend | Node.js + Express | Required by rubric |
| Database | MongoDB (Native Driver) | Required, no Mongoose allowed |
| Auth | JWT Tokens | Stateless, scalable |
| Deployment | Docker + Render | Containerized, easy deployment |

---

## Database Design

### Collections Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MongoDB Collections                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐ │
│  │     USERS       │      │     GAMES       │      │    RATINGS      │ │
│  │─────────────────│      │─────────────────│      │─────────────────│ │
│  │ _id             │◄────┐│ _id             │◄────┐│ _id             │ │
│  │ email           │     ││ hostId ─────────┼─────┤│ gameId ─────────┼─┘
│  │ password (hash) │     ││ sport           │     ││ fromUserId ─────┼─┐
│  │ name            │     ││ title           │     ││ toUserId ───────┼─┤
│  │ bio             │     ││ description     │     ││ score (1-5)     │ │
│  │ sports[]        │     ││ location        │     ││ comment         │ │
│  │ skillLevels{}   │     ││ date            │     ││ createdAt       │ │
│  │ avatarUrl       │     ││ maxPlayers      │     │└─────────────────┘ │
│  │ createdAt       │     ││ minPlayers      │     │                    │
│  └─────────────────┘     ││ players[] ──────┼─────┘                    │
│          ▲               ││ waitlist[]      │                          │
│          │               ││ status          │                          │
│          └───────────────┼│ skillLevel      │                          │
│                          ││ createdAt       │                          │
│                          │└─────────────────┘                          │
│                          │       │                                     │
│                          │       │ 1000+ records                       │
│                          │       │ (seed data)                         │
│                          │       ▼                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Users Collection Schema

```javascript
{
  _id: ObjectId,
  email: String,           // Unique, required
  password: String,        // Hashed with bcrypt
  name: String,            // Display name
  bio: String,             // Optional, max 500 chars
  sports: [String],        // Array of sport interests
  skillLevels: {           // Skill per sport
    "Basketball": "Advanced",
    "Tennis": "Beginner"
  },
  avatarUrl: String,       // Optional profile image
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`: Unique index
- `name`: Text index for search
- `sports`: Regular index for filtering

---

### Games Collection Schema

```javascript
{
  _id: ObjectId,
  hostId: ObjectId,        // Reference to users
  sport: String,           // One of 8 supported sports
  title: String,           // Game title
  description: String,     // Optional details
  location: {
    name: String,          // "Cabot Physical Education Center"
    address: String,       // "219 Cabot St, Boston, MA"
    city: String,          // "Boston"
    coordinates: {         // Optional for future map integration
      lat: Number,
      lng: Number
    }
  },
  date: Date,              // Game date and time
  maxPlayers: Number,      // Player cap
  minPlayers: Number,      // Minimum to play
  players: [ObjectId],     // Array of user IDs
  waitlist: [ObjectId],    // Ordered waitlist
  status: String,          // "upcoming" | "completed" | "cancelled"
  skillLevel: String,      // "Beginner" | "Intermediate" | "Advanced" | "All Levels"
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `hostId`: Regular index
- `sport`: Regular index
- `date`: Regular index
- `status`: Regular index
- `location.city`: Text index

---

### Ratings Collection Schema

```javascript
{
  _id: ObjectId,
  gameId: ObjectId,        // Reference to games
  fromUserId: ObjectId,    // Who gave the rating
  toUserId: ObjectId,      // Who received the rating
  score: Number,           // 1-5 stars
  comment: String,         // Optional, max 500 chars
  createdAt: Date
}
```

**Indexes:**
- `gameId`: Regular index
- `toUserId`: Regular index for profile lookups
- `fromUserId, toUserId, gameId`: Compound unique index (one rating per pair per game)

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, receive JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Games Endpoints (Kashish Rahulbhai Khatri)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | List all games (with filters) |
| GET | `/api/games/:id` | Get single game details |
| POST | `/api/games` | Create new game (protected) |
| PUT | `/api/games/:id` | Update game (host only) |
| DELETE | `/api/games/:id` | Cancel game (host only) |
| POST | `/api/games/:id/join` | Join game or waitlist (protected) |
| POST | `/api/games/:id/leave` | Leave game (protected) |
| PUT | `/api/games/:id/complete` | Mark as completed (host only) |
| GET | `/api/games/:id/roster` | Get roster and waitlist |

### Users Endpoints (Abhimanyu Dudeja)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Search/list users |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/:id` | Update own profile (protected) |
| GET | `/api/users/:id/games` | Get user's game history |
| GET | `/api/users/:id/ratings` | Get ratings received |

### Ratings Endpoints (Abhimanyu Dudeja)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ratings` | Rate a player (protected) |
| GET | `/api/ratings/game/:gameId` | Get all ratings for a game |
| GET | `/api/ratings/pending` | Get games where user can rate (protected) |

---

## Design Mockups

### Homepage / Games Browse

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏀 PickupPro                              [Browse] [My Games] [Login]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ╔═══════════════════════════════════════════════════════════════╗     │
│   ║                                                               ║     │
│   ║         Find Your Next Game.  Play Your Best.                 ║     │
│   ║                                                               ║     │
│   ║   [🏀] [⚽] [🎾] [🏐] [⚾] [🏏] [🏸] [🏃]                      ║     │
│   ║                                                               ║     │
│   ╚═══════════════════════════════════════════════════════════════╝     │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ FILTERS                                                         │   │
│   │ Sport: [All ▼]  Date: [Any ▼]  Location: [________]  [Search]   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────┐  ┌─────────────────────────────┐     │
│   │ 🏀 Sunday Basketball        │  │ ⚽ Weekly Soccer Pickup     │     │
│   │ ─────────────────────────── │  │ ─────────────────────────── │     │
│   │ 📍 Cabot Center, Boston     │  │ 📍 Magazine Beach, Cambridge│     │
│   │ 📅 Feb 16, 2025 @ 2:00 PM   │  │ 📅 Feb 17, 2025 @ 10:00 AM  │     │
│   │ 👥 8/10 spots               │  │ 👥 FULL (3 waitlist)        │     │
│   │ ⭐ Host: Joy (4.8)          │  │ ⭐ Host: Marcus (4.5)       │     │
│   │                             │  │                             │     │
│   │        [View Details]       │  │    [Join Waitlist]          │     │
│   └─────────────────────────────┘  └─────────────────────────────┘     │
│                                                                         │
│   ┌─────────────────────────────┐  ┌─────────────────────────────┐     │
│   │ 🎾 Tennis Doubles           │  │ 🏃 Morning Run Club         │     │
│   │ ─────────────────────────── │  │ ─────────────────────────── │     │
│   │ 📍 MIT Tennis Courts        │  │ 📍 Charles River Esplanade  │     │
│   │ 📅 Feb 18, 2025 @ 6:00 PM   │  │ 📅 Feb 19, 2025 @ 6:30 AM   │     │
│   │ 👥 2/4 spots                │  │ 👥 5/15 spots               │     │
│   │ ⭐ Host: Emma (4.9)         │  │ ⭐ Host: Alex (4.7)         │     │
│   │                             │  │                             │     │
│   │        [Join Game]          │  │        [Join Game]          │     │
│   └─────────────────────────────┘  └─────────────────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Create Game Form

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏀 PickupPro                    [Browse] [My Games] [Profile] [Logout] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      CREATE A NEW GAME                          │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                 │   │
│   │  Sport *                                                        │   │
│   │  ┌──────────────────────────────────────────────────────────┐   │   │
│   │  │ [🏀] [⚽] [🎾] [🏐] [⚾] [🏏] [🏸] [🏃]                 │   │   │
│   │  └──────────────────────────────────────────────────────────┘   │   │
│   │                                                                 │   │
│   │  Game Title *                                                   │   │
│   │  ┌──────────────────────────────────────────────────────────┐   │   │
│   │  │ Sunday Basketball Run                                     │   │   │
│   │  └──────────────────────────────────────────────────────────┘   │   │
│   │                                                                 │   │
│   │  Location *                                                     │   │
│   │  ┌──────────────────────────────────────────────────────────┐   │   │
│   │  │ Cabot Physical Education Center                           │   │   │
│   │  └──────────────────────────────────────────────────────────┘   │   │
│   │  ┌──────────────────────────────────────────────────────────┐   │   │
│   │  │ 219 Cabot St, Boston, MA 02120                            │   │   │
│   │  └──────────────────────────────────────────────────────────┘   │   │
│   │                                                                 │   │
│   │  Date & Time *                                                  │   │
│   │  ┌─────────────────────┐  ┌──────────────────┐                 │   │
│   │  │ Feb 16, 2025       ▼│  │ 2:00 PM         ▼│                 │   │
│   │  └─────────────────────┘  └──────────────────┘                 │   │
│   │                                                                 │   │
│   │  Players                  Skill Level                          │   │
│   │  Min: [4 ▼]  Max: [10▼]   [Intermediate           ▼]           │   │
│   │                                                                 │   │
│   │  Description (optional)                                         │   │
│   │  ┌──────────────────────────────────────────────────────────┐   │   │
│   │  │ Bring both light and dark shirts for teams.               │   │   │
│   │  │ We'll play 5v5 full court.                                │   │   │
│   │  │                                                            │   │   │
│   │  └──────────────────────────────────────────────────────────┘   │   │
│   │                                                                 │   │
│   │            [ Cancel ]              [ Create Game ]              │   │
│   │                                                                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### User Profile

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏀 PickupPro                    [Browse] [My Games] [Profile] [Logout] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │                                                                   │ │
│   │  ┌─────┐   JOY CHEN                          ⭐ 4.8 (52 ratings)  │ │
│   │  │     │   ───────────────────────────────────────────────────── │ │
│   │  │ 👤  │   Marketing Manager | Cambridge, MA                     │ │
│   │  │     │   Member since January 2024                             │ │
│   │  └─────┘                                                         │ │
│   │                                                                   │ │
│   │  "I organize weekly soccer games - always looking for            │ │
│   │   reliable players who show up on time and play fair!"           │ │
│   │                                                                   │ │
│   │  ┌──────────────────────────────────────────────────────────────┐│ │
│   │  │ SPORTS & SKILL LEVELS                                        ││ │
│   │  │                                                              ││ │
│   │  │  ⚽ Soccer ████████████████░░░░ Advanced                     ││ │
│   │  │  🏀 Basketball █████████░░░░░░░ Intermediate                 ││ │
│   │  │  🎾 Tennis ██████░░░░░░░░░░░░░░ Beginner                     ││ │
│   │  └──────────────────────────────────────────────────────────────┘│ │
│   │                                                                   │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│   ┌──────────────────────────────┐ ┌──────────────────────────────────┐ │
│   │ GAMES HOSTED: 24             │ │ GAMES PLAYED: 47                 │ │
│   └──────────────────────────────┘ └──────────────────────────────────┘ │
│                                                                         │
│   RECENT RATINGS                                                        │
│   ─────────────────────────────────────────────────────────────────     │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │ ⭐⭐⭐⭐⭐  "Best organizer! Games always start on time."         │ │
│   │ - Mohit S. | Feb 10, 2025 | Sunday Soccer                        │ │
│   ├───────────────────────────────────────────────────────────────────┤ │
│   │ ⭐⭐⭐⭐⭐  "Great sportsmanship and really welcoming to newbies" │ │
│   │ - Emma R. | Feb 3, 2025 | Sunday Soccer                          │ │
│   ├───────────────────────────────────────────────────────────────────┤ │
│   │ ⭐⭐⭐⭐☆  "Good player, competitive but fair"                    │ │
│   │ - Alex K. | Jan 27, 2025 | Basketball Pickup                     │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Rate Players Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │                                                               [X] │ │
│   │                    RATE PLAYERS                                   │ │
│   │                    Sunday Soccer - Feb 10, 2025                   │ │
│   │                                                                   │ │
│   │   ┌─────────────────────────────────────────────────────────────┐ │ │
│   │   │  👤 Mohit Sharma                                            │ │ │
│   │   │                                                             │ │ │
│   │   │  Sportsmanship: [☆] [☆] [☆] [☆] [☆]                        │ │ │
│   │   │                  1   2   3   4   5                          │ │ │
│   │   │                                                             │ │ │
│   │   │  Comment (optional):                                        │ │ │
│   │   │  ┌───────────────────────────────────────────────────────┐  │ │ │
│   │   │  │ Great attitude, showed up early to help set up!       │  │ │ │
│   │   │  └───────────────────────────────────────────────────────┘  │ │ │
│   │   │                                                             │ │ │
│   │   │                              [Submit Rating]                │ │ │
│   │   └─────────────────────────────────────────────────────────────┘ │ │
│   │                                                                   │ │
│   │   ┌─────────────────────────────────────────────────────────────┐ │ │
│   │   │  👤 Emma Rodriguez                           ✓ Already Rated │ │ │
│   │   └─────────────────────────────────────────────────────────────┘ │ │
│   │                                                                   │ │
│   │   ┌─────────────────────────────────────────────────────────────┐ │ │
│   │   │  👤 Alex Kim                                                │ │ │
│   │   │                                                             │ │ │
│   │   │  Sportsmanship: [☆] [☆] [☆] [☆] [☆]                        │ │ │
│   │   │                                                             │ │ │
│   │   │                              [Submit Rating]                │ │ │
│   │   └─────────────────────────────────────────────────────────────┘ │ │
│   │                                                                   │ │
│   │                                            [Done]                 │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Mobile-Responsive Game Card

```
┌──────────────────────────────┐
│  🏀 Sunday Basketball        │
│  ─────────────────────────── │
│                              │
│  📍 Cabot Center             │
│     Boston, MA               │
│                              │
│  📅 Feb 16, 2025             │
│  🕐 2:00 PM                  │
│                              │
│  ┌────────────────────────┐  │
│  │ ████████░░  8/10       │  │
│  │ spots filled           │  │
│  └────────────────────────┘  │
│                              │
│  ⭐ Host: Joy Chen (4.8)     │
│  🎯 Intermediate             │
│                              │
│  ┌────────────────────────┐  │
│  │      JOIN GAME         │  │
│  └────────────────────────┘  │
│                              │
└──────────────────────────────┘
```

---

## Color Palette & Typography

### Primary Colors
- **Primary**: `#FF6B35` (Energetic Orange)
- **Secondary**: `#004E64` (Deep Teal)
- **Accent**: `#25A18E` (Fresh Green)
- **Background**: `#F7F9FC` (Light Gray)
- **Text**: `#1A1A2E` (Dark Navy)

### Typography
- **Headings**: 'Montserrat', sans-serif (Bold)
- **Body**: 'Open Sans', sans-serif (Regular)
- **Accents**: 'Poppins', sans-serif (Medium)

### Sport Color Coding
| Sport | Color | Emoji |
|-------|-------|-------|
| Basketball | `#FF6B35` | 🏀 |
| Soccer | `#25A18E` | ⚽ |
| Tennis | `#F0C808` | 🎾 |
| Volleyball | `#7B2CBF` | 🏐 |
| Baseball | `#E63946` | ⚾ |
| Cricket | `#2A9D8F` | 🏏 |
| Badminton | `#4361EE` | 🏸 |
| Running | `#FF9F1C` | 🏃 |

---

*Document Version 1.0 | Created for CS5610 Web Development | Northeastern University*
