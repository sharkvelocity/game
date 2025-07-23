/*****************************************************
 * === PHASMA-PHONEY v2.9 — UI.JS (Modular) ===
 * Handles HUD, logs, and loadout screen
 *****************************************************/
import { game } from "./state.js";

/* === GAME LOG === */
export function logToGame(text) {
  const log = document.getElementById("game-log");
  if (!log) return;

  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.textContent = text;
  log.appendChild(entry);

  log.scrollTop = log.scrollHeight;

  // Fade older entries
  const entries = log.querySelectorAll(".log-entry");
  if (entries.length > 10) {
    entries[0].classList.add("fade");
  }
}

/* === HUD === */
export function renderHUD() {
  const loc = document.getElementById("hud-location");
  const weath = document.getElementById("hud-weather");
  const turns = document.getElementById("hud-turns");
  const sanityBar = document.getElementById("sanity-bar");
  const temp = document.getElementById("hud-temp");

  if (!loc) return;

  loc.textContent = game.playerRoom || "Van";
  weath.textContent = game.weather || "--";
  turns.textContent = game.currentTurn;

  sanityBar.style.width = `${game.sanity}%`;
  sanityBar.style.background = game.sanity > 60 ? "#0f0" :
                               game.sanity > 30 ? "#ff0" : "#f00";

  temp.textContent = game.playerRoom === game.ghostRoom ? "Low" : "--°C";
}

/* === LOADOUT SCREEN === */
export function showLoadout() {
  const loadoutScreen = document.getElementById("loadout-screen");
  const heldList = document.getElementById("held-list");
  const vanList = document.getElementById("van-list");
  const confirmBtn = document.getElementById("confirm-loadout");

  if (!loadoutScreen) return;
  loadoutScreen.style.display = "flex";
  heldList.innerHTML = "";
  vanList.innerHTML = "";
  confirmBtn.disabled = true;

  // Reset temporary selections
  if (!Array.isArray(game.inventory)) game.inventory = [];
  game.inventory = [];
  game.vanStock = [...game.vanStock];

  game.vanStock.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item;
    btn.onclick = () => toggleItem(item, btn);
    vanList.appendChild(btn);
  });

  function toggleItem(item, btn) {
    const index = game.inventory.indexOf(item);
    if (index > -1) {
      game.inventory.splice(index, 1);
      btn.style.background = "";
    } else {
      if (game.inventory.length >= 3) {
        logToGame("⚠️ You can only hold 3 items!");
        return;
      }
      game.inventory.push(item);
      btn.style.background = "#0a0";
    }

    heldList.innerHTML = game.inventory.map(i => `<div>${i}</div>`).join("") || "None";
    confirmBtn.disabled = game.inventory.length === 0;
    confirmBtn.classList.toggle("active", game.inventory.length > 0);
  }
}

/* === CONFIRM LOADOUT === */
export function confirmLoadout() {
  const loadoutScreen = document.getElementById("loadout-screen");
  if (!loadoutScreen) return;

  game.vanStock = game.vanStock.filter(i => !game.inventory.includes(i));
  loadoutScreen.style.display = "none";

  logToGame(`You selected: ${game.inventory.join(", ")}`);
}