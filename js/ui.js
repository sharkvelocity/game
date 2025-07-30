// === js/ui.js ===

import { game } from './state.js';
import { playNotebookSound } from './audioManager.js';

// === NOTEBOOK ===

export function toggleNotebook() {
  const nb = document.getElementById("notebook");
  if (!nb) return;
  nb.style.display = nb.style.display === "block" ? "none" : "block";
  if (nb.style.display === "block") playNotebookSound();
}

export function populateGhostNotebook() {
  const notebook = document.getElementById("notebook");
  if (!notebook) return;

  notebook.innerHTML = `<h2>Ghost Notes</h2>`;

  if (!Array.isArray(game.evidence) || game.evidence.length === 0) {
    notebook.innerHTML += `<p>No evidence recorded yet.</p>`;
  } else {
    notebook.innerHTML += `<ul>` + game.evidence.map(ev => `<li>${ev}</li>`).join("") + `</ul>`;
  }
}


export function showNotebookUpdateBadge() {
  const badge = document.getElementById("notebook-badge");
  if (badge) badge.style.display = "inline-block";
}

// Optional helper if needed to rebind toggleNotebook to a button
export function setupNotebookToggle() {
  const btn = document.getElementById("notebook-toggle");
  if (btn) btn.onclick = toggleNotebook;
}

// === INVENTORY ===

export function toggleInventoryOverlay() {
  const overlay = document.getElementById("inventory-overlay");
  if (!overlay) return;
  overlay.style.display = overlay.style.display === "block" ? "none" : "block";
  if (overlay.style.display === "block") renderInventoryList();
}

export function renderInventoryList() {
  const list = document.getElementById("inventory-list");
  if (!list) return;

  list.innerHTML = "";
  const items = game.inventory && game.inventory.length > 0 ? game.inventory : ["None"];
  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

// === HUD ===

export function updateHUD() {
  const loc = document.getElementById("hud-location");
  const turn = document.getElementById("hud-turn");
  const sanity = document.getElementById("hud-sanity");
  const temp = document.getElementById("hud-temp");

  if (loc) loc.textContent = `📍 ${game.currentRoom || "???"}`;
  if (turn) turn.textContent = `📅 Turn: ${game.turn}`;
  if (sanity) sanity.textContent = `🧠 Sanity: ${game.sanity}%`;

  if (temp) {
    if (game.inventory.includes("Thermometer") && game.temp !== undefined) {
      temp.textContent = `🌡️ Temp: ${game.temp}°C`;
      temp.style.display = "block";
    } else {
      temp.style.display = "none";
    }
  }
}

export function renderHUD() {
  updateHUD();
  renderInventoryList();
}

export function renderUI() {
  renderHUD();
}

// === BACKGROUND ===

export function updateBackground(direction) {
  const mainScene = document.getElementById("main-scene");
  if (!mainScene || !game.currentRoom) return;
  const room = game.currentRoom;
  const image = `${room}_${direction}`.toLowerCase() + `.png`; // lowercase for filename consistency
  mainScene.style.backgroundImage = `url('images/${image}')`;
}

// === ACTION BUTTONS ===

export function renderActionButtons() {
  const cmd = document.getElementById("command-buttons");
  cmd.innerHTML = `
    <button data-cmd="move">Move</button>
    <button data-cmd="look">Look Around</button>
    <button data-cmd="inventory">Inventory</button>
    <button data-cmd="guess">Ghost Guess</button>
    <button data-cmd="van">${game.currentRoom === "Van" ? "Check Gear" : "Return to Van"}</button>
  `;
}

// === LOADOUT ===

export function showLoadout() {
  const overlays = document.querySelectorAll(".overlay");
  overlays.forEach(o => o.style.display = "none");
  const loadout = document.getElementById("loadout-screen");
  if (loadout) loadout.style.display = "block";
}

export function confirmLoadout() {
  const loadout = document.getElementById("loadout-screen");
  if (loadout) loadout.style.display = "none";
}

// === NARRATION LOG ===

export function logToGame(text) {
  const log = document.getElementById("game-log");
  if (!log) return;
  const div = document.createElement("div");
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

// === WEATHER ===

export const possibleWeather = [
  "Clear", "Rain", "Storm", "Fog", "Windy"
];
