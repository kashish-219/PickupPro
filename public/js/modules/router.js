/**
 * MODULE: router
 * Client-side SPA router using the history API.
 */
import { floatingBalls, escape } from './utils.js';

const routes = [];
const $ = s => document.querySelector(s);

export function route(path, handler) {
  const names = [];
  const pattern = path
    .replace(/\//g, '\/')
    .replace(/:([^/]+)/g, (_, n) => { names.push(n); return '([^/]+)'; });
  routes.push({ pattern: new RegExp(`^${pattern}$`), names, handler });
}

export function navigate(path, replace = false) {
  replace ? history.replaceState({}, '', path) : history.pushState({}, '', path);
  handleRoute();
}

export async function handleRoute() {
  const path = location.pathname;
  const app = $('#app');
  app.innerHTML = `<div class="loader"><div class="loader__ball">🏀</div><p>Loading...</p></div>`;
  for (const r of routes) {
    const m = path.match(r.pattern);
    if (m) {
      const params = {};
      r.names.forEach((n, i) => params[n] = m[i + 1]);
      try { await r.handler(params); }
      catch (e) {
        console.error(e);
        app.innerHTML = `${floatingBalls}<div class="empty-state"><div class="empty-state__icon">😵</div><h3>Oops!</h3><p>${escape(e.message)}</p><a href="/" class="btn btn--primary" data-link>Go Home</a></div>`;
      }
      window.scrollTo(0, 0);
      return;
    }
  }
  app.innerHTML = `${floatingBalls}<div class="empty-state"><div class="empty-state__icon">🔍</div><h3>Not Found</h3><p>Page doesn't exist</p><a href="/" class="btn btn--primary" data-link>Go Home</a></div>`;
}

export function render(html) { $('#app').innerHTML = floatingBalls + html; }
