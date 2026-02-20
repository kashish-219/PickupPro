/**
 * PAGE: ratings  (/ratings/pending)
 * Created by: Abhimanyu Dudeja
 */
import { Ratings } from "../modules/api.js";
import { getSport, escape, formatDate, $$ } from "../modules/utils.js";
import { route, render } from "../modules/router.js";
import { requireAuth } from "../modules/auth.js";
import { toast } from "../modules/toast.js";

export function registerRatingsRoute() {
  route(
    "/ratings/pending",
    requireAuth(async () => {
      const r = await Ratings.pending();
      const { pendingRatings } = r.data;
      render(`
      <section class="section"><div class="container" style="max-width:600px">
        <div class="page-header"><h2>⭐ Rate Players</h2><p>From completed games</p></div>
        ${
          pendingRatings.length
            ? pendingRatings
                .map(
                  (pr) => `
          <div class="card card--static" style="margin-bottom:var(--space-6)">
            <div class="card__header card__header--${pr.game.sport.toLowerCase()}" style="padding:var(--space-4)">
              <h4 style="color:white;margin:0">${getSport(pr.game.sport).emoji} ${escape(pr.game.title)}</h4>
              <p style="color:rgba(255,255,255,0.8);font-size:0.85rem;margin-top:var(--space-1)">${formatDate(pr.game.date)}</p>
              <div class="card__mascot" style="font-size:60px">${getSport(pr.game.sport).emoji}</div>
            </div>
            <div class="card__body">${pr.unratedPlayers
              .map(
                (p) => `
              <div class="rate-box" data-player="${p._id}" data-game="${pr.game._id}" style="padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl);margin-bottom:var(--space-4)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3)">
                  <div style="display:flex;align-items:center;gap:var(--space-3)"><div style="width:40px;height:40px;background:var(--primary-gradient);border-radius:50%;display:flex;align-items:center;justify-content:center">👤</div><strong>${escape(p.name)}</strong></div>
                  <div class="stars" style="display:flex;gap:2px;font-size:1.5rem">${[1, 2, 3, 4, 5].map((n) => `<span class="star" data-v="${n}" style="cursor:pointer;color:var(--gray-300)">★</span>`).join("")}</div>
                </div>
                <textarea class="form-textarea comment" placeholder="Comment (optional)" style="min-height:60px;margin-bottom:var(--space-3)"></textarea>
                <button class="btn btn--primary submit-rating">Submit ⭐</button>
              </div>`,
              )
              .join("")}
            </div>
          </div>`,
                )
                .join("")
            : `<div class="empty-state"><div class="empty-state__icon">⭐</div><h3>All done!</h3><p>No pending ratings</p><a href="/games" class="btn btn--primary" data-link>Browse Games</a></div>`
        }
      </div></section>`);
      $$(".star").forEach(
        (s) =>
          (s.onclick = () => {
            const v = +s.dataset.v;
            const box = s.closest(".rate-box");
            box
              .querySelectorAll(".star")
              .forEach(
                (st, i) =>
                  (st.style.color = i < v ? "#FFD700" : "var(--gray-300)"),
              );
            box.dataset.rating = v;
          }),
      );
      $$(".submit-rating").forEach(
        (btn) =>
          (btn.onclick = async () => {
            const box = btn.closest(".rate-box");
            const score = +box.dataset.rating;
            if (!score) {
              toast("warning", "Select a rating");
              return;
            }
            btn.disabled = true;
            btn.classList.add("btn--loading");
            try {
              await Ratings.create({
                gameId: box.dataset.game,
                toUserId: box.dataset.player,
                score,
                comment: box.querySelector(".comment").value,
              });
              toast("success", "Rated! ⭐");
              box.innerHTML =
                '<div style="text-align:center;padding:var(--space-4);color:var(--success)">Submitted!</div>';
            } catch (e) {
              toast("error", e.message);
              btn.disabled = false;
              btn.classList.remove("btn--loading");
            }
          }),
      );
    }),
  );
}