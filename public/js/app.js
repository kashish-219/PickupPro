/**
 * =========================================
 * PICKUPPRO - CONSISTENT CARD-BASED APP
 * =========================================
 */

const API = '/api';
const SPORTS = [
  { name: 'Basketball', emoji: '🏀', color: '#FF6B35' },
  { name: 'Soccer', emoji: '⚽', color: '#00D26A' },
  { name: 'Tennis', emoji: '🎾', color: '#FFE135' },
  { name: 'Volleyball', emoji: '🏐', color: '#A855F7' },
  { name: 'Baseball', emoji: '⚾', color: '#EF4444' },
  { name: 'Cricket', emoji: '🏏', color: '#06B6D4' },
  { name: 'Badminton', emoji: '🏸', color: '#3B82F6' },
  { name: 'Running', emoji: '🏃', color: '#F97316' },
  { name: 'Other', emoji: '🎯', color: '#8B5CF6' },
];

let currentUser = null;
const routes = [];

// Utilities
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const getSport = name => SPORTS.find(s => s.name === name) || { name, emoji: '🎯', color: '#8B5CF6' };
const escape = s => { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
const formatDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const formatTime = d => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// Floating balls HTML
const floatingBalls = `
  <div class="floating-balls">
    <span style="left:5%;top:15%;--d:7s;--t:0s">🏀</span>
    <span style="left:90%;top:20%;--d:8s;--t:1s">⚽</span>
    <span style="left:10%;top:70%;--d:6s;--t:2s">🎾</span>
    <span style="left:85%;top:75%;--d:9s;--t:0.5s">🏐</span>
    <span style="left:50%;top:10%;--d:7.5s;--t:1.5s">🏸</span>
    <span style="left:25%;top:85%;--d:8.5s;--t:2.5s">🎯</span>
  </div>
`;

// API
async function api(url, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API + url, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
}

const Auth = {
  register: d => api('/auth/register', { method: 'POST', body: JSON.stringify(d) }),
  login: d => api('/auth/login', { method: 'POST', body: JSON.stringify(d) }),
  me: () => api('/auth/me'),
};
const Games = {
  list: p => api('/games?' + new URLSearchParams(p)),
  get: id => api('/games/' + id),
  create: d => api('/games', { method: 'POST', body: JSON.stringify(d) }),
  update: (id, d) => api('/games/' + id, { method: 'PUT', body: JSON.stringify(d) }),
  delete: id => api('/games/' + id, { method: 'DELETE' }),
  join: id => api('/games/' + id + '/join', { method: 'POST' }),
  leave: id => api('/games/' + id + '/leave', { method: 'POST' }),
  complete: id => api('/games/' + id + '/complete', { method: 'PUT' }),
};
const Users = {
  list: p => api('/users?' + new URLSearchParams(p)),
  get: id => api('/users/' + id),
  update: (id, d) => api('/users/' + id, { method: 'PUT', body: JSON.stringify(d) }),
  games: (id, p) => api('/users/' + id + '/games?' + new URLSearchParams(p)),
};
const Ratings = {
  create: d => api('/ratings', { method: 'POST', body: JSON.stringify(d) }),
  pending: () => api('/ratings/pending'),
};

// Toast
function toast(type, title, msg = '') {
  const c = $('#toastContainer');
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `<span class="toast__icon">${icons[type]}</span><div class="toast__content"><div class="toast__title">${escape(title)}</div>${msg ? `<div class="toast__message">${escape(msg)}</div>` : ''}</div><button class="toast__close">✕</button>`;
  el.querySelector('.toast__close').onclick = () => el.remove();
  c.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// Router
function route(path, handler) {
  const names = [];
  const pattern = path.replace(/\//g, '\\/').replace(/:([^/]+)/g, (_, n) => { names.push(n); return '([^/]+)'; });
  routes.push({ pattern: new RegExp(`^${pattern}$`), names, handler });
}

function navigate(path, replace = false) {
  replace ? history.replaceState({}, '', path) : history.pushState({}, '', path);
  handleRoute();
}

async function handleRoute() {
  const path = location.pathname;
  const app = $('#app');
  app.innerHTML = `<div class="loader"><div class="loader__ball">🏀</div><p>Loading...</p></div>`;
  
  for (const r of routes) {
    const m = path.match(r.pattern);
    if (m) {
      const params = {};
      r.names.forEach((n, i) => params[n] = m[i + 1]);
      try { await r.handler(params); } catch (e) {
        console.error(e);
        app.innerHTML = `${floatingBalls}<div class="empty-state"><div class="empty-state__icon">😵</div><h3>Oops!</h3><p>${escape(e.message)}</p><a href="/" class="btn btn--primary" data-link>Go Home</a></div>`;
      }
      window.scrollTo(0, 0);
      return;
    }
  }
  app.innerHTML = `${floatingBalls}<div class="empty-state"><div class="empty-state__icon">🔍</div><h3>Not Found</h3><p>Page doesn't exist</p><a href="/" class="btn btn--primary" data-link>Go Home</a></div>`;
}

function render(html) { $('#app').innerHTML = floatingBalls + html; }

// Auth
async function initAuth() {
  if (localStorage.getItem('token')) {
    try { const r = await Auth.me(); currentUser = r.data.user; currentUser.stats = r.data.stats; }
    catch { localStorage.removeItem('token'); }
  }
  updateAuthUI();
}

function updateAuthUI() {
  const btns = $('#authButtons'), menu = $('#userMenu'), name = $('#userName');
  const authLinks = $$('.navbar__link--auth');
  if (currentUser) {
    btns.style.display = 'none';
    menu.style.display = 'block';
    name.textContent = currentUser.name.split(' ')[0];
    authLinks.forEach(el => el.style.display = 'flex');
  } else {
    btns.style.display = 'flex';
    menu.style.display = 'none';
    authLinks.forEach(el => el.style.display = 'none');
  }
}

function requireAuth(fn) {
  return async p => {
    if (!currentUser) { toast('warning', 'Please log in'); navigate('/login'); return; }
    return fn(p);
  };
}

// Components
function GameCard(g) {
  const s = getSport(g.sport);
  const cls = g.sport.toLowerCase();
  const pct = (g.playerCount / g.maxPlayers) * 100;
  const full = g.playerCount >= g.maxPlayers;
  const offset = 113 - (113 * pct / 100);
  const statusCls = g.status === 'completed' ? 'completed' : full ? 'full' : 'open';
  const statusTxt = g.status === 'completed' ? 'Done' : full ? 'Full' : 'Open';
  const fillCls = pct >= 100 ? 'full' : pct >= 75 ? 'warning' : '';
  
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
          <div class="game-card__info-row">
            <div class="game-card__info-icon">📍</div>
            <div><strong>${escape(g.location?.name || 'TBD')}</strong><br><span style="font-size:0.8rem;color:var(--gray-500)">${escape(g.location?.city || '')}</span></div>
          </div>
          <div class="game-card__info-row">
            <div class="game-card__info-icon">📅</div>
            <div><strong>${formatDate(g.date)}</strong><br><span style="font-size:0.8rem;color:var(--gray-500)">${formatTime(g.date)}</span></div>
          </div>
        </div>
        <div class="game-card__players">
          <div class="game-card__avatars">${[1,2,3].map(() => '<div class="game-card__avatar">👤</div>').join('')}${g.playerCount > 3 ? `<div class="game-card__avatar game-card__avatar--more">+${g.playerCount - 3}</div>` : ''}</div>
          <div class="game-card__players-info"><div class="game-card__players-count">${g.playerCount}/${g.maxPlayers}</div><div class="game-card__players-label">Players</div></div>
          <svg class="game-card__progress" width="44" height="44"><circle class="game-card__progress-bg" cx="22" cy="22" r="18"/><circle class="game-card__progress-fill game-card__progress-fill--${fillCls}" cx="22" cy="22" r="18" style="stroke-dashoffset:${offset}"/></svg>
        </div>
        ${g.host ? `<div class="game-card__host"><div class="game-card__host-avatar">👤</div><div><div class="game-card__host-name">${escape(g.host.name)}</div><div class="game-card__host-rating">⭐ ${(g.host.rating?.avgRating || 0).toFixed(1)}</div></div></div>` : ''}
      </div>
      <div class="game-card__footer">
        <button class="game-card__cta game-card__cta--${full ? 'view' : 'join'}" onclick="event.stopPropagation();navigate('/games/${g._id}')">${full ? '👁️ View' : '🎮 Join'}</button>
      </div>
    </div>
  `;
}

function PlayerCard(u) {
  return `
    <div class="player-card" onclick="navigate('/users/${u._id}')">
      <div class="player-card__avatar">👤</div>
      <h3 class="player-card__name">${escape(u.name)}</h3>
      <div class="player-card__rating"><span>⭐</span> ${(u.rating?.avgRating || 0).toFixed(1)} (${u.rating?.totalRatings || 0})</div>
      <div class="player-card__sports">${(u.sports || []).slice(0, 4).map(s => `<div class="player-card__sport">${getSport(s).emoji}</div>`).join('')}</div>
    </div>
  `;
}

function SportSelector(type = 'radio', selected = []) {
  const inputType = type === 'radio' ? 'radio' : 'checkbox';
  const name = type === 'radio' ? 'sport' : 'sports';
  return `<div class="sport-grid">${SPORTS.map((s, i) => {
    const isActive = type === 'radio' ? i === 0 : selected.includes(s.name);
    return `<label class="sport-item ${isActive ? 'active' : ''}"><input type="${inputType}" name="${name}" value="${s.name}" ${isActive ? 'checked' : ''} ${type === 'radio' && i === 0 ? 'required' : ''}><span class="sport-item__emoji">${s.emoji}</span><span class="sport-item__name">${s.name}</span></label>`;
  }).join('')}</div>`;
}

function setupSportSelector() {
  $$('.sport-item').forEach(label => {
    label.onclick = e => {
      const input = label.querySelector('input');
      const isRadio = input.type === 'radio';
      if (e.target !== input) {
        if (isRadio) input.checked = true;
        else input.checked = !input.checked;
      }
      if (isRadio) {
        $$('.sport-item').forEach(l => l.classList.remove('active'));
        label.classList.add('active');
      } else {
        label.classList.toggle('active', input.checked);
      }
    };
  });
}

// =========================================
// ROUTES
// =========================================

// HOME
route('/', async () => {
  let games = [];
  try { const r = await Games.list({ status: 'upcoming', limit: 6, sortBy: 'date', sortOrder: 'asc' }); games = r.data.games; } catch {}
  
  render(`
    <section class="hero">
      <div class="container">
        <h1>Find Your Next <span style="color:var(--primary)">Game</span> 🏆</h1>
        <p>Connect with local athletes, join pickup games, and build your reputation!</p>
        <div class="hero__sports">${SPORTS.map(s => `<div class="hero__sport" title="${s.name}">${s.emoji}</div>`).join('')}</div>
        <div class="hero__cta">
          <a href="/games" class="btn btn--primary btn--lg" data-link>🎮 Browse Games</a>
          ${!currentUser ? `<a href="/register" class="btn btn--outline btn--lg" data-link>✨ Join Now</a>` : `<a href="/games/create" class="btn btn--outline btn--lg" data-link>➕ Create Game</a>`}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="page-header"><h2>🔥 Upcoming Games</h2><p>Jump into the action</p></div>
        ${games.length ? `<div class="grid grid--games">${games.map(GameCard).join('')}</div><div style="text-align:center;margin-top:var(--space-8)"><a href="/games" class="btn btn--outline" data-link>View All →</a></div>` : `<div class="empty-state"><div class="empty-state__icon">🎮</div><h3>No games yet</h3><p>Be the first!</p><a href="/games/create" class="btn btn--primary" data-link>Create Game</a></div>`}
      </div>
    </section>
  `);
});

// GAMES
route('/games', async () => {
  render(`
    <section class="section">
      <div class="container">
        <div class="page-header"><h2>🎮 All Games</h2><p>Find your perfect match</p></div>
        <div class="filters" id="sportFilters">
          <button class="filter-btn active" data-sport="">All</button>
          ${SPORTS.map(s => `<button class="filter-btn" data-sport="${s.name}">${s.emoji} ${s.name}</button>`).join('')}
        </div>
        <div class="filter-bar">
          <div class="filter-bar__group"><label>Status</label><select id="filterStatus"><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="">All</option></select></div>
          <div class="filter-bar__group"><label>City</label><input type="text" id="filterCity" placeholder="Any city"></div>
          <div class="filter-bar__actions"><button class="btn btn--primary" id="searchBtn">🔍 Search</button></div>
        </div>
        <div class="grid grid--games" id="gamesList"><div class="loader"><div class="loader__ball">🏀</div></div></div>
      </div>
    </section>
  `);
  
  let sport = '';
  async function load() {
    const list = $('#gamesList');
    list.innerHTML = '<div class="loader" style="grid-column:1/-1"><div class="loader__ball">🏀</div></div>';
    try {
      const f = { sport, status: $('#filterStatus').value, city: $('#filterCity').value, limit: 20 };
      Object.keys(f).forEach(k => !f[k] && delete f[k]);
      const r = await Games.list(f);
      list.innerHTML = r.data.games.length ? r.data.games.map(GameCard).join('') : '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">🔍</div><h3>No games found</h3><p>Try different filters</p></div>';
    } catch (e) { list.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">😵</div><p>${e.message}</p></div>`; }
  }
  
  $$('.filter-btn').forEach(b => b.onclick = () => { $$('.filter-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); sport = b.dataset.sport; load(); });
  $('#searchBtn').onclick = load;
  load();
});

// CREATE GAME
route('/games/create', requireAuth(async () => {
  const minDate = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
  
  render(`
    <section class="section">
      <div class="container" style="max-width:550px">
        <div class="card card--static">
          <div class="card__header card__header--primary" style="padding:var(--space-8);text-align:center">
            <div style="font-size:3rem;margin-bottom:var(--space-2)">🎮</div>
            <h2 style="color:white;margin:0">Create a Game</h2>
            <p style="color:rgba(255,255,255,0.8);margin-top:var(--space-2)">Set up a game for others to join!</p>
            <div class="card__mascot">🏀</div>
          </div>
          <div class="card__body">
            <form id="createForm">
              <div class="form-group"><label class="form-label">🏆 Sport</label>${SportSelector('radio')}</div>
              <div class="form-group"><label class="form-label">✏️ Title</label><input type="text" name="title" class="form-input" placeholder="e.g., Sunday Basketball" required></div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
                <div class="form-group"><label class="form-label">📍 Location</label><input type="text" name="locationName" class="form-input" placeholder="Cabot Center" required></div>
                <div class="form-group"><label class="form-label">🏙️ City</label><input type="text" name="locationCity" class="form-input" placeholder="Boston" required></div>
              </div>
              <div class="form-group"><label class="form-label">🗺️ Address (optional)</label><input type="text" name="locationAddress" class="form-input" placeholder="123 Main St"></div>
              <div class="form-group"><label class="form-label">📅 Date & Time</label><input type="datetime-local" name="date" class="form-input" min="${minDate}" required></div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-4)">
                <div class="form-group"><label class="form-label">👥 Min</label><input type="number" name="minPlayers" class="form-input" value="4" min="2" style="text-align:center"></div>
                <div class="form-group"><label class="form-label">👥 Max</label><input type="number" name="maxPlayers" class="form-input" value="10" min="2" style="text-align:center"></div>
                <div class="form-group"><label class="form-label">🎯 Skill</label><select name="skillLevel" class="form-select"><option>All Levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
              </div>
              <div class="form-group"><label class="form-label">📝 Description</label><textarea name="description" class="form-textarea" placeholder="Any details..."></textarea></div>
              <div style="display:flex;gap:var(--space-4)">
                <a href="/games" class="btn btn--outline" style="flex:1" data-link>Cancel</a>
                <button type="submit" class="btn btn--primary" style="flex:2">🎮 Create!</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  `);
  
  setupSportSelector();
  
  $('#createForm').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const fd = new FormData(e.target);
    btn.disabled = true; btn.classList.add('btn--loading');
    try {
      const r = await Games.create({
        sport: fd.get('sport'), title: fd.get('title'),
        location: { name: fd.get('locationName'), city: fd.get('locationCity'), address: fd.get('locationAddress') },
        date: fd.get('date'), minPlayers: +fd.get('minPlayers'), maxPlayers: +fd.get('maxPlayers'),
        skillLevel: fd.get('skillLevel'), description: fd.get('description'),
      });
      toast('success', 'Game created! 🎉');
      navigate('/games/' + r.data._id);
    } catch (err) { toast('error', err.message); }
    finally { btn.disabled = false; btn.classList.remove('btn--loading'); }
  };
}));

// GAME DETAIL
route('/games/:id', async ({ id }) => {
  const r = await Games.get(id);
  const g = r.data;
  const s = getSport(g.sport);
  const cls = g.sport.toLowerCase();
  const isHost = currentUser && g.hostId === currentUser._id;
  const isPlayer = g.isPlayer;
  const isWaitlisted = g.isWaitlisted;
  const upcoming = g.status === 'upcoming' && new Date(g.date) > new Date();
  
  render(`
    <section class="section">
      <div class="container" style="max-width:850px">
        <a href="/games" class="btn btn--ghost" data-link style="margin-bottom:var(--space-4)">← Back to Games</a>
        <div class="card card--static">
          <div class="card__header card__header--${cls}" style="padding:var(--space-8);min-height:160px">
            <div style="position:relative;z-index:1">
              <div class="game-card__badge" style="margin-bottom:var(--space-3)"><span>${s.emoji}</span> ${s.name}</div>
              <h1 style="color:white;font-size:1.8rem;margin:0;text-shadow:0 2px 8px rgba(0,0,0,0.2)">${escape(g.title)}</h1>
              <p style="color:rgba(255,255,255,0.9);margin-top:var(--space-2);font-size:0.95rem">${g.status === 'completed' ? '✅ Completed' : g.status === 'cancelled' ? '❌ Cancelled' : '🟢 Upcoming'}</p>
            </div>
            <div class="card__mascot" style="font-size:130px">${s.emoji}</div>
          </div>
          <div class="card__body">
            <!-- Game Info Grid -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--space-4);margin-bottom:var(--space-6)">
              <div class="game-card__info-row">
                <div class="game-card__info-icon" style="width:48px;height:48px;font-size:1.3rem">📍</div>
                <div>
                  <strong>${escape(g.location.name)}</strong><br>
                  <span style="color:var(--gray-500);font-size:0.85rem">${escape(g.location.address || g.location.city)}</span>
                </div>
              </div>
              <div class="game-card__info-row">
                <div class="game-card__info-icon" style="width:48px;height:48px;font-size:1.3rem">📅</div>
                <div>
                  <strong>${formatDate(g.date)}</strong><br>
                  <span style="color:var(--gray-500);font-size:0.85rem">${formatTime(g.date)}</span>
                </div>
              </div>
              <div class="game-card__info-row">
                <div class="game-card__info-icon" style="width:48px;height:48px;font-size:1.3rem">👥</div>
                <div>
                  <strong>${g.playerCount}/${g.maxPlayers} Players</strong><br>
                  <span style="color:var(--gray-500);font-size:0.85rem">${g.spotsAvailable} spots left</span>
                </div>
              </div>
              <div class="game-card__info-row">
                <div class="game-card__info-icon" style="width:48px;height:48px;font-size:1.3rem">🎯</div>
                <div>
                  <strong>${g.skillLevel || 'All Levels'}</strong><br>
                  <span style="color:var(--gray-500);font-size:0.85rem">Skill Level</span>
                </div>
              </div>
            </div>
            
            ${g.description ? `<div style="padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl);margin-bottom:var(--space-6)"><p style="color:var(--gray-600);margin:0">${escape(g.description)}</p></div>` : ''}
            
            <!-- Host Section -->
            <div style="margin-bottom:var(--space-6)">
              <h3 style="font-size:1.1rem;margin-bottom:var(--space-4);display:flex;align-items:center;gap:var(--space-2)">
                <span style="font-size:1.3rem">🎖️</span> Game Host
              </h3>
              <a href="/users/${g.host._id}" data-link class="player-row" style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4);background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1));border-radius:var(--radius-xl);text-decoration:none;transition:var(--transition);border:2px solid transparent;">
                <div style="width:56px;height:56px;background:var(--primary-gradient);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0">👤</div>
                <div style="flex:1">
                  <div style="font-weight:700;font-size:1.05rem;color:var(--gray-900)">${escape(g.host.name)}</div>
                  <div style="display:flex;align-items:center;gap:var(--space-2);margin-top:var(--space-1)">
                    <span style="color:#FFD700;font-size:1.1rem">⭐</span>
                    <span style="font-weight:600;color:var(--gray-700)">${(g.host.rating?.avgRating || 0).toFixed(1)}</span>
                    <span style="color:var(--gray-500);font-size:0.85rem">(${g.host.rating?.totalRatings || 0} reviews)</span>
                  </div>
                </div>
                <div style="color:var(--primary);font-size:0.85rem;font-weight:600">View Profile →</div>
              </a>
            </div>
            
            <!-- Players Section -->
            <div style="margin-bottom:var(--space-6)">
              <h3 style="font-size:1.1rem;margin-bottom:var(--space-4);display:flex;align-items:center;gap:var(--space-2)">
                <span style="font-size:1.3rem">👥</span> Players (${g.playerCount}/${g.maxPlayers})
              </h3>
              ${g.players.length > 0 ? `
                <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                  ${g.players.map((p, i) => `
                    <a href="/users/${p._id}" data-link class="player-row" style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl);text-decoration:none;transition:var(--transition);border:2px solid transparent;">
                      <div style="width:12px;font-weight:700;color:var(--gray-400);font-size:0.85rem">${i + 1}</div>
                      <div style="width:44px;height:44px;background:${i % 2 === 0 ? 'var(--soccer-gradient)' : 'var(--basketball-gradient)'};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">👤</div>
                      <div style="flex:1">
                        <div style="font-weight:600;color:var(--gray-900)">${escape(p.name)}</div>
                        <div style="display:flex;align-items:center;gap:var(--space-1);margin-top:2px">
                          <span style="color:#FFD700">⭐</span>
                          <span style="font-size:0.85rem;color:var(--gray-600)">${(p.rating?.avgRating || 0).toFixed(1)} (${p.rating?.totalRatings || 0})</span>
                        </div>
                      </div>
                      <div style="color:var(--gray-400);font-size:1.2rem">→</div>
                    </a>
                  `).join('')}
                </div>
              ` : `
                <div style="padding:var(--space-6);background:var(--gray-50);border-radius:var(--radius-xl);text-align:center">
                  <div style="font-size:2.5rem;margin-bottom:var(--space-2)">🏃</div>
                  <p style="color:var(--gray-500);margin:0">No players yet. Be the first to join!</p>
                </div>
              `}
            </div>
            
            <!-- Waitlist Section -->
            ${g.waitlist.length > 0 ? `
              <div style="margin-bottom:var(--space-6)">
                <h3 style="font-size:1.1rem;margin-bottom:var(--space-4);display:flex;align-items:center;gap:var(--space-2)">
                  <span style="font-size:1.3rem">⏳</span> Waitlist (${g.waitlistCount})
                </h3>
                <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                  ${g.waitlist.map((p, i) => `
                    <a href="/users/${p._id}" data-link class="player-row" style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4);background:#FEF3C7;border-radius:var(--radius-xl);text-decoration:none;transition:var(--transition);border:2px solid transparent;">
                      <div style="width:24px;height:24px;background:var(--warning);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700">${i + 1}</div>
                      <div style="width:40px;height:40px;background:var(--other-gradient);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0">👤</div>
                      <div style="flex:1">
                        <div style="font-weight:600;color:var(--gray-900)">${escape(p.name)}</div>
                        <div style="display:flex;align-items:center;gap:var(--space-1);margin-top:2px">
                          <span style="color:#FFD700">⭐</span>
                          <span style="font-size:0.85rem;color:var(--gray-600)">${(p.rating?.avgRating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                      <div style="color:var(--gray-400);font-size:1.2rem">→</div>
                    </a>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <!-- Action Buttons -->
            <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);padding-top:var(--space-4);border-top:2px dashed var(--gray-200)">
              ${upcoming ? (isHost ? `
                <a href="/games/${g._id}/edit" class="btn btn--outline" data-link>✏️ Edit Game</a>
                <button class="btn btn--success" id="completeBtn">✅ Mark Complete</button>
                <button class="btn btn--danger" id="cancelBtn">❌ Cancel Game</button>
              ` : isPlayer ? `
                <button class="btn btn--outline" id="leaveBtn">👋 Leave Game</button>
              ` : isWaitlisted ? `
                <button class="btn btn--outline" id="leaveBtn">Leave Waitlist</button>
                <span style="padding:var(--space-3) var(--space-4);background:#FEF3C7;border-radius:var(--radius-lg);font-weight:600">⏳ #${g.waitlistPosition} on waitlist</span>
              ` : currentUser ? `
                <button class="btn btn--primary btn--lg" id="joinBtn">${g.isFull ? '📝 Join Waitlist' : '🎮 Join Game'}</button>
              ` : `
                <a href="/login" class="btn btn--primary btn--lg" data-link>🔐 Login to Join</a>
              `) : ''}
              ${g.status === 'completed' && (isHost || isPlayer) ? `
                <a href="/ratings/pending" class="btn btn--primary" data-link>⭐ Rate Players</a>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <style>
      .player-row:hover {
        border-color: var(--primary) !important;
        transform: translateX(4px);
        background: var(--white) !important;
      }
    </style>
  `);
  
  const joinBtn = $('#joinBtn'), leaveBtn = $('#leaveBtn'), completeBtn = $('#completeBtn'), cancelBtn = $('#cancelBtn');
  if (joinBtn) joinBtn.onclick = async () => { joinBtn.disabled = true; joinBtn.classList.add('btn--loading'); try { const res = await Games.join(g._id); toast('success', res.message || 'Joined! 🎉'); navigate('/games/' + g._id); } catch (e) { toast('error', e.message); joinBtn.disabled = false; joinBtn.classList.remove('btn--loading'); } };
  if (leaveBtn) leaveBtn.onclick = async () => { if (!confirm('Are you sure you want to leave?')) return; leaveBtn.disabled = true; try { await Games.leave(g._id); toast('success', 'You left the game'); navigate('/games/' + g._id); } catch (e) { toast('error', e.message); } };
  if (completeBtn) completeBtn.onclick = async () => { if (!confirm('Mark this game as completed?')) return; try { await Games.complete(g._id); toast('success', 'Game completed! Time to rate players ⭐'); navigate('/games/' + g._id); } catch (e) { toast('error', e.message); } };
  if (cancelBtn) cancelBtn.onclick = async () => { if (!confirm('Are you sure you want to cancel this game?')) return; try { await Games.delete(g._id); toast('success', 'Game cancelled'); navigate('/games'); } catch (e) { toast('error', e.message); } };
});

// EDIT GAME
route('/games/:id/edit', requireAuth(async ({ id }) => {
  const r = await Games.get(id);
  const g = r.data;
  if (g.hostId !== currentUser._id) { toast('error', 'Not authorized'); navigate('/games/' + id); return; }
  const dateVal = new Date(g.date); dateVal.setMinutes(dateVal.getMinutes() - dateVal.getTimezoneOffset());
  
  render(`
    <section class="section">
      <div class="container" style="max-width:550px">
        <div class="card card--static">
          <div class="card__header card__header--${g.sport.toLowerCase()}" style="padding:var(--space-6);text-align:center">
            <h2 style="color:white;margin:0">✏️ Edit Game</h2>
            <div class="card__mascot" style="font-size:80px">${getSport(g.sport).emoji}</div>
          </div>
          <div class="card__body">
            <form id="editForm">
              <div class="form-group"><label class="form-label">🏆 Sport</label><div class="sport-grid">${SPORTS.map(s => `<label class="sport-item ${s.name === g.sport ? 'active' : ''}"><input type="radio" name="sport" value="${s.name}" ${s.name === g.sport ? 'checked' : ''} required><span class="sport-item__emoji">${s.emoji}</span><span class="sport-item__name">${s.name}</span></label>`).join('')}</div></div>
              <div class="form-group"><label class="form-label">✏️ Title</label><input type="text" name="title" class="form-input" value="${escape(g.title)}" required></div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
                <div class="form-group"><label class="form-label">📍 Location</label><input type="text" name="locationName" class="form-input" value="${escape(g.location.name)}" required></div>
                <div class="form-group"><label class="form-label">🏙️ City</label><input type="text" name="locationCity" class="form-input" value="${escape(g.location.city)}" required></div>
              </div>
              <div class="form-group"><label class="form-label">🗺️ Address</label><input type="text" name="locationAddress" class="form-input" value="${escape(g.location.address || '')}"></div>
              <div class="form-group"><label class="form-label">📅 Date & Time</label><input type="datetime-local" name="date" class="form-input" value="${dateVal.toISOString().slice(0, 16)}" required></div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-4)">
                <div class="form-group"><label class="form-label">👥 Min</label><input type="number" name="minPlayers" class="form-input" value="${g.minPlayers}" min="2" style="text-align:center"></div>
                <div class="form-group"><label class="form-label">👥 Max</label><input type="number" name="maxPlayers" class="form-input" value="${g.maxPlayers}" min="${g.playerCount}" style="text-align:center"></div>
                <div class="form-group"><label class="form-label">🎯 Skill</label><select name="skillLevel" class="form-select"><option ${g.skillLevel === 'All Levels' ? 'selected' : ''}>All Levels</option><option ${g.skillLevel === 'Beginner' ? 'selected' : ''}>Beginner</option><option ${g.skillLevel === 'Intermediate' ? 'selected' : ''}>Intermediate</option><option ${g.skillLevel === 'Advanced' ? 'selected' : ''}>Advanced</option></select></div>
              </div>
              <div class="form-group"><label class="form-label">📝 Description</label><textarea name="description" class="form-textarea">${escape(g.description || '')}</textarea></div>
              <div style="display:flex;gap:var(--space-4)">
                <a href="/games/${g._id}" class="btn btn--outline" style="flex:1" data-link>Cancel</a>
                <button type="submit" class="btn btn--primary" style="flex:2">💾 Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  `);
  
  setupSportSelector();
  
  $('#editForm').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const fd = new FormData(e.target);
    btn.disabled = true; btn.classList.add('btn--loading');
    try {
      await Games.update(id, {
        sport: fd.get('sport'), title: fd.get('title'),
        location: { name: fd.get('locationName'), city: fd.get('locationCity'), address: fd.get('locationAddress') },
        date: fd.get('date'), minPlayers: +fd.get('minPlayers'), maxPlayers: +fd.get('maxPlayers'),
        skillLevel: fd.get('skillLevel'), description: fd.get('description'),
      });
      toast('success', 'Saved! ✅');
      navigate('/games/' + id);
    } catch (err) { toast('error', err.message); }
    finally { btn.disabled = false; btn.classList.remove('btn--loading'); }
  };
}));

// PLAYERS
route('/players', async () => {
  render(`
    <section class="section">
      <div class="container">
        <div class="page-header"><h2>👥 Find Players</h2><p>Discover the community</p></div>
        <div class="filter-bar">
          <div class="filter-bar__group"><label>Search</label><input type="text" id="searchName" placeholder="Name"></div>
          <div class="filter-bar__group"><label>Sport</label><select id="filterSport"><option value="">All</option>${SPORTS.map(s => `<option value="${s.name}">${s.emoji} ${s.name}</option>`).join('')}</select></div>
          <div class="filter-bar__actions"><button class="btn btn--primary" id="searchBtn">🔍</button></div>
        </div>
        <div class="grid grid--players" id="playersList"><div class="loader"><div class="loader__ball">🏀</div></div></div>
      </div>
    </section>
  `);
  
  async function load() {
    const list = $('#playersList');
    list.innerHTML = '<div class="loader" style="grid-column:1/-1"><div class="loader__ball">🏀</div></div>';
    try {
      const r = await Users.list({ search: $('#searchName').value, sport: $('#filterSport').value, limit: 20 });
      list.innerHTML = r.data.users.length ? r.data.users.map(PlayerCard).join('') : '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">👥</div><h3>No players</h3></div>';
    } catch (e) { list.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>${e.message}</p></div>`; }
  }
  
  $('#searchBtn').onclick = load;
  $('#searchName').onkeypress = e => e.key === 'Enter' && load();
  load();
});

// USER PROFILE
route('/users/:id', async ({ id }) => {
  const r = await Users.get(id);
  const { user, stats, recentRatings } = r.data;
  const isOwnProfile = currentUser && currentUser._id === id;
  
  render(`
    <section class="section">
      <div class="container" style="max-width:650px">
        <a href="/players" class="btn btn--ghost" data-link style="margin-bottom:var(--space-4)">← Back to Players</a>
        
        <div class="card card--static">
          <div class="card__header card__header--primary" style="padding:var(--space-8);min-height:200px;text-align:center">
            <div style="position:relative;z-index:1">
              <div style="width:110px;height:110px;margin:0 auto var(--space-3);background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:3.5rem;box-shadow:0 8px 24px rgba(0,0,0,0.2)">👤</div>
              <h1 style="color:white;margin:0;font-size:1.8rem">${escape(user.name)}</h1>
              <div style="display:flex;align-items:center;justify-content:center;gap:var(--space-2);margin-top:var(--space-2)">
                <span style="font-size:1.3rem">⭐</span>
                <span style="color:white;font-size:1.1rem;font-weight:600">${stats.avgRating.toFixed(1)}</span>
                <span style="color:rgba(255,255,255,0.8)">(${stats.totalRatings} reviews)</span>
              </div>
            </div>
            <div class="card__mascot" style="font-size:110px">🏆</div>
          </div>
          
          <div class="card__body">
            <!-- Stats Grid -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-3);margin-bottom:var(--space-6)">
              <div style="text-align:center;padding:var(--space-4);background:var(--basketball-gradient);border-radius:var(--radius-xl);color:white">
                <div style="font-size:1.8rem;font-weight:700">${stats.avgRating.toFixed(1)}</div>
                <div style="font-size:0.7rem;opacity:0.9">⭐ RATING</div>
              </div>
              <div style="text-align:center;padding:var(--space-4);background:var(--soccer-gradient);border-radius:var(--radius-xl);color:white">
                <div style="font-size:1.8rem;font-weight:700">${stats.totalRatings}</div>
                <div style="font-size:0.7rem;opacity:0.9">REVIEWS</div>
              </div>
              <div style="text-align:center;padding:var(--space-4);background:var(--volleyball-gradient);border-radius:var(--radius-xl);color:white">
                <div style="font-size:1.8rem;font-weight:700">${stats.gamesHosted}</div>
                <div style="font-size:0.7rem;opacity:0.9">HOSTED</div>
              </div>
              <div style="text-align:center;padding:var(--space-4);background:var(--badminton-gradient);border-radius:var(--radius-xl);color:white">
                <div style="font-size:1.8rem;font-weight:700">${stats.gamesPlayed}</div>
                <div style="font-size:0.7rem;opacity:0.9">PLAYED</div>
              </div>
            </div>
            
            <!-- Bio -->
            ${user.bio ? `
              <div style="padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl);margin-bottom:var(--space-6)">
                <h4 style="font-size:0.9rem;color:var(--gray-500);margin-bottom:var(--space-2)">📝 About</h4>
                <p style="color:var(--gray-700);margin:0;line-height:1.6">${escape(user.bio)}</p>
              </div>
            ` : ''}
            
            <!-- Sports -->
            <div style="margin-bottom:var(--space-6)">
              <h4 style="font-size:1rem;margin-bottom:var(--space-3);display:flex;align-items:center;gap:var(--space-2)">
                <span>🏆</span> Sports
              </h4>
              ${(user.sports && user.sports.length > 0) ? `
                <div style="display:flex;flex-wrap:wrap;gap:var(--space-3)">
                  ${user.sports.map(s => {
                    const sport = getSport(s);
                    return `
                      <div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4);background:var(--gray-100);border-radius:var(--radius-full)">
                        <span style="font-size:1.3rem">${sport.emoji}</span>
                        <span style="font-weight:600">${sport.name}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : `
                <p style="color:var(--gray-500)">No sports selected yet</p>
              `}
            </div>
            
            <!-- Recent Ratings -->
            ${recentRatings && recentRatings.length > 0 ? `
              <div style="padding-top:var(--space-6);border-top:2px dashed var(--gray-200)">
                <h4 style="font-size:1rem;margin-bottom:var(--space-4);display:flex;align-items:center;gap:var(--space-2)">
                  <span>⭐</span> Recent Reviews
                </h4>
                <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                  ${recentRatings.map(rt => `
                    <div style="padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl)">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2)">
                        <a href="/users/${rt.fromUser?._id}" data-link style="display:flex;align-items:center;gap:var(--space-2);text-decoration:none;color:inherit">
                          <div style="width:36px;height:36px;background:var(--primary-gradient);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem">👤</div>
                          <strong style="font-size:0.95rem">${escape(rt.fromUser?.name || 'Anonymous')}</strong>
                        </a>
                        <div style="display:flex;align-items:center;gap:var(--space-1)">
                          <span style="color:#FFD700;font-size:1.1rem">${'⭐'.repeat(rt.score)}</span>
                          <span style="color:var(--gray-400)">${'☆'.repeat(5 - rt.score)}</span>
                        </div>
                      </div>
                      ${rt.comment ? `<p style="color:var(--gray-600);font-size:0.9rem;font-style:italic;margin:0;padding-left:var(--space-6)">"${escape(rt.comment)}"</p>` : ''}
                      ${rt.game ? `<p style="font-size:0.8rem;color:var(--gray-400);margin:var(--space-2) 0 0 0;padding-left:var(--space-6)">From: ${escape(rt.game.title)}</p>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : `
              <div style="padding:var(--space-6);background:var(--gray-50);border-radius:var(--radius-xl);text-align:center">
                <div style="font-size:2rem;margin-bottom:var(--space-2)">⭐</div>
                <p style="color:var(--gray-500);margin:0">No reviews yet</p>
              </div>
            `}
            
            ${isOwnProfile ? `
              <a href="/profile" class="btn btn--primary btn--full" data-link style="margin-top:var(--space-6)">
                ✏️ Edit My Profile
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    </section>
  `);
});

// MY PROFILE
route('/profile', requireAuth(async () => {
  const r = await Users.get(currentUser._id);
  const { user, stats, recentRatings } = r.data;
  
  render(`
    <section class="section">
      <div class="container" style="max-width:600px">
        <div class="card card--static">
          <div class="card__header card__header--primary" style="padding:var(--space-8);min-height:180px;text-align:center">
            <div style="position:relative;z-index:1">
              <div style="width:100px;height:100px;margin:0 auto var(--space-3);background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:3rem;box-shadow:0 8px 24px rgba(0,0,0,0.2)">👤</div>
              <h2 style="color:white;margin:0;font-size:1.6rem">${escape(user.name)}</h2>
              <p style="color:rgba(255,255,255,0.9);margin-top:var(--space-2)">
                <span style="font-size:1.2rem">⭐</span> ${stats.avgRating.toFixed(1)} rating • ${stats.totalRatings} reviews
              </p>
            </div>
            <div class="card__mascot" style="font-size:100px">🏆</div>
          </div>
          
          <div class="card__body">
            <!-- Stats Grid -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-3);margin-bottom:var(--space-6)">
              <div style="text-align:center;padding:var(--space-4);background:var(--basketball-gradient);border-radius:var(--radius-xl);color:white">
                <div style="font-size:1.8rem;font-weight:700">${stats.avgRating.toFixed(1)}</div>
                <div style="font-size:0.7rem;opacity:0.9">⭐ RATING</div>
              </div>
              <div style="text-align:center;padding:var(--space-4);background:var(--soccer-gradient);border-radius:var(--radius-xl);color:white">
                <div style="font-size:1.8rem;font-weight:700">${stats.totalRatings}</div>
                <div style="font-size:0.7rem;opacity:0.9">REVIEWS</div>
              </div>
              <div style="text-align:center;padding:var(--space-4);background:var(--volleyball-gradient);border-radius:var(--radius-xl);color:white">
                <div style="font-size:1.8rem;font-weight:700">${stats.gamesHosted}</div>
                <div style="font-size:0.7rem;opacity:0.9">HOSTED</div>
              </div>
              <div style="text-align:center;padding:var(--space-4);background:var(--badminton-gradient);border-radius:var(--radius-xl);color:white">
                <div style="font-size:1.8rem;font-weight:700">${stats.gamesPlayed}</div>
                <div style="font-size:0.7rem;opacity:0.9">PLAYED</div>
              </div>
            </div>
            
            <!-- Edit Profile Form -->
            <form id="profileForm">
              <div class="form-group">
                <label class="form-label">👤 Display Name</label>
                <input type="text" name="name" class="form-input" value="${escape(user.name)}" required minlength="2">
              </div>
              
              <div class="form-group">
                <label class="form-label">📝 Bio</label>
                <textarea name="bio" class="form-textarea" placeholder="Tell other players about yourself... What's your playing style? Experience level?">${escape(user.bio || '')}</textarea>
              </div>
              
              <div class="form-group">
                <label class="form-label">🏆 My Sports</label>
                <p style="font-size:0.85rem;color:var(--gray-500);margin-bottom:var(--space-3)">Select the sports you play</p>
                ${SportSelector('checkbox', user.sports || [])}
              </div>
              
              <button type="submit" class="btn btn--primary btn--full btn--lg" style="margin-top:var(--space-4)">
                💾 Save Changes
              </button>
            </form>
            
            <!-- Recent Ratings Section -->
            ${recentRatings && recentRatings.length > 0 ? `
              <div style="margin-top:var(--space-8);padding-top:var(--space-6);border-top:2px dashed var(--gray-200)">
                <h3 style="font-size:1.1rem;margin-bottom:var(--space-4);display:flex;align-items:center;gap:var(--space-2)">
                  <span style="font-size:1.3rem">⭐</span> Recent Reviews
                </h3>
                <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                  ${recentRatings.slice(0, 3).map(rt => `
                    <div style="padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl)">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2)">
                        <div style="display:flex;align-items:center;gap:var(--space-2)">
                          <div style="width:32px;height:32px;background:var(--primary-gradient);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.9rem">👤</div>
                          <strong style="font-size:0.9rem">${escape(rt.fromUser?.name || 'Anonymous')}</strong>
                        </div>
                        <div style="color:#FFD700">${'⭐'.repeat(rt.score)}</div>
                      </div>
                      ${rt.comment ? `<p style="color:var(--gray-600);font-size:0.9rem;font-style:italic;margin:0">"${escape(rt.comment)}"</p>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <!-- Quick Links -->
            <div style="margin-top:var(--space-6);display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">
              <a href="/my-games" class="btn btn--outline" data-link style="display:flex;align-items:center;justify-content:center;gap:var(--space-2)">
                🎮 My Games
              </a>
              <a href="/ratings/pending" class="btn btn--outline" data-link style="display:flex;align-items:center;justify-content:center;gap:var(--space-2)">
                ⭐ Rate Players
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `);
  
  setupSportSelector();
  
  $('#profileForm').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const fd = new FormData(e.target);
    btn.disabled = true; btn.classList.add('btn--loading');
    try {
      await Users.update(currentUser._id, { name: fd.get('name'), bio: fd.get('bio'), sports: fd.getAll('sports') });
      currentUser.name = fd.get('name');
      updateAuthUI();
      toast('success', 'Profile saved! ✅');
    } catch (err) { toast('error', err.message); }
    finally { btn.disabled = false; btn.classList.remove('btn--loading'); }
  };
}));

// MY GAMES
route('/my-games', requireAuth(async () => {
  render(`
    <section class="section">
      <div class="container">
        <div class="page-header"><h2>🎮 My Games</h2></div>
        <div class="filters" id="filters">
          <button class="filter-btn active" data-f="all">All</button>
          <button class="filter-btn" data-f="host">Hosting</button>
          <button class="filter-btn" data-f="player">Playing</button>
        </div>
        <div class="grid grid--games" id="gamesList"><div class="loader"><div class="loader__ball">🏀</div></div></div>
      </div>
    </section>
  `);
  
  let f = 'all';
  async function load() {
    const list = $('#gamesList');
    list.innerHTML = '<div class="loader" style="grid-column:1/-1"><div class="loader__ball">🏀</div></div>';
    try {
      const p = { limit: 50 }; if (f !== 'all') p.role = f;
      const r = await Users.games(currentUser._id, p);
      list.innerHTML = r.data.games.length ? r.data.games.map(GameCard).join('') : '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">🎮</div><h3>No games</h3><a href="/games" class="btn btn--primary" data-link>Browse</a></div>';
    } catch (e) { list.innerHTML = `<p>${e.message}</p>`; }
  }
  
  $$('.filter-btn').forEach(b => b.onclick = () => { $$('.filter-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); f = b.dataset.f; load(); });
  load();
}));

// LOGIN
route('/login', async () => {
  if (currentUser) { navigate('/'); return; }
  
  render(`
    <section class="section">
      <div class="container" style="max-width:420px">
        <div class="card card--static">
          <div class="card__header card__header--basketball" style="padding:var(--space-8);text-align:center">
            <div style="font-size:3rem;margin-bottom:var(--space-2)">👋</div>
            <h2 style="color:white;margin:0">Welcome Back!</h2>
            <div class="card__mascot" style="font-size:80px">🏀</div>
          </div>
          <div class="card__body">
            <form id="loginForm">
              <div class="form-group"><label class="form-label">📧 Email</label><input type="email" name="email" class="form-input" placeholder="you@example.com" required></div>
              <div class="form-group"><label class="form-label">🔐 Password</label><input type="password" name="password" class="form-input" placeholder="••••••••" required></div>
              <button type="submit" class="btn btn--primary btn--full btn--lg">🎮 Let's Play!</button>
            </form>
            <div style="text-align:center;margin-top:var(--space-6);padding-top:var(--space-6);border-top:2px dashed var(--gray-200)">
              <p style="color:var(--gray-500);margin-bottom:var(--space-4)">New here? <a href="/register" data-link style="color:var(--primary);font-weight:700">Join! 🌟</a></p>
              <div style="padding:var(--space-3);background:var(--gray-50);border-radius:var(--radius-lg)">
                <p style="font-size:0.8rem;color:var(--gray-600)"><strong>🎯 Demo:</strong> demo@pickuppro.com / demo123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `);
  
  $('#loginForm').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const fd = new FormData(e.target);
    btn.disabled = true; btn.classList.add('btn--loading');
    try {
      const r = await Auth.login({ email: fd.get('email'), password: fd.get('password') });
      localStorage.setItem('token', r.data.token);
      currentUser = r.data.user;
      updateAuthUI();
      toast('success', 'Welcome back! 🎉');
      navigate('/');
    } catch (err) { toast('error', err.message); }
    finally { btn.disabled = false; btn.classList.remove('btn--loading'); }
  };
});

// REGISTER
route('/register', async () => {
  if (currentUser) { navigate('/'); return; }
  
  render(`
    <section class="section">
      <div class="container" style="max-width:480px">
        <div class="card card--static">
          <div class="card__header card__header--soccer" style="padding:var(--space-8);text-align:center">
            <div style="font-size:3rem;margin-bottom:var(--space-2)">🎉</div>
            <h2 style="color:white;margin:0">Join PickupPro!</h2>
            <div class="card__mascot" style="font-size:80px">⚽</div>
          </div>
          <div class="card__body">
            <form id="registerForm">
              <div class="form-group"><label class="form-label">👤 Name</label><input type="text" name="name" class="form-input" placeholder="Your name" required minlength="2"></div>
              <div class="form-group"><label class="form-label">📧 Email</label><input type="email" name="email" class="form-input" placeholder="you@example.com" required></div>
              <div class="form-group"><label class="form-label">🔐 Password</label><input type="password" name="password" class="form-input" placeholder="Min 6 characters" required minlength="6"></div>
              <div class="form-group"><label class="form-label">🏆 Favorite Sports</label>${SportSelector('checkbox')}</div>
              <button type="submit" class="btn btn--primary btn--full btn--lg">✨ Create Account</button>
            </form>
            <div style="text-align:center;margin-top:var(--space-6);padding-top:var(--space-6);border-top:2px dashed var(--gray-200)">
              <p style="color:var(--gray-500)">Have account? <a href="/login" data-link style="color:var(--primary);font-weight:700">Log in! 🚀</a></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `);
  
  setupSportSelector();
  
  $('#registerForm').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const fd = new FormData(e.target);
    btn.disabled = true; btn.classList.add('btn--loading');
    try {
      const r = await Auth.register({ name: fd.get('name'), email: fd.get('email'), password: fd.get('password'), sports: fd.getAll('sports') });
      localStorage.setItem('token', r.data.token);
      currentUser = r.data.user;
      updateAuthUI();
      toast('success', 'Welcome! 🎉');
      navigate('/');
    } catch (err) { toast('error', err.message); }
    finally { btn.disabled = false; btn.classList.remove('btn--loading'); }
  };
});

// PENDING RATINGS
route('/ratings/pending', requireAuth(async () => {
  const r = await Ratings.pending();
  const { pendingRatings } = r.data;
  
  render(`
    <section class="section">
      <div class="container" style="max-width:600px">
        <div class="page-header"><h2>⭐ Rate Players</h2><p>From completed games</p></div>
        ${pendingRatings.length ? pendingRatings.map(pr => `
          <div class="card card--static" style="margin-bottom:var(--space-6)">
            <div class="card__header card__header--${pr.game.sport.toLowerCase()}" style="padding:var(--space-4)">
              <h4 style="color:white;margin:0">${getSport(pr.game.sport).emoji} ${escape(pr.game.title)}</h4>
              <p style="color:rgba(255,255,255,0.8);font-size:0.85rem;margin-top:var(--space-1)">${formatDate(pr.game.date)}</p>
              <div class="card__mascot" style="font-size:60px">${getSport(pr.game.sport).emoji}</div>
            </div>
            <div class="card__body">${pr.unratedPlayers.map(p => `
              <div class="rate-box" data-player="${p._id}" data-game="${pr.game._id}" style="padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl);margin-bottom:var(--space-4)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3)">
                  <div style="display:flex;align-items:center;gap:var(--space-3)"><div style="width:40px;height:40px;background:var(--primary-gradient);border-radius:50%;display:flex;align-items:center;justify-content:center">👤</div><strong>${escape(p.name)}</strong></div>
                  <div class="stars" style="display:flex;gap:2px;font-size:1.5rem">${[1,2,3,4,5].map(n => `<span class="star" data-v="${n}" style="cursor:pointer;color:var(--gray-300)">★</span>`).join('')}</div>
                </div>
                <textarea class="form-textarea comment" placeholder="Comment (optional)" style="min-height:60px;margin-bottom:var(--space-3)"></textarea>
                <button class="btn btn--primary submit-rating">Submit</button>
              </div>
            `).join('')}</div>
          </div>
        `).join('') : `<div class="empty-state"><div class="empty-state__icon">⭐</div><h3>All done!</h3><p>No pending ratings</p><a href="/games" class="btn btn--primary" data-link>Browse Games</a></div>`}
      </div>
    </section>
  `);
  
  $$('.star').forEach(s => s.onclick = () => {
    const v = +s.dataset.v;
    const box = s.closest('.rate-box');
    box.querySelectorAll('.star').forEach((st, i) => st.style.color = i < v ? '#FFD700' : 'var(--gray-300)');
    box.dataset.rating = v;
  });
  
  $$('.submit-rating').forEach(btn => btn.onclick = async () => {
    const box = btn.closest('.rate-box');
    const score = +box.dataset.rating;
    if (!score) { toast('warning', 'Select rating'); return; }
    btn.disabled = true; btn.classList.add('btn--loading');
    try {
      await Ratings.create({ gameId: box.dataset.game, toUserId: box.dataset.player, score, comment: box.querySelector('.comment').value });
      toast('success', 'Rated! ⭐');
      box.innerHTML = '<div style="text-align:center;padding:var(--space-4);color:var(--success)">✅ Submitted!</div>';
    } catch (e) { toast('error', e.message); btn.disabled = false; btn.classList.remove('btn--loading'); }
  });
}));

// INIT
async function init() {
  await initAuth();
  window.addEventListener('popstate', handleRoute);
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link) { e.preventDefault(); const href = link.getAttribute('href'); if (href && href !== location.pathname) navigate(href); }
  });
  
  const userMenuBtn = $('#userMenuBtn'), userMenu = $('#userMenu');
  if (userMenuBtn) {
    userMenuBtn.onclick = () => userMenu.classList.toggle('active');
    document.addEventListener('click', e => { if (!userMenu.contains(e.target)) userMenu.classList.remove('active'); });
  }
  
  $('#logoutBtn').onclick = () => { localStorage.removeItem('token'); currentUser = null; updateAuthUI(); toast('info', 'Bye! 👋'); navigate('/'); };
  $('#modalBackdrop').onclick = () => $('#modal').classList.remove('active');
  
  handleRoute();
}

window.navigate = navigate;
init();
