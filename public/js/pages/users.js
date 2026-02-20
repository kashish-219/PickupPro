/**
 * PAGE: users  (/players  /users/:id  /profile  /my-games)
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
          <div class="filter-bar__group"><label>Search</label><input type="text" id="searchName" placeholder="Name"></div>
          <div class="filter-bar__group"><label>Sport</label><select id="filterSport"><option value="">All</option>${SPORTS.map((s) => `<option value="${s.name}">${s.emoji} ${s.name}</option>`).join("")}</select></div>
          <div class="filter-bar__actions"><button class="btn btn--primary" id="searchBtn">🔍</button></div>
        </div>
        <div class="grid grid--players" id="playersList"><div class="loader"><div class="loader__ball">🏀</div></div></div>
      </div></section>`);
    async function load() {
      const list = $("#playersList");
      list.innerHTML =
        '<div class="loader" style="grid-column:1/-1"><div class="loader__ball">🏀</div></div>';
      try {
        const r = await Users.list({
          search: $("#searchName").value,
          sport: $("#filterSport").value,
          limit: 20,
        });
        list.innerHTML = r.data.users.length
          ? r.data.users.map(PlayerCard).join("")
          : '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">👥</div><h3>No players found</h3></div>';
      } catch (e) {
        list.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>${e.message}</p></div>`;
      }
    }
    $("#searchBtn").onclick = load;
    $("#searchName").onkeypress = (e) => e.key === "Enter" && load();
    load();
  });

  route("/users/:id", async ({ id }) => {
    const r = await Users.get(id);
    const { user, stats, recentRatings } = r.data;
    const isOwnProfile = currentUser && currentUser._id === id;
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
            ${user.bio ? `<div style="padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl);margin-bottom:var(--space-6)"><h4 style="font-size:0.9rem;color:var(--gray-500);margin-bottom:var(--space-2)">📝 About</h4><p style="color:var(--gray-700);margin:0">${escape(user.bio)}</p></div>` : ""}
            <div style="margin-bottom:var(--space-6)">
              <h4 style="font-size:1rem;margin-bottom:var(--space-3)">🏆 Sports</h4>
              ${user.sports && user.sports.length > 0 ? `<div style="display:flex;flex-wrap:wrap;gap:var(--space-3)">${user.sports.map((s) => `<div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4);background:var(--gray-100);border-radius:var(--radius-full)"><span style="font-size:1.3rem">${getSport(s).emoji}</span><span style="font-weight:600">${getSport(s).name}</span></div>`).join("")}</div>` : '<p style="color:var(--gray-500)">No sports yet</p>'}
            </div>
            ${recentRatings && recentRatings.length > 0 ? `<div style="padding-top:var(--space-6);border-top:2px dashed var(--gray-200)"><h4 style="font-size:1rem;margin-bottom:var(--space-4)">⭐ Reviews</h4><div style="display:flex;flex-direction:column;gap:var(--space-3)">${recentRatings.map((rt) => `<div style="padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2)"><a href="/users/${rt.fromUser?._id}" data-link style="display:flex;align-items:center;gap:var(--space-2);text-decoration:none;color:inherit"><div style="width:36px;height:36px;background:var(--primary-gradient);border-radius:50%;display:flex;align-items:center;justify-content:center">👤</div><strong>${escape(rt.fromUser?.name || "Anonymous")}</strong></a><div>⭐ ${rt.score}/5</div></div>${rt.comment ? `<p style="color:var(--gray-600);font-size:0.9rem;font-style:italic;margin:0">"${escape(rt.comment)}"</p>` : ""}</div>`).join("")}</div></div>` : `<div style="padding:var(--space-6);background:var(--gray-50);border-radius:var(--radius-xl);text-align:center"><p style="color:var(--gray-500);margin:0">No reviews yet</p></div>`}
            ${isOwnProfile ? `<a href="/profile" class="btn btn--primary btn--full" data-link style="margin-top:var(--space-6)">✏️ Edit My Profile</a>` : ""}
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
              <div class="form-group"><label class="form-label">📝 Bio</label><textarea name="bio" class="form-textarea" placeholder="Tell players about yourself...">${escape(user.bio || "")}</textarea></div>
              <div class="form-group"><label class="form-label">🏆 My Sports</label>${SportSelector("checkbox", user.sports || [])}</div>
              <button type="submit" class="btn btn--primary btn--full btn--lg" style="margin-top:var(--space-4)">💾 Save Changes</button>
            </form>
            <div style="margin-top:var(--space-6);display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">
              <a href="/my-games" class="btn btn--outline" data-link>🎮 My Games</a>
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
          toast("success", "Saved! ✅");
        } catch (err) {
          toast("error", err.message);
        } finally {
          btn.disabled = false;
          btn.classList.remove("btn--loading");
        }
      };
    })
  );

  route(
    "/my-games",
    requireAuth(async () => {
      render(`
      <section class="section"><div class="container">
        <div class="page-header"><h2>🎮 My Games</h2></div>
        <div class="filters" id="filters">
          <button class="filter-btn active" data-f="all">All</button>
          <button class="filter-btn" data-f="host">Hosting</button>
          <button class="filter-btn" data-f="player">Playing</button>
        </div>
        <div class="grid grid--games" id="gamesList"><div class="loader"><div class="loader__ball">🏀</div></div></div>
      </div></section>`);
      let f = "all";
      async function load() {
        const list = $("#gamesList");
        list.innerHTML =
          '<div class="loader" style="grid-column:1/-1"><div class="loader__ball">🏀</div></div>';
        try {
          const p = { limit: 50 };
          if (f !== "all") p.role = f;
          const r = await Users.games(currentUser._id, p);
          list.innerHTML = r.data.games.length
            ? r.data.games.map(GameCard).join("")
            : '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">🎮</div><h3>No games</h3><a href="/games" class="btn btn--primary" data-link>Browse</a></div>';
        } catch (e) {
          list.innerHTML = `<p>${e.message}</p>`;
        }
      }
      $$(".filter-btn").forEach(
        (b) =>
          (b.onclick = () => {
            $$(".filter-btn").forEach((x) => x.classList.remove("active"));
            b.classList.add("active");
            f = b.dataset.f;
            load();
          })
      );
      load();
    })
  );
}
