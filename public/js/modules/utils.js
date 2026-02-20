/**
 * MODULE: utils
 * Shared constants and utility functions.
 */
export const SPORTS = [
  { name: "Basketball", emoji: "🏀", color: "#FF6B35" },
  { name: "Soccer", emoji: "⚽", color: "#00D26A" },
  { name: "Tennis", emoji: "🎾", color: "#FFE135" },
  { name: "Volleyball", emoji: "🏐", color: "#A855F7" },
  { name: "Baseball", emoji: "⚾", color: "#EF4444" },
  { name: "Cricket", emoji: "🏏", color: "#06B6D4" },
  { name: "Badminton", emoji: "🏸", color: "#3B82F6" },
  { name: "Running", emoji: "🏃", color: "#F97316" },
  { name: "Other", emoji: "🎯", color: "#8B5CF6" },
];

export const $ = (s) => document.querySelector(s);
export const $$ = (s) => document.querySelectorAll(s);

export const getSport = (name) =>
  SPORTS.find((s) => s.name === name) || {
    name,
    emoji: "🎯",
    color: "#8B5CF6",
  };

export const escape = (s) => {
  if (!s) return "";
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
};

export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const formatTime = (d) =>
  new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

export const floatingBalls = `
  <div class="floating-balls">
    <span style="left:5%;top:15%;--d:7s;--t:0s">🏀</span>
    <span style="left:90%;top:20%;--d:8s;--t:1s">⚽</span>
    <span style="left:10%;top:70%;--d:6s;--t:2s">🎾</span>
    <span style="left:85%;top:75%;--d:9s;--t:0.5s">🏐</span>
    <span style="left:50%;top:10%;--d:7.5s;--t:1.5s">🏸</span>
    <span style="left:25%;top:85%;--d:8.5s;--t:2.5s">🎯</span>
  </div>
`;
