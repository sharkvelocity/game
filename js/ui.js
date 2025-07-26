/*****************************************************
 * === PHASMA-PHONEY v2.9 — UI MODULE (FINAL) ===
 * Handles HUD, logging, notebook, and van monitor sync.
 *****************************************************/
import { game, allLoadoutItems, roomVisuals, gameSettings, ghostProfiles } from "./state.js";
import { saveGame } from "./saveManager.js";
import { handleCommand } from "./events.js";
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

export function renderActionButtons() {
  const cmd = document.getElementById("command-buttons");
  cmd.innerHTML = `
    <button data-cmd="move">Move</button>
    <button data-cmd="look">Look Around</button>
    <button data-cmd="inventory">Inventory</button>
    <button data-cmd="guess">Ghost Guess</button>
    <button data-cmd="van">Return to Van</button>
    <button data-cmd="save">Save Game</button>
    <button data-cmd="load">Load Game</button>
  `;
  cmd.onclick = (e) => {
    if (e.target.dataset.cmd) handleCommand(e.target.dataset.cmd);
  };
}

/***********************
 === LOADOUT SELECTION ===
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
    if (tempHeld.length > 0) {
      confirmBtn.classList.add("active");
      confirmBtn.disabled = false;
    } else {
      confirmBtn.classList.remove("active");
      confirmBtn.disabled = true;
    }
  }

  window.addHeldItem = function (item) {
    const carryable = tempHeld.filter(x => x !== "Notebook" && x !== "Lighter");
    if (carryable.length >= 3) {
      logToGame("⚠️ Max 3 items (Notebook & Lighter excluded).");
      return;
    }
    tempHeld.push(item);
    tempVan = tempVan.filter(v => v !== item);
    renderLoadout();
  };

  window.removeHeldItem = function (item) {
    tempVan.push(item);
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
  };
}

/***********************
 === NOTEBOOK SYSTEM ===
************************/
export function openNotebook() {
  const notebook = document.getElementById("notebook");
  notebook.classList.add("open");
  populateGhostNotebook();
  clearNotebookDetails();
  clearNotebookUpdateBadge();
  syncSettingsPanel();
  playNotebookSound("open");
}

export function closeNotebook() {
  const notebook = document.getElementById("notebook");
  notebook.classList.remove("open");
  clearNotebookDetails();
  playNotebookSound("close");
}

export function isNotebookOpen() {
  return document.getElementById("notebook").classList.contains("open");
}

function clearNotebookDetails() {
  document.getElementById("selected-ghost-name").textContent = "// Ghost name will appear here //";
  document.getElementById("selected-ghost-image").src = "";
  document.getElementById("selected-ghost-details").textContent = "Select a ghost or item to see details.";
  document.getElementById("selected-ghost-evidence").innerHTML = "";
}

export function showNotebookUpdateBadge() {
  const badge = document.getElementById("notebook-update-badge");
  const btn = document.getElementById("notebook-toggle-btn");
  badge.style.display = "inline";
  btn.classList.add("shake");
  setTimeout(() => btn.classList.remove("shake"), 400);
}

export function clearNotebookUpdateBadge() {
  document.getElementById("notebook-update-badge").style.display = "none";
}

export function populateGhostNotebook() {
  const listContainer = document.getElementById("ghost-list");
  listContainer.innerHTML = "";
  Object.keys(ghostProfiles).forEach((ghostName, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${ghostName}`;
    li.addEventListener("click", () => showGhostDetails(ghostName));
    listContainer.appendChild(li);
  });
  updateHeldItemsNotebook();
  updateNearbyItemsNotebook();
}

export function updateHeldItemsNotebook() {
  const itemsList = document.getElementById("held-items-list");
  itemsList.innerHTML = "";
  const filteredHeldItems = game.inventory.filter(i => i !== "Notebook");
  if (filteredHeldItems.length > 0) {
    filteredHeldItems.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `• ${item}`;
      li.addEventListener("click", () => showItemDetails(item, "held"));
      itemsList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No items currently held.";
    itemsList.appendChild(li);
  }
}

export function updateNearbyItemsNotebook() {
  const nearbyList = document.getElementById("nearby-items-list");
  nearbyList.innerHTML = "";
  if (game.nearbyItems && game.nearbyItems.length > 0) {
    game.nearbyItems.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `• ${item}`;
      if (isCursedItem(item)) li.style.color = "darkpurple";
      li.addEventListener("click", () => showItemDetails(item, "nearby"));
      nearbyList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No nearby items.";
    nearbyList.appendChild(li);
  }
}

function showGhostDetails(ghostName) {
  const ghost = ghostProfiles[ghostName];
  document.getElementById("selected-ghost-name").textContent = ghostName;
  document.getElementById("selected-ghost-image").src = `img/${ghostName.replace(/\s+/g, '')}.png`;
  document.getElementById("selected-ghost-details").textContent = ghost.behavior || "No details available.";
  const evidenceList = document.getElementById("selected-ghost-evidence");
  evidenceList.innerHTML = "";
  ghost.evidence?.forEach(ev => {
    const li = document.createElement("li");
    li.textContent = `- ${ev}`;
    evidenceList.appendChild(li);
  });
}

function showItemDetails(itemName, source) {
  document.getElementById("selected-ghost-name").textContent = itemName;
  document.getElementById("selected-ghost-image").src = "";
  document.getElementById("selected-ghost-details").textContent = "Investigation tool.";
  const evidenceList = document.getElementById("selected-ghost-evidence");
  evidenceList.innerHTML = "";
  const actions = getItemActions(itemName, source);
  actions.forEach(action => {
    const btn = document.createElement("button");
    btn.textContent = action.label;
    btn.addEventListener("click", action.callback);
    evidenceList.appendChild(btn);
  });
}

function getItemActions(itemName, source) {
  const actions = [];
  if (source === "held" && itemName !== "Notebook") {
    actions.push({ label: "Place Item", callback: () => useItem(itemName) });
    actions.push({ label: "Use Item", callback: () => useItem(itemName) });
  } else if (source === "nearby") {
    actions.push({ label: "Pick Up", callback: () => pickItem(itemName) });
  }
  return actions;
}

function isCursedItem(itemName) {
  return ["Music Box", "Voodoo Doll", "Ouija Board", "Haunted Mirror", "Tarot Cards", "Summoning Circle"].includes(itemName);
}

/* === SETTINGS PANEL === */
function syncSettingsPanel() {
  document.getElementById("mute-sounds").checked = gameSettings.muteSounds;
  document.getElementById("narrator-voice").checked = gameSettings.narratorVoice;
  document.getElementById("mobile-mode").checked = gameSettings.mobileMode;
  document.getElementById("autosave-toggle").checked = gameSettings.autosave;
  document.getElementById("preload-dependencies").checked = gameSettings.preloadDependencies;
}

document.getElementById("open-settings-btn").addEventListener("click", () => {
  const panel = document.getElementById("settings-panel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
});
