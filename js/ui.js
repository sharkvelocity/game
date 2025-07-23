/*****************************************************
 * === PHASMA-PHONEY v2.9 — UI.JS ===
 * Handles HUD updates, log display, loadout selection,
 * and visual updates for main scene.
 *****************************************************/

import { game, roomVisuals, allLoadoutItems } from "./state.js";

/***********************
 === GAME LOG SYSTEM ===
************************/
export function logToGame(message) {
  const log = document.getElementById("game-log");
  if (!log) return; // Safety fallback

  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.textContent = message;
  log.appendChild(entry);

  log.scrollTop = log.scrollHeight;
  setTimeout(() => entry.classList.add("fade"), 7000);
}

/***********************
 === HUD UPDATES ===
************************/
export function renderHUD() {
  document.getElementById("hud-location").textContent = game.playerRoom;
  document.getElementById("hud-weather").textContent = game.weather || "--";
  document.getElementById("hud-turns").textContent = game.currentTurn;
  document.getElementById("held-items-display").textContent =
    game.inventory.length ? game.inventory.join(", ") : "None";

  // Temperature display (thermometer logic)
  if (game.inventory.includes("Thermometer") && game.playerRoom !== "Van") {
    const temp =
      game.playerRoom === game.ghostRoom
        ? (Math.random() < 0.3 ? -5 : 2 + Math.random() * 3)
        : 15 + Math.random() * 5;
    document.getElementById("hud-temp").textContent = temp.toFixed(1) + "°C";
  } else {
    document.getElementById("hud-temp").textContent = "--°C";
  }

  updateSanityBar();
}

function updateSanityBar() {
  const bar = document.getElementById("sanity-bar");
  if (!bar) return;
  const s = Math.max(0, Math.floor(game.sanity));
  bar.style.width = s + "%";
  bar.style.background = s > 66 ? "#0f0" : s > 33 ? "#ff0" : "#f00";
}

/***********************
 === BACKGROUND UPDATE ===
************************/
export function updateBackground() {
  const visuals = roomVisuals[game.playerRoom] || roomVisuals["Van"];
  const direction = game.playerDirection || "N";
  const bg = document.getElementById("background");

  if (visuals && visuals[direction]) {
    bg.style.backgroundImage = `url('${visuals[direction]}')`;
  } else {
    console.warn(`Missing background for ${game.playerRoom} (${direction})`);
    bg.style.backgroundImage = `url('${roomVisuals["Van"]["N"]}')`;
  }
}

/***********************
 === LOADOUT SCREEN ===
************************/
export function showLoadout() {
  let tempHeld = [];
  let tempVan = [...allLoadoutItems];

  const heldList = document.getElementById("held-list");
  const vanList = document.getElementById("van-list");
  const confirmBtn = document.getElementById("confirm-loadout");

  function renderLoadout() {
    heldList.innerHTML = tempHeld
      .map(
        (i) =>
          `<button class="item-button selected" onclick="removeHeldItem('${i}')">${i}</button>`
      )
      .join("");

    vanList.innerHTML = tempVan
      .map(
        (i) =>
          `<button class="item-button" onclick="addHeldItem('${i}')">${i}</button>`
      )
      .join("");

    if (tempHeld.length > 0) {
      confirmBtn.classList.add("active");
      confirmBtn.disabled = false;
    } else {
      confirmBtn.classList.remove("active");
      confirmBtn.disabled = true;
    }
  }

  window.addHeldItem = function (item) {
    if (tempHeld.length >= 3) {
      logToGame("⚠️ You can only hold 3 items.");
      return;
    }
    tempHeld.push(item);
    tempVan = tempVan.filter((v) => v !== item);
    renderLoadout();
  };

  window.removeHeldItem = function (item) {
    tempVan.push(item);
    tempHeld = tempHeld.filter((h) => h !== item);
    renderLoadout();
  };

  renderLoadout();
  document.getElementById("loadout-screen").style.display = "flex";
}

/***********************
 === CONFIRM LOADOUT ===
************************/
export function confirmLoadout() {
  const heldList = document.querySelectorAll("#held-list .item-button");
  const selected = [...heldList].map((b) => b.textContent);

  game.inventory = [...selected, "Notebook", "Lighter"];
  game.vanStock = [...allLoadoutItems].filter((i) => !selected.includes(i));

  document.getElementById("loadout-screen").style.display = "none";
  renderHUD();
}