/**
 * PAGE: users  (/players  /users/:id  /profile  /my-games)
 * Created by: Abhimanyu Dudeja
 */
import { Users } from "../modules/api.js";
import { SPORTS, getSport, escape, $, $$ } from "../modules/utils.js";
import { route, render } from "../modules/router.js";
import { currentUser, requireAuth, updateAuthUI } from "../modules/auth.js";
import { toast } from "../modules/toast.js";
import {
  PlayerCard,
  GameCard,
  SportSelector,
  setupSportSelector,
} from "../modules/components.js";

export function registerUserRoutes() {
  route("/players", async () => {
    render(`
      <section class="section"><div class="container">
        <div class="page-header"><h2>👥 Find Players</h2><p>Discover the community</p></div>
        <div class="filter-bar">
          <div class="filter-bar__group"><label>Search</label><input type="text" id="searchName" placeholder="Search by name..." autocomplete="off"></div>
          <div class="filter-bar__group"><label>Sport</label><select id="filterSport"><option value="">All Sports</option>${SPORTS.map((s) => `<option value="${s.name}">${s.emoji} ${s.name}</option>`).join("")}</select></div>
        </div>
        <div id="resultsInfo" style="font-size:0.85rem;color:var(--gray-500);margin-bottom:var(--space-4);display:none"></div>
        <div class="grid grid--players" id="playersList"><div class="loader"><div class="loader__ball">🏀</div></div></div>
      </div></section>`);

    let allPlayers = [];

    function applyFilters() {
      const name = $("#searchName").value.trim().toLowerCase();
      const sport = $("#filterSport").value;
      const list = $("#playersList");
      const info = $("#resultsInfo");

      let filtered = allPlayers;
      if (name) {
        filtered = filtered.filter((u) => u.name.toLowerCase().includes(name));
      }
      if (sport) {
        filtered = filtered.filter((u) => u.sports && u.sports.includes(sport));
      }

      // Show results info when filtering
      if (name || sport) {
        info.style.display = "block";
        info.textContent = `Showing ${filtered.length} of ${allPlayers.length} players${name ? ` matching "${$("#searchName").value}"` : ""}${sport ? ` playing ${sport}` : ""}`;
      } else {
        info.style.display = "none";
      }

      list.innerHTML = filtered.length
        ? filtered.map(PlayerCard).join("")
        : '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">👥</div><h3>No players found</h3><p>Try a different name or sport</p></div>';
    }

    // Load all players once
    const list = $("#playersList");
    try {
      const r = await Users.list({ limit: 100 });
      allPlayers = r.data.users;
      list.innerHTML = allPlayers.length
        ? allPlayers.map(PlayerCard).join("")
        : '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">👥</div><h3>No players yet</h3></div>';
    } catch (e) {
      list.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>${e.message}</p></div>`;
    }

    $("#searchName").oninput = applyFilters;
    $("#filterSport").onchange = applyFilters;
  });

  route("/users/:id", async ({ id }) => {
    // Fetch user profile and upcoming fixtures in parallel
    const [r, fixturesRes] = await Promise.all([
      Users.get(id),
      Users.games(id, {
        status: "upcoming",
        limit: 10,
        sortBy: "date",
        sortOrder: "asc",
      }).catch(() => ({ data: { games: [] } })),
    ]);
    const { user, stats, recentRatings } = r.data;
    const fixtures = fixturesRes.data.games || [];
    const isOwnProfile = currentUser && currentUser._id.toString() === id.toString();

    const fixturesHtml = fixtures.length
      ? fixtures
          .map((g) => {
            const s = getSport(g.sport);
            const date = new Date(g.date);
            const dateStr = date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            const timeStr = date.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });
            const isHost = g.role === "host";
            return `<a href="/games/${g._id}" data-link style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl);text-decoration:none;color:inherit;border:2px solid transparent;transition:var(--transition);margin-bottom:var(--space-3)" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='transparent'">
            <div style="width:48px;height:48px;background:var(--primary-gradient);border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0">${s.emoji}</div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escape(g.title)}</div>
              <div style="font-size:0.82rem;color:var(--gray-500);margin-top:2px">📅 ${dateStr} &nbsp;🕐 ${timeStr} &nbsp;📍 ${escape(g.location?.city || "")}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
              <span style="font-size:0.75rem;font-weight:700;padding:3px 10px;border-radius:var(--radius-full);background:${isHost ? "var(--primary)" : "var(--gray-200)"};color:${isHost ? "white" : "var(--gray-700)"}">${isHost ? "HOST" : "PLAYER"}</span>
              <span style="font-size:0.78rem;color:var(--gray-500)">👥 ${g.playerCount}/${g.maxPlayers}</span>
            </div>
          </a>`;
          })
          .join("")
      : `<div style="padding:var(--space-5);background:var(--gray-50);border-radius:var(--radius-xl);text-align:center"><p style="color:var(--gray-500);margin:0">No upcoming fixtures</p></div>`;

    render(`
      <section class="section"><div class="container" style="max-width:650px">
        <a href="/players" class="btn btn--ghost" data-link style="margin-bottom:var(--space-4)">← Back</a>
        <div class="card card--static">
          <div class="card__header card__header--primary" style="padding:var(--space-8);min-height:200px;text-align:center">
            <div style="position:relative;z-index:1">
              <div style="width:110px;height:110px;margin:0 auto var(--space-3);background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:3.5rem;box-shadow:0 8px 24px rgba(0,0,0,0.2)">👤</div>
              <h1 style="color:white;margin:0;font-size:1.8rem">${escape(user.name)}</h1>
              <div style="display:flex;align-items:center;justify-content:center;gap:var(--space-2);margin-top:var(--space-2)"><span style="font-size:1.3rem">⭐</span><span style="color:white;font-size:1.1rem;font-weight:600">${stats.avgRating.toFixed(1)}</span><span style="color:rgba(255,255,255,0.8)">(${stats.totalRatings} reviews)</span></div>
            </div>
            <div class="card__mascot" style="font-size:110px">🏆</div>
          </div>
          <div class="card__body">
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-3);margin-bottom:var(--space-6)">
              <div style="text-align:center;padding:var(--space-4);background:var(--basketball-gradient);border-radius:var(--radius-xl);color:white"><div style="font-size:1.8rem;font-weight:700">${stats.avgRating.toFixed(1)}</div><div style="font-size:0.7rem;opacity:0.9">⭐ RATING</div></div>
              <div style="text-align:center;padding:var(--space-4);background:var(--soccer-gradient);border-radius:var(--radius-xl);color:white"><div style="font-size:1.8rem;font-weight:700">${stats.totalRatings}</div><div style="font-size:0.7rem;opacity:0.9">REVIEWS</div></div>
              <div style="text-align:center;padding:var(--space-4);background:var(--volleyball-gradient);border-radius:var(--radius-xl);color:white"><div style="font-size:1.8rem;font-weight:700">${stats.gamesHosted}</div><div style="font-size:0.7rem;opacity:0.9">HOSTED</div></div>
              <div style="text-align:center;padding:var(--space-4);background:var(--badminton-gradient);border-radius:var(--radius-xl);color:white"><div style="font-size:1.8rem;font-weight:700">${stats.gamesPlayed}</div><div style="font-size:0.7rem;opacity:0.9">PLAYED</div></div>
            </div>
            ${user.bio ? `<div style="padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl);margin-bottom:var(--space-6)"><h4 style="font-size:0.9rem;color:var(--gray-500);margin-bottom:var(--space-2)">About</h4><p style="color:var(--gray-700);margin:0">${escape(user.bio)}</p></div>` : ""}
            <div style="margin-bottom:var(--space-6)">
              <h4 style="font-size:1rem;margin-bottom:var(--space-3)">🏆 Sports</h4>
              ${user.sports && user.sports.length > 0 ? `<div style="display:flex;flex-wrap:wrap;gap:var(--space-3)">${user.sports.map((s) => `<div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4);background:var(--gray-100);border-radius:var(--radius-full)"><span style="font-size:1.3rem">${getSport(s).emoji}</span><span style="font-weight:600">${getSport(s).name}</span></div>`).join("")}</div>` : '<p style="color:var(--gray-500)">No sports yet</p>'}
            </div>

            <div style="margin-bottom:var(--space-6);padding-top:var(--space-6);border-top:2px dashed var(--gray-200)">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4)">
                <h4 style="font-size:1rem;margin:0">Upcoming Fixtures</h4>
                <span style="font-size:0.82rem;color:var(--gray-500);background:var(--gray-100);padding:4px 12px;border-radius:var(--radius-full);font-weight:600">${fixtures.length} game${fixtures.length !== 1 ? "s" : ""}</span>
              </div>
              ${fixturesHtml}
            </div>

            ${recentRatings && recentRatings.length > 0 ? `<div style="padding-top:var(--space-6);border-top:2px dashed var(--gray-200)"><h4 style="font-size:1rem;margin-bottom:var(--space-4)">⭐ Reviews</h4><div style="display:flex;flex-direction:column;gap:var(--space-3)">${recentRatings.map((rt) => `<div style="padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2)"><a href="/users/${rt.fromUser?._id}" data-link style="display:flex;align-items:center;gap:var(--space-2);text-decoration:none;color:inherit"><div style="width:36px;height:36px;background:var(--primary-gradient);border-radius:50%;display:flex;align-items:center;justify-content:center">👤</div><strong>${escape(rt.fromUser?.name || "Anonymous")}</strong></a><div>⭐ ${rt.score}/5</div></div>${rt.comment ? `<p style="color:var(--gray-600);font-size:0.9rem;font-style:italic;margin:0">"${escape(rt.comment)}"</p>` : ""}</div>`).join("")}</div></div>` : `<div style="padding:var(--space-6);background:var(--gray-50);border-radius:var(--radius-xl);text-align:center"><p style="color:var(--gray-500);margin:0">No reviews yet</p></div>`}
            ${isOwnProfile ? `<a href="/profile" class="btn btn--primary btn--full" data-link style="margin-top:var(--space-6)">Edit My Profile</a>` : ""}
          </div>
        </div>
      </div></section>`);
  });

  route(
    "/profile",
    requireAuth(async () => {
      const r = await Users.get(currentUser._id);
      const { user, stats } = r.data;
      render(`
      <section class="section"><div class="container" style="max-width:600px">
        <div class="card card--static">
          <div class="card__header card__header--primary" style="padding:var(--space-8);min-height:180px;text-align:center">
            <div style="position:relative;z-index:1">
              <div style="width:100px;height:100px;margin:0 auto var(--space-3);background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:3rem;box-shadow:0 8px 24px rgba(0,0,0,0.2)">👤</div>
              <h2 style="color:white;margin:0;font-size:1.6rem">${escape(user.name)}</h2>
              <p style="color:rgba(255,255,255,0.9);margin-top:var(--space-2)">⭐ ${stats.avgRating.toFixed(1)} · ${stats.totalRatings} reviews</p>
            </div>
            <div class="card__mascot" style="font-size:100px">🏆</div>
          </div>
          <div class="card__body">
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-3);margin-bottom:var(--space-6)">
              <div style="text-align:center;padding:var(--space-4);background:var(--basketball-gradient);border-radius:var(--radius-xl);color:white"><div style="font-size:1.8rem;font-weight:700">${stats.avgRating.toFixed(1)}</div><div style="font-size:0.7rem;opacity:0.9">⭐ RATING</div></div>
              <div style="text-align:center;padding:var(--space-4);background:var(--soccer-gradient);border-radius:var(--radius-xl);color:white"><div style="font-size:1.8rem;font-weight:700">${stats.totalRatings}</div><div style="font-size:0.7rem;opacity:0.9">REVIEWS</div></div>
              <div style="text-align:center;padding:var(--space-4);background:var(--volleyball-gradient);border-radius:var(--radius-xl);color:white"><div style="font-size:1.8rem;font-weight:700">${stats.gamesHosted}</div><div style="font-size:0.7rem;opacity:0.9">HOSTED</div></div>
              <div style="text-align:center;padding:var(--space-4);background:var(--badminton-gradient);border-radius:var(--radius-xl);color:white"><div style="font-size:1.8rem;font-weight:700">${stats.gamesPlayed}</div><div style="font-size:0.7rem;opacity:0.9">PLAYED</div></div>
            </div>
            <form id="profileForm">
              <div class="form-group"><label class="form-label">👤 Name</label><input type="text" name="name" class="form-input" value="${escape(user.name)}" required minlength="2"></div>
              <div class="form-group"><label class="form-label">Bio</label><textarea name="bio" class="form-textarea" placeholder="Tell players about yourself...">${escape(user.bio || "")}</textarea></div>
              <div class="form-group"><label class="form-label">🏆 My Sports</label>${SportSelector("checkbox", user.sports || [])}</div>
              <button type="submit" class="btn btn--primary btn--full btn--lg" style="margin-top:var(--space-4)">Save Changes</button>
            </form>
            <div style="margin-top:var(--space-6);display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">
              <a href="/my-games" class="btn btn--outline" data-link>My Games</a>
              <a href="/ratings/pending" class="btn btn--outline" data-link>⭐ Rate Players</a>
            </div>
          </div>
        </div>
      </div></section>`);
      setupSportSelector();
      $("#profileForm").onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const fd = new FormData(e.target);
        btn.disabled = true;
        btn.classList.add("btn--loading");
        try {
          await Users.update(currentUser._id, {
            name: fd.get("name"),
            bio: fd.get("bio"),
            sports: fd.getAll("sports"),
          });
          currentUser.name = fd.get("name");
          updateAuthUI();
          toast("success", "Saved!");
        } catch (err) {
          toast("error", err.message);
        } finally {
          btn.disabled = false;
          btn.classList.remove("btn--loading");
        }
      };
    }),
  );

  route(
    "/my-games",
    requireAuth(async () => {
      render(`
      <section class="section"><div class="container">
        <div class="page-header"><h2>My Games</h2></div>
        <div class="filters" id="filters">
          <button class="filter-btn active" data-f="all">All</button>
          <button class="filter-btn" data-f="host">Hosting</button>
          <button class="filter-btn" data-f="player">Playing</button>
          <button class="filter-btn" data-f="past">📜 Past Games</button>
        </div>
        <div id="gamesList"><div class="loader"><div class="loader__ball">🏀</div></div></div>
      </div></section>`);
      let f = "all";

      async function loadPastGames() {
        const list = $("#gamesList");
        list.innerHTML =
          '<div class="loader" style="grid-column:1/-1"><div class="loader__ball">🏀</div></div>';
        try {
          const token = localStorage.getItem("token");
          const [gamesRes, pendingRes] = await Promise.all([
            Users.games(currentUser._id, { status: "completed", limit: 50 }),
            fetch("/api/ratings/pending", {
              headers: { Authorization: "Bearer " + token },
            }).then((r) => r.json()),
          ]);
          const games = gamesRes.data.games;
          const pendingMap = {};
          (pendingRes.data?.pendingRatings || []).forEach((pr) => {
            pendingMap[pr.game._id] = pr.unratedPlayers;
          });

          if (!games.length) {
            list.innerHTML =
              '<div class="empty-state"><div class="empty-state__icon">📜</div><h3>No past games</h3><p>Completed games will appear here</p></div>';
            return;
          }

          const cards = games.map((g) => {
            const sport = g.sport || "Other";
            const sportObj = getSport(sport);
            const unrated = pendingMap[g._id] || [];
            const dateStr = new Date(g.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            let ratingSection = "";
            if (unrated.length) {
              const playerRows = unrated
                .map((p) => {
                  const stars = [1, 2, 3, 4, 5]
                    .map(
                      (n) =>
                        `<span class="star" data-v="${n}" style="cursor:pointer;color:var(--gray-300);font-size:1.3rem">★</span>`,
                    )
                    .join("");
                  return `<div class="rate-box" data-player="${p._id}" data-game="${g._id}" style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl);margin-bottom:var(--space-2)">
                  <div style="width:36px;height:36px;background:var(--primary-gradient);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">👤</div>
                  <strong style="flex:1">${escape(p.name)}</strong>
                  <div class="stars" style="display:flex;gap:2px">${stars}</div>
                  <button class="btn btn--primary submit-rating" style="padding:var(--space-2) var(--space-4);font-size:0.85rem">Rate</button>
                </div>`;
                })
                .join("");
              ratingSection = `<div style="margin-top:var(--space-4)"><h4 style="font-size:0.95rem;margin-bottom:var(--space-3);color:var(--gray-600)">⭐ Rate Players</h4>${playerRows}</div>`;
            } else {
              ratingSection = `<p style="margin-top:var(--space-3);font-size:0.85rem;color:var(--success)">All players rated</p>`;
            }

            return `<div class="card card--static" style="margin-bottom:var(--space-5)">
              <div class="card__header card__header--${sport.toLowerCase()}" style="padding:var(--space-4);display:flex;align-items:center;justify-content:space-between">
                <div>
                  <div style="font-size:0.85rem;color:rgba(255,255,255,0.8);margin-bottom:2px">${dateStr}</div>
                  <h3 style="color:white;margin:0;font-size:1.1rem">${escape(g.title)}</h3>
                  <div style="color:rgba(255,255,255,0.85);font-size:0.85rem;margin-top:2px">📍 ${escape(g.location?.city || "")} &nbsp;👥 ${g.playerCount}/${g.maxPlayers}</div>
                </div>
                <div style="font-size:3rem;opacity:0.6">${sportObj.emoji}</div>
              </div>
              <div class="card__body" style="padding:var(--space-4)">${ratingSection}</div>
            </div>`;
          });

          list.innerHTML = cards.join("");

          $$("#gamesList .star").forEach((s) => {
            s.onclick = () => {
              const v = +s.dataset.v;
              const box = s.closest(".rate-box");
              box
                .querySelectorAll(".star")
                .forEach(
                  (st, i) =>
                    (st.style.color = i < v ? "#FFD700" : "var(--gray-300)"),
                );
              box.dataset.rating = v;
            };
          });

          $$("#gamesList .submit-rating").forEach((btn) => {
            btn.onclick = async () => {
              const box = btn.closest(".rate-box");
              const score = +box.dataset.rating;
              if (!score) {
                toast("warning", "Select a star rating first");
                return;
              }
              btn.disabled = true;
              try {
                const res = await fetch("/api/ratings", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                  },
                  body: JSON.stringify({
                    gameId: box.dataset.game,
                    toUserId: box.dataset.player,
                    score,
                  }),
                });
                if (!res.ok) {
                  const d = await res.json();
                  throw new Error(d.message || "Failed");
                }
                toast("success", "Rated! ⭐");
                box.style.opacity = "0.5";
                box.style.pointerEvents = "none";
                btn.textContent = "Done";
              } catch (e) {
                toast("error", e.message);
                btn.disabled = false;
              }
            };
          });
        } catch (e) {
          list.innerHTML = `<p>${e.message}</p>`;
        }
      }

      async function load() {
        if (f === "past") {
          loadPastGames();
          return;
        }
        const list = $("#gamesList");
        list.innerHTML =
          '<div class="loader" style="grid-column:1/-1"><div class="loader__ball">🏀</div></div>';
        try {
          const p = { limit: 50 };
          if (f !== "all") p.role = f;
          const r = await Users.games(currentUser._id, p);
          list.innerHTML = r.data.games.length
            ? `<div class="grid grid--games">${r.data.games.map(GameCard).join("")}</div>`
            : '<div class="empty-state"><div class="empty-state__icon">🏅</div><h3>No games</h3><a href="/games" class="btn btn--primary" data-link>Browse</a></div>';
        } catch (e) {
          list.innerHTML = `<p>${e.message}</p>`;
        }
      }

      $$(".filter-btn").forEach((b) => {
        b.onclick = () => {
          $$(".filter-btn").forEach((x) => x.classList.remove("active"));
          b.classList.add("active");
          f = b.dataset.f;
          load();
        };
      });
      load();
    }),
  );
}
