# PickupPro — Design Document

> **Course:** CS5610 Web Development · Northeastern University · Spring 2026
> **Authors:** Kashish Rahulbhai Khatri & Abhimanyu Dudeja

---

## Table of Contents

1. [Project Description](#1-project-description)
2. [User Personas](#2-user-personas)
3. [User Stories](#3-user-stories)
4. [Design Mockups](#4-design-mockups)
5. [System Architecture](#5-system-architecture)
6. [Database Design](#6-database-design)
7. [API Endpoints](#7-api-endpoints)

---

## 1. Project Description

### Overview

**PickupPro** is a community-driven web platform that connects local athletes to casual pickup sports games — without the mess of group chats, no-shows, or not knowing who you're playing with.

Instead of coordinating through cluttered WhatsApp groups, players can create games, browse open games nearby, join with one click, and build a community reputation through peer-to-peer ratings — all from a clean, fast, mobile-friendly web app.

### Problem Statement

Finding and organizing pickup sports today is painful:

- **Group chats** get cluttered, confirmations get buried, and "maybe" responses cause mismatched player counts on game day
- **No accountability** — people no-show with zero consequences, and bad actors ruin games for everyone
- **Newcomers to a city** have no reliable way to discover local games or find regular playing partners
- **Organizers** spend hours chasing RSVPs every week instead of just showing up and playing

### Solution

PickupPro solves this by providing:

- **Game Board** — Browse all upcoming games, filter by sport, city, date, and status
- **One-Click Join** — Secure your spot instantly; auto-join the waitlist when a game is full
- **Host Tools** — Create, edit, cancel, and complete games with full roster and waitlist management
- **Reputation System** — Rate players 1–5 stars after every completed game with optional comments
- **Player Profiles** — View anyone's stats, upcoming fixtures, sports, and peer reviews
- **My Games Dashboard** — Track all your games: upcoming, hosting, playing, and past with inline rating

### Supported Sports

🏀 Basketball · ⚽ Soccer · 🎾 Tennis · 🏐 Volleyball · ⚾ Baseball · 🏏 Cricket · 🏸 Badminton · 🏃 Running · 🎯 Other

### Tech Stack

| Layer      | Technology              | Reason                             |
| ---------- | ----------------------- | ---------------------------------- |
| Frontend   | Vanilla JavaScript SPA  | Course requirement — no frameworks |
| Backend    | Node.js + Express       | Course requirement                 |
| Database   | MongoDB (Native Driver) | Course requirement — no Mongoose   |
| Auth       | JWT + bcrypt            | Stateless, industry-standard       |
| Deployment | Docker + Render.com     | Containerized, free cloud hosting  |

---

## 2. User Personas

### Persona 1 — The Newcomer Athlete

```
┌─────────────────────────────────────────────────────────────┐
│  👤  MOHIT SHARMA                                           │
│      Age 26 · Software Engineer · Burlington, MA            │
├─────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                 │
│  • Recently relocated from India to Boston for a tech job   │
│  • Played basketball and cricket throughout college         │
│  • Has no existing social network in the city               │
│  • Works remotely — lots of free time but no connections    │
├──────────────────────────┬──────────────────────────────────┤
│  GOALS                   │  FRUSTRATIONS                   │
│  • Find pickup basketball│  • Doesn't know local courts     │
│    near Northeastern     │  • Facebook groups are cluttered │
│  • Meet people with      │  • Nervous showing up to         │
│    similar interests     │    unknown games alone           │
│  • Stay active without   │  • Uncertain if posted games     │
│    committing to leagues │    are real or abandoned         │
└──────────────────────────┴──────────────────────────────────┘
```

> _"I just want to find a real game, know it's actually happening, and show up without awkwardness. Is that too much to ask?"_

---

### Persona 2 — The Organizer

```
┌─────────────────────────────────────────────────────────────┐
│  👤  JOY CHEN                                               │
│      Age 32 · Marketing Manager · Cambridge, MA             │
├─────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                 │
│  • Organizes weekly Sunday soccer for 3+ years              │
│  • Manages a WhatsApp group of 45 players                   │
│  • Spends 2–3 hours every week chasing confirmations        │
│  • Games often have mismatched player counts                │
├──────────────────────────┬──────────────────────────────────┤
│  GOALS                   │  FRUSTRATIONS                   │
│  • Stop being the group  │  • "Who's in?" gets buried       │
│    chat admin            │    in chat noise                 │
│  • Let players self-     │  • People say "maybe" then       │
│    organize & confirm    │    ghost on game day             │
│  • Build a pool of       │  • No accountability for         │
│    reliable, vetted      │    no-shows or bad behavior      │
│    players               │                                  │
└──────────────────────────┴──────────────────────────────────┘
```

> _"I love playing soccer, but organizing has become a part-time job. I need something that handles the logistics so I can just show up and play."_

---

### Persona 3 — The Cautious Player

```
┌─────────────────────────────────────────────────────────────┐
│  👤  EMMA RODRIGUEZ                                         │
│      Age 28 · Graduate Student · Somerville, MA             │
├─────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                 │
│  • Plays recreational tennis and volleyball                 │
│  • Had bad experiences with overly competitive players      │
│  • Once showed up to a "casual" game that was intense       │
│  • Values inclusive, friendly environments above all        │
├──────────────────────────┬──────────────────────────────────┤
│  GOALS                   │  FRUSTRATIONS                   │
│  • Find games with the   │  • No way to vet players before  │
│    right skill level AND │    joining a random game         │
│    the right vibe        │  • "Casual" means different      │
│  • Know who she's        │    things to different people    │
│    playing with before   │  • Feels unsafe showing up       │
│    committing            │    alone to unknown games        │
└──────────────────────────┴──────────────────────────────────┘
```

> _"I want to play sports, not deal with drama. Seeing that someone has 4.8 stars from 50 reviews would make me way more likely to join their game."_

---

## 3. User Stories

### 🎮 Games Management _(Kashish Rahulbhai Khatri)_

---

#### Story 1 — Browse & Filter Games

> _As a visitor or player, I want to browse all games and filter by sport, date, city, and status, so that I can find games that fit my schedule and location._

**Scenario:** Emma is looking for a casual tennis game this weekend in Cambridge. She clicks the "Tennis" filter pill, sees 4 upcoming games near her, and picks the one hosted by someone with a 4.9 rating — all without creating an account.

**Acceptance Criteria:**

- Sport filter pills for all 9 sports — active pill is highlighted
- Status dropdown: Upcoming, Completed, All
- Date picker and city text input for further filtering
- Game cards show sport badge, status (Open / Full / Cancelled), title, date, city, player count, host rating
- Cancelled games show "Cancelled" in red — not "Open"
- Empty state shown when no results match

---

#### Story 2 — Create a Pickup Game

> _As a logged-in player, I want to create a pickup game by specifying sport, title, location, date, time, and player limits, so that others can find and join it._

**Scenario:** Joy is tired of managing 45-person WhatsApp groups. She creates "Sunday Soccer at Magazine Beach" — picks Soccer, sets max 12 players, marks it Intermediate, adds a description. The game appears in the browse list immediately and players join on their own.

**Acceptance Criteria:**

- Visual sport selector grid (emoji + name, radio buttons)
- Title, location name, and city required; address optional
- Date/time picker with minimum = 1 hour from now
- Min/max player count fields and skill level dropdown
- Optional description textarea
- After creation, redirected to the new game's detail page

---

#### Story 3 — Join a Game or Waitlist

> _As a player, I want to join a game or be placed on the waitlist if it's full, so that I can secure my spot or queue up without missing out._

**Scenario:** Mohit finds Joy's soccer game showing 12/12 full. He clicks "Join Waitlist" and sees he's position #2. When another player leaves, he's automatically promoted to the roster without doing anything.

**Acceptance Criteria:**

- "🎮 Join Game" button shown when spots are available
- "📝 Join Waitlist" shown when game is at capacity
- Waitlisted users see their current position (#1, #2, etc.)
- Cannot join completed, cancelled, or past-date games
- Toast notification confirms join or waitlist placement

---

#### Story 4 — Host Game Management

> _As a game host, I want to edit, cancel, complete, and optionally join my own game, so that I can manage the full game lifecycle and participate too._

**Scenario:** Joy's Sunday soccer wraps up. She clicks "Complete" — all players now see a "⭐ Rate Players" button. Next week she realizes she wants to join as a player too, so she clicks "🎮 Join Game" right from the host action bar.

**Acceptance Criteria:**

- Host sees Edit, Complete, Cancel buttons alongside Join/Leave for their own participation
- Edit: update sport, title, location, date, players, skill, description
- Complete: marks game done and unlocks rating for all participants
- Cancel: shows "Cancelled" badge on the card in red, not "Open"
- Host can join their own game and appear in the player list

---

#### Story 5 — Leave a Game

> _As a player, I want to leave a game I joined, so that my spot opens up for others who are waiting._

**Scenario:** Emma has a last-minute conflict and can't make Sunday volleyball. She clicks "👋 Leave" and confirms. The first waitlisted player is automatically promoted to the roster.

**Acceptance Criteria:**

- "👋 Leave" button visible for games the user has joined
- Confirmation dialog before leaving
- First waitlist player is automatically promoted if game was full
- "Leave Waitlist" option for waitlisted users
- Cannot leave a completed or cancelled game

---

### 👤 User Profiles & Reputation _(Abhimanyu Dudeja)_

---

#### Story 6 — Register & Set Up Profile

> _As a new visitor, I want to register with my name, email, password, and favorite sports, so that I can participate in the PickupPro community._

**Scenario:** Mohit arrives in Boston knowing nobody. He registers in under a minute — picks his name, email, password, selects Basketball and Cricket from the sport grid. He's immediately logged in and can browse and join games.

**Acceptance Criteria:**

- Name, email, and password (min 6 chars) are required
- Visual sport checkbox grid shown at registration
- JWT token issued; user redirected to homepage on success
- Logged-in state persists across page refreshes via localStorage

---

#### Story 7 — View Another Player's Profile with Upcoming Fixtures

> _As a player, I want to view any player's full profile including their upcoming games, stats, sports, and reviews, so that I can decide whether to join their game._

**Scenario:** Emma sees Joy is hosting a soccer game. She clicks Joy's name and sees a 4.8-star rating from 52 reviews, 24 games hosted, 3 upcoming fixtures this month, and reviews saying "Best organizer, always on time!" Emma feels confident joining.

**Acceptance Criteria:**

- Stats: average rating, total reviews, games hosted, games played
- Bio and sports interests displayed with emoji badges
- 📅 Upcoming Fixtures section — all upcoming games with date, time, city, HOST/PLAYER badge, player count; each is clickable
- Recent reviews with star scores, reviewer names, and comments
- "✏️ Edit My Profile" button only shown on own profile

---

#### Story 8 — Search & Discover Players

> _As a player, I want to instantly search for players by name and filter by sport, so that I can find regular playing partners in the community._

**Scenario:** Mohit types "cricket" into the search bar and instantly — as he types, no button needed — sees 8 community members who play cricket. He clicks one with a 4.6 rating and sees they're hosting a game next Saturday.

**Acceptance Criteria:**

- Instant client-side filtering as user types — no search button needed
- Sport dropdown filters by sports the player plays
- Result count banner: "Showing 8 of 101 players matching 'cricket'"
- Player cards show name, star rating, and sports emojis
- Empty state with helpful message when no matches found

---

#### Story 9 — Rate Players After a Completed Game

> _As a player who participated in a completed game, I want to rate other players from that game, so that the community can identify reliable, sportsmanlike players._

**Scenario:** After Sunday soccer, Joy opens My Games → Past Games. She sees the game card with 2 unrated players shown inline with star selectors. She clicks 5 stars for Mohit and hits Rate — done. No page reload. Mohit's profile rating updates immediately.

**Acceptance Criteria:**

- Ratings only available for games marked "Completed" by the host
- 1–5 star selector; optional written comment available on /ratings/pending page
- Each player can only rate each other once per game
- Already-rated players show "✅ Done" state
- Available from both /ratings/pending AND My Games → Past Games tab

---

#### Story 10 — My Games Dashboard with Past Games

> _As a player, I want to see all my games organized by role and status, with inline rating for past games, so that I can track everything and rate players without navigating away._

**Scenario:** Mohit opens My Games and clicks "📜 Past Games." He sees 6 completed games. The first card for last week's basketball shows 3 players he hasn't rated — star selectors right on the card. He rates all 3 without leaving the page.

**Acceptance Criteria:**

- Tabs: All, Hosting, Playing, 📜 Past Games
- All / Hosting / Playing shows a grid of game cards
- Past Games shows completed games with date, sport-colored header, location, player count
- Each past game card shows unrated players inline with star selector + Rate button
- After rating, row fades and shows "✅ Done" — no page reload
- "✅ All players rated" shown when no pending ratings remain for a game

---

## 4. Design Mockups

### Mockup 1 — Browse All Games (`/games`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏀 PickupPro         🎮 Games  👥 Players  📋 My Games    👤 Demo  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [All] [🏀 Basketball] [⚽ Soccer] [🎾 Tennis] [🏐 Volleyball]      │
│  [⚾ Baseball] [🏏 Cricket] [🏸 Badminton] [🏃 Running] [🎯 Other]  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  STATUS          DATE              CITY           [🔍 Search]│   │
│  │  [Upcoming ▾]   [dd/mm/yyyy  📅]  [Any city    ]             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌──────────────┐  │
│  │ 🏀 Basketball  OPEN │ │ 🏏 Cricket     OPEN │ │🎯 Other CNCL │  │
│  │─────────────────────│ │─────────────────────│ │──────────────│  │
│  │ Sunday Hoops        │ │ T20 Weekend Match    │ │ Casual Meetup│  │
│  │ 📍 Cabot, Boston    │ │ 📍 Harvard, Boston  │ │ 📍 Franklin  │  │
│  │ 📅 Feb 23 · 2:00 PM │ │ 📅 Feb 22 · 10 AM  │ │ 📅 Feb 20    │  │
│  │ 👥 7/10             │ │ 👥 9/12             │ │ 👥 2/8       │  │
│  │ ⭐ Host: 4.7        │ │ ⭐ Host: 4.9        │ │ ⭐ Host: 4.2 │  │
│  │   [🎮 Join Game]    │ │   [🎮 Join Game]    │ │  [👁️ View]  │  │
│  └─────────────────────┘ └─────────────────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Mockup 2 — Game Detail Page (`/games/:id`) — Host View

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏀 PickupPro         🎮 Games  👥 Players  📋 My Games    👤 Demo  │
├─────────────────────────────────────────────────────────────────────┤
│  ← Back to Games                                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ [🏸 Badminton]                                        🏸    │    │
│  │ Sunday Badminton Doubles                                     │    │
│  │ 🟢 Upcoming                                                  │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  📍 Cabot Center   📅 Feb 21    👥 0/10      🎯 All Levels  │    │
│  │     Boston, MA        10:00 PM     10 spots left             │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  🎖️ Host                                                     │    │
│  │  ┌──────────────────────────────────────────────────────┐   │    │
│  │  │ 👤  Demo User   ⭐ 0.0 (0 reviews)        View →    │   │    │
│  │  └──────────────────────────────────────────────────────┘   │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  👥 Players (0/10)                                          │    │
│  │  ┌──────────────────────────────────────────────────────┐   │    │
│  │  │           No players yet. Be the first!              │   │    │
│  │  └──────────────────────────────────────────────────────┘   │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  [✏️ Edit]  [✅ Complete]  [❌ Cancel]  [🎮 Join Game]      │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Mockup 3 — Player Profile (`/users/:id`) — with Upcoming Fixtures

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏀 PickupPro         🎮 Games  👥 Players  📋 My Games    👤 Demo  │
├─────────────────────────────────────────────────────────────────────┤
│  ← Back                                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              [ 👤 ]                                    🏆   │    │
│  │             Joy Chen                                         │    │
│  │          ⭐ 4.8  (52 reviews)                                │    │
│  ├───────────┬──────────┬────────────┬────────────────────────┤    │
│  │   4.8     │   52     │    24      │    47                   │    │
│  │ ⭐ RATING │ REVIEWS  │  HOSTED    │   PLAYED                │    │
│  ├───────────┴──────────┴────────────┴────────────────────────┤    │
│  │  📝 About                                                    │    │
│  │  "Love playing soccer! Organizing weekly games for 3 years" │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  🏆 Sports:  [⚽ Soccer]  [🏀 Basketball]  [🎾 Tennis]       │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  📅 Upcoming Fixtures                          3 games      │    │
│  │  ┌──────────────────────────────────────────────────────┐   │    │
│  │  │ ⚽  Weekly Soccer · Sun Feb 23 · 10AM · Cambridge HOST│   │    │
│  │  │ 🏀  Sunday Hoops · Mon Feb 24 · 2PM · Boston   PLAYER│   │    │
│  │  │ 🎾  Tennis Doubles · Wed Feb 26 · 6PM · Boston PLAYER│   │    │
│  │  └──────────────────────────────────────────────────────┘   │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  ⭐ Reviews                                                  │    │
│  │  "Best organizer! Always on time." — Mohit  ⭐⭐⭐⭐⭐        │    │
│  │  "Very welcoming to newcomers." — Emma      ⭐⭐⭐⭐⭐        │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Mockup 4 — My Games → Past Games with Inline Rating (`/my-games`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏀 PickupPro         🎮 Games  👥 Players  📋 My Games    👤 Demo  │
├─────────────────────────────────────────────────────────────────────┤
│  🎮 My Games                                                        │
│  [All]  [Hosting]  [Playing]  [📜 Past Games ◀ active]             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ ⚽  Weekly Soccer Pickup             Feb 16, 2025           │    │
│  │     📍 Cambridge  ·  👥 10/12                               │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  ⭐ Rate Players                                             │    │
│  │  👤 Mohit Sharma      [★][★][★][★][☆]       [Rate]         │    │
│  │  👤 Emma Rodriguez    [☆][☆][☆][☆][☆]       [Rate]         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 🏀  Sunday Hoops                     Feb 9, 2025            │    │
│  │     📍 Boston  ·  👥 8/10                                   │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  ✅ All players rated                                        │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Mockup 5 — Find Players with Instant Search (`/players`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏀 PickupPro         🎮 Games  👥 Players  📋 My Games    👤 Demo  │
├─────────────────────────────────────────────────────────────────────┤
│  👥 Find Players  —  Discover the community                         │
│                                                                     │
│  ┌──────────────────────────────────────┐ ┌─────────────────────┐   │
│  │  SEARCH                              │ │  SPORT              │   │
│  │  [Search by name...                ] │ │  [All Sports      ▾]│   │
│  └──────────────────────────────────────┘ └─────────────────────┘   │
│  Showing 3 of 101 players matching "Joy"                            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   [ 👤 ]     │  │   [ 👤 ]     │  │   [ 👤 ]     │             │
│  │  Joy Chen    │  │ Joylynn Patel│  │Joydeep Kumar │             │
│  │ ⭐ 4.8 (52) │  │ ⭐ 4.1 (18)  │  │ ⭐ 3.9  (7) │             │
│  │  ⚽ 🏀 🎾   │  │    🏏 🏐     │  │     🏃       │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Mockup 6 — Register / Create Account (`/register`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏀 PickupPro                                  [Log In]  [Sign Up]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│              ┌──────────────────────────────────────┐              │
│              │  🎉  Join PickupPro!             ⚽   │              │
│              ├──────────────────────────────────────┤              │
│              │  👤 Name                             │              │
│              │  [Your name                        ] │              │
│              │  📧 Email                            │              │
│              │  [you@example.com                  ] │              │
│              │  🔐 Password  (min 6 chars)          │              │
│              │  [••••••••••                        ] │              │
│              │                                      │              │
│              │  🏆 Favorite Sports                  │              │
│              │  ┌──────────┬──────────┬──────────┐  │              │
│              │  │🏀 ✅     │ ⚽       │ 🎾       │  │              │
│              │  │Basketball│ Soccer   │ Tennis   │  │              │
│              │  ├──────────┼──────────┼──────────┤  │              │
│              │  │🏐        │ 🏏 ✅    │ 🏸       │  │              │
│              │  │Volleyball│ Cricket  │Badminton │  │              │
│              │  └──────────┴──────────┴──────────┘  │              │
│              │                                      │              │
│              │  [    ✨ Create Account           ]  │              │
│              │  Have an account?  Log in 🚀         │              │
│              └──────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Mockup 7 — Create a Game (`/games/create`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏀 PickupPro         🎮 Games  👥 Players  📋 My Games    👤 Demo  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│           ┌────────────────────────────────────────────┐           │
│           │  🎮  Create a Game                         │           │
│           │      Set up a game for others to join!     │           │
│           ├────────────────────────────────────────────┤           │
│           │  🏆 Sport                                  │           │
│           │  ┌────────┬────────┬────────┬────────┐     │           │
│           │  │🏀      │⚽ ✅   │🎾      │🏐      │     │           │
│           │  │Basketbl│Soccer  │Tennis  │Volleybl│     │           │
│           │  ├────────┼────────┼────────┼────────┤     │           │
│           │  │🏏      │🏸      │🏃      │🎯      │     │           │
│           │  │Cricket │Badmntn │Running │Other   │     │           │
│           │  └────────┴────────┴────────┴────────┘     │           │
│           │  ✏️ Title                                   │           │
│           │  [Sunday Soccer at Magazine Beach        ]  │           │
│           │  📍 Location           🏙️ City              │           │
│           │  [Magazine Beach     ] [Cambridge       ]   │           │
│           │  📅 Date & Time                             │           │
│           │  [02/23/2025  10:00                     ]   │           │
│           │  👥 Min  👥 Max   🎯 Skill Level            │           │
│           │  [ 6  ]  [ 12 ]   [All Levels          ▾]   │           │
│           │  📝 Description (optional)                  │           │
│           │  [All welcome! Bring water + shirts.    ]   │           │
│           │  [  Cancel  ]      [    🎮 Create!    ]     │           │
│           └────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT — Vanilla JS SPA                   │
│  Custom Router · ES Modules · Fetch API · JWT localStorage   │
│  games.js · users.js · ratings.js · auth.js · components.js │
└──────────────────────────┬───────────────────────────────────┘
                           │  REST API / JSON over HTTP
┌──────────────────────────▼───────────────────────────────────┐
│                  SERVER — Node.js + Express                   │
│  /api/auth · /api/games · /api/users · /api/ratings          │
│  JWT Middleware · Error Handler · CORS · Static Serving      │
└──────────────────────────┬───────────────────────────────────┘
                           │  MongoDB Native Driver (no Mongoose)
┌──────────────────────────▼───────────────────────────────────┐
│                  DATABASE — MongoDB                           │
│  users collection · games collection · ratings collection    │
│  100+ users · 1,100+ games · thousands of ratings (seeded)   │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Database Design

### Users Collection

| Field         | Type     | Notes                             |
| ------------- | -------- | --------------------------------- |
| `_id`         | ObjectId | Primary key                       |
| `email`       | String   | Unique, required                  |
| `password`    | String   | bcrypt hashed                     |
| `name`        | String   | Display name                      |
| `bio`         | String   | Optional                          |
| `sports`      | [String] | e.g. `["Basketball", "Cricket"]`  |
| `skillLevels` | Object   | e.g. `{"Basketball": "Advanced"}` |
| `createdAt`   | Date     |                                   |

### Games Collection

| Field        | Type       | Notes                                           |
| ------------ | ---------- | ----------------------------------------------- |
| `_id`        | ObjectId   | Primary key                                     |
| `hostId`     | ObjectId   | → users                                         |
| `sport`      | String     | One of 9 supported sports                       |
| `title`      | String     |                                                 |
| `location`   | Object     | name, city, address, coordinates                |
| `date`       | Date       |                                                 |
| `maxPlayers` | Number     |                                                 |
| `minPlayers` | Number     |                                                 |
| `players`    | [ObjectId] | → users                                         |
| `waitlist`   | [ObjectId] | Ordered → users                                 |
| `status`     | String     | `upcoming` / `completed` / `cancelled`          |
| `skillLevel` | String     | Beginner / Intermediate / Advanced / All Levels |

### Ratings Collection

| Field        | Type     | Notes                   |
| ------------ | -------- | ----------------------- |
| `_id`        | ObjectId | Primary key             |
| `gameId`     | ObjectId | → games                 |
| `fromUserId` | ObjectId | → users                 |
| `toUserId`   | ObjectId | → users                 |
| `score`      | Number   | 1–5 stars               |
| `comment`    | String   | Optional, max 500 chars |
| `createdAt`  | Date     |                         |

> Unique compound index on `gameId + fromUserId + toUserId` — one rating per pair per game.

---

## 7. API Endpoints

### Authentication

| Method | Endpoint             | Auth   | Description                    |
| ------ | -------------------- | ------ | ------------------------------ |
| POST   | `/api/auth/register` | —      | Register new user, returns JWT |
| POST   | `/api/auth/login`    | —      | Login, returns JWT + user      |
| GET    | `/api/auth/me`       | ✅ JWT | Get current user + stats       |

### Games _(Kashish Rahulbhai Khatri)_

| Method | Endpoint                  | Auth     | Description                                  |
| ------ | ------------------------- | -------- | -------------------------------------------- |
| GET    | `/api/games`              | Optional | List with filters: sport, status, city, date |
| GET    | `/api/games/:id`          | Optional | Game detail with host, players, waitlist     |
| POST   | `/api/games`              | ✅ JWT   | Create new game                              |
| PUT    | `/api/games/:id`          | ✅ Host  | Edit game details                            |
| DELETE | `/api/games/:id`          | ✅ Host  | Cancel game                                  |
| POST   | `/api/games/:id/join`     | ✅ JWT   | Join game or waitlist                        |
| POST   | `/api/games/:id/leave`    | ✅ JWT   | Leave game or waitlist                       |
| PUT    | `/api/games/:id/complete` | ✅ Host  | Mark as completed                            |
| GET    | `/api/games/:id/roster`   | Optional | Get full roster and waitlist                 |

### Users _(Abhimanyu Dudeja)_

| Method | Endpoint                 | Auth     | Description                          |
| ------ | ------------------------ | -------- | ------------------------------------ |
| GET    | `/api/users`             | Optional | Search/list users by name, sport     |
| GET    | `/api/users/:id`         | Optional | User profile with stats and ratings  |
| PUT    | `/api/users/:id`         | ✅ Own   | Update name, bio, sports             |
| GET    | `/api/users/:id/games`   | Optional | Game history filtered by status/role |
| GET    | `/api/users/:id/ratings` | Optional | Ratings received by user             |

### Ratings _(Abhimanyu Dudeja)_

| Method | Endpoint                    | Auth   | Description                                  |
| ------ | --------------------------- | ------ | -------------------------------------------- |
| POST   | `/api/ratings`              | ✅ JWT | Rate a player (1–5 stars + optional comment) |
| GET    | `/api/ratings/game/:gameId` | —      | All ratings for a game                       |
| GET    | `/api/ratings/pending`      | ✅ JWT | Completed games where user can still rate    |

---

_PickupPro Design Document · CS5610 Web Development · Northeastern University · Spring 2026_
_Authors: Kashish Rahulbhai Khatri & Abhimanyu Dudeja_
