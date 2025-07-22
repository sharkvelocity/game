/*****************************************************
 * === PHASMA-PHONEY v2.6 — UI & NARRATOR SYSTEM ===
 * Handles narrator log, HUD updates, and loadout UI.
 *****************************************************/

import { game, cursedItemDescriptions, cursedItemSanityCost, roomVisuals } from "./state.js";

// === NARRATOR LOG ===
export function logToGame(text) {
  const log = document.getElementById("game-log");
  if (!log) return console.warn("Game log element not found!", text);

  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.textContent = text;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;

  // Fade older logs after delay
  setTimeout(() => entry.classList.add("fade"), 8000);
}

// === HUD UPDATES ===
export function updateSanityBar() {
  const bar = document.getElementById("sanity-bar");
  if (!bar) return;

  bar.style.width = game.sanity + "%";
  if (game.sanity > 66) bar.style.background = "#0f0";
  else if (game.sanity > 33) bar.style.background = "#ff0";
  else bar.style.background = "#f00";
}

export function renderHUD() {
  document.getElementById("hud-location").textContent = game.playerRoom;
  document.getElementById("hud-weather").textContent = game.weather;
  document.getElementById("hud-turns").textContent = game.currentTurn;
  document.getElementById("held-items-display").textContent = game.inventory.join(", ") || "None";

  updateSanityBar();

  // Temperature display logic
  const tempEl = document.getElementById("hud-temp");
  if (game.inventory.includes("Thermometer") && game.playerRoom !== "Van") {
    const t = game.playerRoom === game.ghostRoom
      ? (Math.random() < 0.3 ? -5 : 2 + Math.random() * 3)
      : 15 + Math.random() * 5;
    tempEl.textContent = t.toFixed(1) + "°C";
  } else {
    tempEl.textContent = "--°C";
  }
}

// === LOADOUT UI ===
let tempHeld = [];
let tempVan = [];

export function showLoadout() {
  tempHeld = [];
  tempVan = [...game.vanStock];
  document.getElementById("loadout-screen").style.display = "flex";
  renderLoadout();
}

function renderLoadout() {
  const h = document.getElementById("held-list");
  const v = document.getElementById("van-list");
  h.innerHTML = "";
  v.innerHTML = "";

  // Held Items
  tempHeld.forEach(item => {
    const b = document.createElement("button");
    b.textContent = item + " (Remove)";
    b.className = "item-button";
    b.onclick = () => {
      tempVan.push(item);
      tempHeld = tempHeld.filter(i => i !== item);
      renderLoadout();
    };
    h.appendChild(b);
  });

  // Van Stock
  tempVan.forEach(item => {
    const b = document.createElement("button");
    b.textContent = item + " (Add)";
    b.className = "item-button";
    b.onclick = () => {
      if (tempHeld.length < 3) {
        tempHeld.push(item);
        tempVan = tempVan.filter(i => i !== item);
        renderLoadout();
      } else alert("You can only hold 3 items!");
    };
    v.appendChild(b);
  });
}

export function confirmLoadout() {
  game.inventory = [...tempHeld, "Notebook", "Lighter"];
  game.vanStock = [...tempVan];
  document.getElementById("loadout-screen").style.display = "none";
}

// === BACKGROUND UPDATES ===
export function updateBackground(direction = "N") {
  const visuals = roomVisuals[game.playerRoom] || roomVisuals["Van"];
  document.getElementById("background").style.backgroundImage =
    `url('img/${visuals[direction]}')`;
}

// === INSPECT OVERLAY ===
export function openInspectOverlay(item) {
  const title = document.getElementById("inspect-title");
  const desc = document.getElementById("inspect-description");

  title.textContent = item;
  let d = "A standard investigation tool.";
  if (cursedItemDescriptions[item]) d = cursedItemDescriptions[item];

  // Common descriptions
  if (item === "Crucifix") d = "Stops hunts in the ghost room. Two uses before breaking.";
  if (item === "Camera" || item === "Video Camera") d = "Used to view orbs and record ghost activity.";
  if (item === "EMF Reader") d = "Detects electromagnetic fields. Ghosts may spike it to level 5.";
  if (item === "Spirit Box") d = "Allows direct ghost communication.";
  if (item === "Thermometer") d = "Reads temperature. Freezing indicates ghost presence.";
  if (item === "Ghost Writing Book") d = "Place for ghosts to write in. Useful evidence.";

  desc.textContent = d;
  document.getElementById("inspect-overlay").style.display = "flex";
}

export function closeInspectOverlay() {
  document.getElementById("inspect-overlay").style.display = "none";
}
