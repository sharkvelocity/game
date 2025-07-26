/*****************************************************
 * === PHASMA-PHONEY v2.9 — UI MODULE (FINAL FULLY UPDATED) ===
 * Handles HUD, logging, notebook, loadout, and van monitor sync.
 * Reflects camera IR status, and uses ui-command events.
 *****************************************************/
import { game, allLoadoutItems, roomVisuals, gameSettings, ghostProfiles, evidenceMap } from "./state.js";
import { saveGame } from "./saveManager.js";
import { playNotebookSound } from "./audioManager.js";
import { useItem, pickItem } from "./items.js"; // ✅ Notebook item actions

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
  // === Location, Weather, Turn ===
  document.getElementById("hud-location").textContent = game.playerRoom;
  document.getElementById("hud-weather").textContent = game.weather || "--";
  document.getElementById("hud-turns").textContent = game.currentTurn;

  // === Held Items + IR Camera Status ===
  let heldDisplay = game.inventory.filter(x => x !== "Notebook").join(", ") || "None";
  if (game.cameraActive) heldDisplay += " [IR ACTIVE]";
  document.getElementById("held-items-display").textContent = heldDisplay;

  // === Temperature Reading ===
  if (game.inventory.includes("Thermometer") && game.playerRoom !== "Van") {
    const t = game.playerRoom === game.ghostRoom
      ? (Math.random() < 0.3 ? -5 : 2 + Math.random() * 3)
      : 15 + Math.random() * 5;
    document.getElementById("hud-temp").textContent = t.toFixed(1) + "°C";
  } else {
    document.getElementById("hud-temp").textContent = "--°C";
  }

  // === Orbs Indicator when IR Camera is Active ===
  const orbIndicator = document.getElementById("orb-indicator");
  if (orbIndicator) {
    if (game.cameraActive && shouldShowOrbs()) {
      orbIndicator.style.display = "block";
      orbIndicator.textContent = "✨ Orbs visible on IR";
    } else {
      orbIndicator.style.display = "none";
    }
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
 === ORB CHECK FOR HUD (MATCHES items.js) ===
************************/
function shouldShowOrbs() {
  const ghost = game.ghost === "TheMimic" ? "The Mimic" : game.ghost;
  const hasOrbsEvidence = evidenceMap[ghost]?.includes("Ghost Orbs");
  return game.playerRoom === game.ghostRoom && (hasOrbsEvidence || game.ghost === "TheMimic");
}

/***********************
 === ACTION BUTTONS (FIXED FOR UI COMMANDS) ===
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
    document.dispatchEvent(new CustomEvent("ui-command", { detail: e.target.dataset.cmd }));
  };
}

/***********************
 === LOADOUT SELECTION (FIXED & SYNCED) ===
************************/
let tempHeld = [], tempVan = [];
export function showLoadout() {
  tempHeld = [];
  tempVan = [...allLoadoutItems];

  const heldList = document.getElementById("held-list");
  const vanList = document.getElementById("van-list");
  const confirmBtn = document.getElementById("confirm-loadout");

  function renderLoadout() {
    heldList.innerHTML = tempHeld
      .map(i => `<button class="item-button selected" onclick="removeHeldItem('${i}')">${i}</button>`)
      .join("");
    vanList.innerHTML = tempVan
      .map(i => `<button class="item-button" onclick="addHeldItem('${i}')">${i}</button>`)
      .join("");
    confirmBtn.disabled = tempHeld.length === 0;
    confirmBtn.classList.toggle("active", tempHeld.length > 0);
  }

  window.addHeldItem = function (item) {
    const carryable = tempHeld.filter(x => x !== "Notebook" && x !== "Lighter");
    if (carryable.length >= 3) {
      logToGame("⚠️ Max 3 items (Notebook & Lighter excluded).");
      return;
    }
    if (!tempHeld.includes(item)) {
      tempHeld.push(item);
      tempVan = tempVan.filter(v => v !== item);
      renderLoadout();
    }
  };

  window.removeHeldItem = function (item) {
    if (!tempVan.includes(item)) tempVan.push(item);
    tempHeld = tempHeld.filter(h => h !== item);
    renderLoadout();
  };

  renderLoadout();
  document.getElementById("loadout-screen").style.display = "flex";

  confirmBtn.onclick = () => {
    if (!confirmBtn.classList.contains("active")) {
      logToGame("⚠️ Select at least one item before confirming.");
      return;
    }
    game.inventory = [...tempHeld, "Notebook", "Lighter"];
    game.vanStock = [...tempVan];
    document.getElementById("loadout-screen").style.display = "none";
    if (gameSettings.autosave) saveGame(true);
    renderHUD(); // ✅ Immediately update HUD
  };
}
