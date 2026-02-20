/**
 * PAGE: home  (route: /)
 */
import { Games } from "../modules/api.js";
import { SPORTS } from "../modules/utils.js";
import { route, render } from "../modules/router.js";
import { currentUser } from "../modules/auth.js";
import { GameCard } from "../modules/components.js";

export function registerHomeRoute() {
  route("/", async () => {
    let games = [];
    try {
      const r = await Games.list({
        status: "upcoming",
        limit: 6,
        sortBy: "date",
        sortOrder: "asc",
      });
      games = r.data.games;
    } catch (_e) {
      // silently fail
    }
    render(`
      <section class="hero">
        <div class="container">
          <h1>Find Your Next <span style="color:var(--primary)">Game</span> 🏆</h1>
          <p>Connect with local athletes, join pickup games, and build your reputation!</p>
          <div class="hero__sports">${SPORTS.map((s) => `<div class="hero__sport" title="${s.name}" onclick="navigate('/games?sport=' + '${s.name}')" style="cursor:pointer">${s.emoji}</div>`).join("")}</div>
          <div class="hero__cta">
            <a href="/games" class="btn btn--primary btn--lg" data-link>🎮 Browse Games</a>
            ${!currentUser ? `<a href="/register" class="btn btn--outline btn--lg" data-link>✨ Join Now</a>` : `<a href="/games/create" class="btn btn--outline btn--lg" data-link>➕ Create Game</a>`}
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="page-header"><h2>🔥 Upcoming Games</h2><p>Jump into the action</p></div>
          ${games.length
            ? `<div class="grid grid--games">${games.map(GameCard).join("")}</div><div style="text-align:center;margin-top:var(--space-8)"><a href="/games" class="btn btn--outline" data-link>View All →</a></div>`
            : `<div class="empty-state"><div class="empty-state__icon">🎮</div><h3>No games yet</h3><p>Be the first!</p><a href="/games/create" class="btn btn--primary" data-link>Create Game</a></div>`}
        </div>
      </section>`);
  });
}
