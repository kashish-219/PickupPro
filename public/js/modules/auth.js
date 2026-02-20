/**
 * MODULE: auth
 * Auth state management.
 */
import { Auth } from "./api.js";
import { toast } from "./toast.js";
import { navigate } from "./router.js";

export let currentUser = null;

export function setCurrentUser(user) {
  currentUser = user;
}

export async function initAuth() {
  if (localStorage.getItem("token")) {
    try {
      const r = await Auth.me();
      currentUser = r.data.user;
      currentUser.stats = r.data.stats;
    } catch {
      localStorage.removeItem("token");
    }
  }
  updateAuthUI();
}

export function updateAuthUI() {
  const btns = document.querySelector("#authButtons");
  const menu = document.querySelector("#userMenu");
  const name = document.querySelector("#userName");
  const authLinks = document.querySelectorAll(".navbar__link--auth");
  if (currentUser) {
    btns.style.display = "none";
    menu.style.display = "block";
    name.textContent = currentUser.name.split(" ")[0];
    authLinks.forEach((el) => (el.style.display = "flex"));
  } else {
    btns.style.display = "flex";
    menu.style.display = "none";
    authLinks.forEach((el) => (el.style.display = "none"));
  }
}

export function requireAuth(fn) {
  return async (p) => {
    if (!currentUser) {
      toast("warning", "Please log in");
      navigate("/login");
      return;
    }
    return fn(p);
  };
}
