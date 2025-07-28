/*****************************************************
 * === PHASMA-PHONEY v2.9 — UI MODULE (FINAL PATCHED) ===
 * HUD, logging, notebook, loadout & buttons.
 *****************************************************/
import { game, allLoadoutItems, roomVisuals, gameSettings, ghostProfiles } from "./state.js";
import { saveGame } from "./saveManager.js";
import { playNotebookSound } from "./audioManager.js";
import { useItem, pickItem } from "./items.js";

/***********************
 === LOGGING & HUD
************************/
export function logToGame(msg) {
  const log = document.getElementById("game-log");
  if (!log) return;
  const e = document.createElement("div");
  e.className = "log-entry";
  e.textContent = msg;
  log.appendChild(e);
  log.scrollTop = log.scrollHeight;
  setTimeout(() => e.classList.add("fade"), 8000);
}

export function renderHUD() {
  const loc = document.getElementById("hud-location");
  const weather = document.getElementById("hud-weather");
  const turns = document.getElementById("hud-turns");
  const held = document.getElementById("held-items-display");
  const temp = document.getElementById("hud-temp");
  if (!loc || !weather || !turns || !held || !temp) return;

  loc.textContent = game.playerRoom;
  weather.textContent = game.weather || "--";
  turns.textContent = game.currentTurn;
  held.textContent =
    game.inventory.length ? game.inventory.filter(x => x !== "Notebook").join(", ") : "None";

  if (game.inventory.includes("Thermometer") && game.playerRoom !== "Van") {
    const t = game.playerRoom === game.ghostRoom
      ? (Math.random() < 0.3 ? -5 : 2 + Math.random() * 3)
      : 15 + Math.random() * 5;
    temp.textContent = t.toFixed(1) + "°C";
  } else {
    temp.textContent = "--°C";
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
  if (bg && v && v[d]) bg.style.backgroundImage = `url('${v[d]}')`;
}

/***********************
 ✅ ACTION BUTTONS (RE-EXPORTED)
************************/
export function renderActionButtons() {
  const cmd = document.getElementById("command-buttons");
  if (!cmd) return;
  cmd.innerHTML = `
    <button data-cmd="move">Move</button>
    <button data-cmd="look">Look Around</button>
    <button data-cmd="inventory">Inventory</button>
    <button data-cmd="guess">Ghost Guess</button>
    <button data-cmd="van">Return to Van</button>
  `;
  cmd.onclick = (e) => {
    if (!e.target.dataset.cmd) return;
    document.dispatchEvent(new CustomEvent("ui-command", { detail: e.target.dataset.cmd }));
  };
}

/***********************
 === NOTEBOOK (UNCHANGED)
************************/
// ... (rest of notebook functions stay same as previous fixed version)
