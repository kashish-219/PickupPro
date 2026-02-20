/**
 * PAGE: auth  (/login  /register)
 * Created by: Abhimanyu Dudeja
 */
import { Auth } from "../modules/api.js";
import { $ } from "../modules/utils.js";
import { route, render, navigate } from "../modules/router.js";
import { currentUser, setCurrentUser, updateAuthUI } from "../modules/auth.js";
import { toast } from "../modules/toast.js";
import { SportSelector, setupSportSelector } from "../modules/components.js";

export function registerAuthRoutes() {
  route("/login", async () => {
    if (currentUser) {
      navigate("/");
      return;
    }
    render(`
      <section class="section"><div class="container" style="max-width:420px">
        <div class="card card--static">
          <div class="card__header card__header--basketball" style="padding:var(--space-8);text-align:center">
            <div style="font-size:3rem;margin-bottom:var(--space-2)"></div>
            <h2 style="color:white;margin:0">Welcome Back!</h2>
            <div class="card__mascot" style="font-size:80px">🏀</div>
          </div>
          <div class="card__body">
            <form id="loginForm">
              <div class="form-group"><label class="form-label">Email</label><input type="email" name="email" class="form-input" placeholder="you@example.com" required></div>
              <div class="form-group"><label class="form-label">Password</label><input type="password" name="password" class="form-input" placeholder="••••••••" required></div>
              <button type="submit" class="btn btn--primary btn--full btn--lg">Let's Play!</button>
            </form>
            <div style="text-align:center;margin-top:var(--space-6);padding-top:var(--space-6);border-top:2px dashed var(--gray-200)">
              <p style="color:var(--gray-500);margin-bottom:var(--space-4)">New here? <a href="/register" data-link style="color:var(--primary);font-weight:700">Join!</a></p>
              <div style="padding:var(--space-3);background:var(--gray-50);border-radius:var(--radius-lg)"><p style="font-size:0.8rem;color:var(--gray-600)"><strong>🎯 Demo:</strong> demo@pickuppro.com / demo123</p></div>
            </div>
          </div>
        </div>
      </div></section>`);
    $("#loginForm").onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      const fd = new FormData(e.target);
      btn.disabled = true;
      btn.classList.add("btn--loading");
      try {
        const r = await Auth.login({
          email: fd.get("email"),
          password: fd.get("password"),
        });
        localStorage.setItem("token", r.data.token);
        setCurrentUser(r.data.user);
        updateAuthUI();
        toast("success", "Welcome back!");
        navigate("/");
      } catch (err) {
        toast("error", err.message);
      } finally {
        btn.disabled = false;
        btn.classList.remove("btn--loading");
      }
    };
  });

  route("/register", async () => {
    if (currentUser) {
      navigate("/");
      return;
    }
    render(`
      <section class="section"><div class="container" style="max-width:480px">
        <div class="card card--static">
          <div class="card__header card__header--soccer" style="padding:var(--space-8);text-align:center">
            <div style="font-size:3rem;margin-bottom:var(--space-2)"></div>
            <h2 style="color:white;margin:0">Join PickupPro!</h2>
            <div class="card__mascot" style="font-size:80px">⚽</div>
          </div>
          <div class="card__body">
            <form id="registerForm">
              <div class="form-group"><label class="form-label">👤 Name</label><input type="text" name="name" class="form-input" placeholder="Your name" required minlength="2"></div>
              <div class="form-group"><label class="form-label">Email</label><input type="email" name="email" class="form-input" placeholder="you@example.com" required></div>
              <div class="form-group"><label class="form-label">Password</label><input type="password" name="password" class="form-input" placeholder="Min 6 chars" required minlength="6"></div>
              <div class="form-group"><label class="form-label">🏆 Favorite Sports</label>${SportSelector("checkbox")}</div>
              <button type="submit" class="btn btn--primary btn--full btn--lg">Create Account</button>
            </form>
            <div style="text-align:center;margin-top:var(--space-6);padding-top:var(--space-6);border-top:2px dashed var(--gray-200)">
              <p style="color:var(--gray-500)">Have account? <a href="/login" data-link style="color:var(--primary);font-weight:700">Log in!</a></p>
            </div>
          </div>
        </div>
      </div></section>`);
    setupSportSelector();
    $("#registerForm").onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      const fd = new FormData(e.target);
      btn.disabled = true;
      btn.classList.add("btn--loading");
      try {
        const r = await Auth.register({
          name: fd.get("name"),
          email: fd.get("email"),
          password: fd.get("password"),
          sports: fd.getAll("sports"),
        });
        localStorage.setItem("token", r.data.token);
        setCurrentUser(r.data.user);
        updateAuthUI();
        toast("success", "Welcome! ");
        navigate("/");
      } catch (err) {
        toast("error", err.message);
      } finally {
        btn.disabled = false;
        btn.classList.remove("btn--loading");
      }
    };
  });
}