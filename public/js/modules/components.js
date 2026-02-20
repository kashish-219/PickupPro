/**
 * MODULE: components
 * Reusable UI component functions.
 */
import {
  SPORTS,
  getSport,
  escape,
  formatDate,
  formatTime,
  $$,
} from "./utils.js";

export function GameCard(g) {
  const s = getSport(g.sport);
  const cls = g.sport.toLowerCase();
  const pct = (g.playerCount / g.maxPlayers) * 100;
  const full = g.playerCount >= g.maxPlayers;
  const offset = 113 - (113 * pct) / 100;
  const statusCls =
    g.status === "completed" ? "completed" : full ? "full" : "open";
  const statusTxt = g.status === "completed" ? "Done" : full ? "Full" : "Open";
  const fillCls = pct >= 100 ? "full" : pct >= 75 ? "warning" : "";
  return `
    <div class="game-card game-card--${cls}" onclick="navigate('/games/${g._id}')">
      <div class="game-card__header">
        <div class="game-card__badge"><span>${s.emoji}</span> ${s.name}</div>
        <span class="game-card__status game-card__status--${statusCls}">${statusTxt}</span>
        <div class="game-card__mascot">${s.emoji}</div>
      </div>
      <div class="game-card__body">
        <h3 class="game-card__title">${escape(g.title)}</h3>
        <div class="game-card__info">
          <div class="game-card__info-row"><div class="game-card__info-icon">📍</div><div><strong>${escape(g.location?.name || "TBD")}</strong><br><span style="font-size:0.8rem;color:var(--gray-500)">${escape(g.location?.city || "")}</span></div></div>
          <div class="game-card__info-row"><div class="game-card__info-icon">📅</div><div><strong>${formatDate(g.date)}</strong><br><span style="font-size:0.8rem;color:var(--gray-500)">${formatTime(g.date)}</span></div></div>
        </div>
        <div class="game-card__players">
          <div class="game-card__avatars">${[1, 2, 3].map(() => '<div class="game-card__avatar">👤</div>').join("")}${g.playerCount > 3 ? `<div class="game-card__avatar game-card__avatar--more">+${g.playerCount - 3}</div>` : ""}</div>
          <div class="game-card__players-info"><div class="game-card__players-count">${g.playerCount}/${g.maxPlayers}</div><div class="game-card__players-label">Players</div></div>
          <svg class="game-card__progress" width="44" height="44"><circle class="game-card__progress-bg" cx="22" cy="22" r="18"/><circle class="game-card__progress-fill game-card__progress-fill--${fillCls}" cx="22" cy="22" r="18" style="stroke-dashoffset:${offset}"/></svg>
        </div>
        ${g.host ? `<div class="game-card__host"><div class="game-card__host-avatar">👤</div><div><div class="game-card__host-name">${escape(g.host.name)}</div><div class="game-card__host-rating">⭐ ${(g.host.rating?.avgRating || 0).toFixed(1)}</div></div></div>` : ""}
      </div>
      <div class="game-card__footer">
        <button class="game-card__cta game-card__cta--${full ? "view" : "join"}" onclick="event.stopPropagation();navigate('/games/${g._id}')">${full ? "👁️ View" : "🎮 Join"}</button>
      </div>
    </div>`;
}

export function PlayerCard(u) {
  return `
    <div class="player-card" onclick="navigate('/users/${u._id}')">
      <div class="player-card__avatar">👤</div>
      <h3 class="player-card__name">${escape(u.name)}</h3>
      <div class="player-card__rating"><span>⭐</span> ${(u.rating?.avgRating || 0).toFixed(1)} (${u.rating?.totalRatings || 0})</div>
      <div class="player-card__sports">${(u.sports || [])
        .slice(0, 4)
        .map(
          (s) => `<div class="player-card__sport">${getSport(s).emoji}</div>`
        )
        .join("")}</div>
    </div>`;
}

export function SportSelector(type = "radio", selected = []) {
  const inputType = type === "radio" ? "radio" : "checkbox";
  const name = type === "radio" ? "sport" : "sports";
  return `<div class="sport-grid">${SPORTS.map((s, i) => {
    const isActive = type === "radio" ? i === 0 : selected.includes(s.name);
    return `<label class="sport-item ${isActive ? "active" : ""}"><input type="${inputType}" name="${name}" value="${s.name}" ${isActive ? "checked" : ""} ${type === "radio" && i === 0 ? "required" : ""}><span class="sport-item__emoji">${s.emoji}</span><span class="sport-item__name">${s.name}</span></label>`;
  }).join("")}</div>`;
}

export function setupSportSelector() {
  $$(".sport-item").forEach((label) => {
    label.onclick = (e) => {
      const input = label.querySelector("input");
      const isRadio = input.type === "radio";
      if (e.target !== input) {
        if (isRadio) input.checked = true;
        else input.checked = !input.checked;
      }
      if (isRadio) {
        $$(".sport-item").forEach((l) => l.classList.remove("active"));
        label.classList.add("active");
      } else {
        label.classList.toggle("active", input.checked);
      }
    };
  });
}
