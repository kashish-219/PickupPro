/**
 * MODULE: api
 * All fetch calls to the backend. Exports: api(), Auth, Games, Users, Ratings
 */
const API_BASE = "/api";

export async function api(url, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...opts.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API_BASE + url, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error");
  return data;
}

export const Auth = {
  register: (d) =>
    api("/auth/register", { method: "POST", body: JSON.stringify(d) }),
  login: (d) => api("/auth/login", { method: "POST", body: JSON.stringify(d) }),
  me: () => api("/auth/me"),
};

export const Games = {
  list: (p) => api("/games?" + new URLSearchParams(p)),
  get: (id) => api("/games/" + id),
  create: (d) => api("/games", { method: "POST", body: JSON.stringify(d) }),
  update: (id, d) =>
    api("/games/" + id, { method: "PUT", body: JSON.stringify(d) }),
  delete: (id) => api("/games/" + id, { method: "DELETE" }),
  join: (id) => api("/games/" + id + "/join", { method: "POST" }),
  leave: (id) => api("/games/" + id + "/leave", { method: "POST" }),
  complete: (id) => api("/games/" + id + "/complete", { method: "PUT" }),
};

export const Users = {
  list: (p) => api("/users?" + new URLSearchParams(p)),
  get: (id) => api("/users/" + id),
  update: (id, d) =>
    api("/users/" + id, { method: "PUT", body: JSON.stringify(d) }),
  games: (id, p) => api("/users/" + id + "/games?" + new URLSearchParams(p)),
};

export const Ratings = {
  create: (d) => api("/ratings", { method: "POST", body: JSON.stringify(d) }),
  pending: () => api("/ratings/pending"),
};
