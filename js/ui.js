// === js/ui.js ===

import { game } from './state.js';
import { playNotebookSound } from './audioManager.js';

// Toggle the Notebook display
export function toggleNotebook() {
  const nb = document.getElementById("notebook");
  if (!nb) return;
  nb.style.display = nb.style.display === "block" ? "none" : "block";
  if (nb.style.display === "block") playNotebookSound();
}

// Toggle the Inventory overlay
export function toggleInventoryOverlay() {
  const overlay = document.getElementById("inventory-overlay");
  if (!overlay) return;
  overlay.style.display = overlay.style.display === "block" ? "none" : "block";
  if (overlay.style.display === "block") renderInventoryList();
}

// Render held items inside the inventory overlay
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

// Update the top-left HUD panel (location, sanity, turn, temp)
export function updateHUD() {
  const loc = document.getElementById("hud-location");
  const turn = document.getElementById("hud-turn");
  const sanity = document.getElementById("hud-sanity");
  const temp = document.getElementById("hud-temp");

  if (loc) loc.textContent = `📍 ${game.currentRoom || "???"}`;
  if (turn) turn.textContent = `📅 Turn: ${game.turn}`;
  if (sanity) sanity.textContent = `🧠 Sanity: ${game.sanity}%`;

  // If holding thermometer, show temp
  if (temp) {
    if (game.inventory.includes("Thermometer") && game.temp !== undefined) {
      temp.textContent = `🌡️ Temp: ${game.temp}°C`;
      temp.style.display = "block";
    } else {
      temp.style.display = "none";
    }
  }
}

// Display log narration
export function logToGame(text) {
  const log = document.getElementById("game-log");
  if (!log) return;
  const div = document.createElement("div");
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

// Update directional background image
export function updateBackground(direction) {
  const mainScene = document.getElementById("main-scene");
  if (!mainScene || !game.currentRoom) return;
  const image = `${game.currentRoom}_${direction}.png`;
  mainScene.style.backgroundImage = `url('images/${image}')`;
}

// Render default HUD/UI after game start
export function renderUI() {
  updateHUD();
  renderInventoryList();
}
