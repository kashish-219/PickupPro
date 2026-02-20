/**
 * MODULE: toast
 * Toast notification system.
 * Created by: Kashish Rahulbhai Khatri & Abhimanyu Dudeja
 */
import { escape } from "./utils.js";

export function toast(type, title, msg = "") {
  const c = document.querySelector("#toastContainer");
  const icons = { success: "", error: "", warning: "", info: "" };
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.innerHTML = `<span class="toast__icon">${icons[type]}</span><div class="toast__content"><div class="toast__title">${escape(title)}</div>${msg ? `<div class="toast__message">${escape(msg)}</div>` : ""}</div><button class="toast__close">✕</button>`;
  el.querySelector(".toast__close").onclick = () => el.remove();
  c.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}