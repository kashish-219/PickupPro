/**
 * PICKUPPRO - APPLICATION ENTRY POINT
 *
 * modules/api.js        - API fetch wrapper
 * modules/utils.js      - Constants, helpers
 * modules/router.js     - SPA router
 * modules/auth.js       - Auth state
 * modules/toast.js      - Notifications
 * modules/components.js - UI components
 * pages/home.js         - / route
 * pages/games.js        - /games routes
 * pages/users.js        - /players, /users, /profile, /my-games
 * pages/auth.js         - /login, /register
 * pages/ratings.js      - /ratings/pending
 */
import { navigate, handleRoute } from "./modules/router.js";
import { initAuth, updateAuthUI } from "./modules/auth.js";
import { toast } from "./modules/toast.js";
import { registerHomeRoute } from "./pages/home.js";
import { registerGamesRoutes } from "./pages/games.js";
import { registerUserRoutes } from "./pages/users.js";
import { registerAuthRoutes } from "./pages/auth.js";
import { registerRatingsRoute } from "./pages/ratings.js";

registerHomeRoute();
registerGamesRoutes();
registerUserRoutes();
registerAuthRoutes();
registerRatingsRoute();

window.navigate = navigate;

async function init() {
  await initAuth();
  window.addEventListener("popstate", handleRoute);
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      const href = link.getAttribute("href");
      if (href && href !== location.pathname) navigate(href);
    }
  });
  const userMenuBtn = document.querySelector("#userMenuBtn");
  const userMenu = document.querySelector("#userMenu");
  if (userMenuBtn) {
    userMenuBtn.onclick = () => userMenu.classList.toggle("active");
    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target)) userMenu.classList.remove("active");
    });
  }
  document.querySelector("#logoutBtn").onclick = async () => {
    localStorage.removeItem("token");
    const { setCurrentUser } = await import("./modules/auth.js");
    setCurrentUser(null);
    updateAuthUI();
    toast("info", "Bye! 👋");
    navigate("/");
  };
  const backdrop = document.querySelector("#modalBackdrop");
  if (backdrop)
    backdrop.onclick = () =>
      document.querySelector("#modal").classList.remove("active");
  handleRoute();
}

init();
