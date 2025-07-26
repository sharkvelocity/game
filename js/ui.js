/*****************************************************
 * === PHASMA-PHONEY v2.9 — UI MODULE (FINAL FIXED) ===
 * Handles HUD, logging, notebook, and van monitor sync.
 *****************************************************/
import { game, allLoadoutItems, roomVisuals, gameSettings, ghostProfiles } from "./state.js";
import { saveGame } from "./saveManager.js";
// ❌ REMOVED: import { handleCommand } from "./events.js";
import { playNotebookSound } from "./audioManager.js";
import { useItem, pickItem } from "./items.js"; // ✅ Needed for notebook item actions

/***********************
 === LOGGING & HUD ===
************************/
export function logToGame(msg) {
  const log = document.getElementById("game-log");
  const e = document.createElement("div");
  e.className = "log-entry";
  e.textContent = msg;
  log.appendChild(e);
  log.scrollTop = log.scrollHeight;
  setTimeout(() => e.classList.add("fade"), 8000);
}

export function renderHUD() {
  document.getElementById("hud-location").textContent = game.playerRoom;
  document.getElementById("hud-weather").textContent = game.weather || "--";
  document.getElementById("hud-turns").textContent = game.currentTurn;
  document.getElementById("held-items-display").textContent =
    game.inventory.length ? game.inventory.filter(x => x !== "Notebook").join(", ") : "None";

  if (game.inventory.includes("Thermometer") && game.playerRoom !== "Van") {
    const t = game.playerRoom === game.ghostRoom
      ? (Math.random() < 0.3 ? -5 : 2 + Math.random() * 3)
      : 15 + Math.random() * 5;
    document.getElementById("hud-temp").textContent = t.toFixed(1) + "°C";
  } else {
    document.getElementById("hud-temp").textContent = "--°C";
  }
  updateSanityBar();
}

export function updateSanityBar() {
  const bar = document.getElementById("sanity-bar");
  if (!bar) return;
  const s = Math.max(0, Math.floor(game.sanity));
  bar.style.width = s + "%";
  bar.style.background = s > 66 ? "#0f0" : s > 33 ? "#ff0" : "#f00";
}

export function updateBackground() {
  const v = roomVisuals[game.playerRoom] || roomVisuals["Van"];
  const d = game.playerDirection || "N";
  const bg = document.getElementById("background");
  if (v && v[d]) bg.style.backgroundImage = `url('${v[d]}')`;
}

/***********************
 === ACTION BUTTONS (FIXED) ===
************************/
export function renderActionButtons() {
  const cmd = document.getElementById("command-buttons");
  cmd.innerHTML = `
    <button data-cmd="move">Move</button>
    <button data-cmd="look">Look Around</button>
    <button data-cmd="inventory">Inventory</button>
    <button data-cmd="guess">Ghost Guess</button>
    <button data-cmd="van">Return to Van</button>
  `;
  cmd.onclick = (e) => {
    if (!e.target.dataset.cmd) return;
    const action = e.target.dataset.cmd;
    document.dispatchEvent(new CustomEvent("ui-command", { detail: action }));
  };
}
// ✅ FIX: Replaced direct call to handleCommand with a dispatch event.
// Main game flow now listens for `ui-command`.

