/*****************************************************
 * === PHASMA-PHONEY v2.9 — UI MODULE (FINAL FIXED) ===
 * Handles HUD, logging, notebook, loadout, and van monitor sync.
 * Uses ui-command events instead of handleCommand.
 *****************************************************/
import { game, allLoadoutItems, roomVisuals, gameSettings } from "./state.js";
import { saveGame } from "./saveManager.js";
import { playNotebookSound } from "./audioManager.js";
import { useItem, pickItem } from "./items.js";
/*****************************************************
 * === PHASMA-PHONEY v2.9 — UI MODULE (FINAL FIXED) ===
 * Handles HUD, logging, notebook, loadout, and van monitor sync.
 * Uses ui-command events instead of handleCommand.
 *****************************************************/
import { game, allLoadoutItems, roomVisuals, gameSettings, ghostProfiles } from "./state.js";
import { saveGame } from "./saveManager.js";
import { playNotebookSound } from "./audioManager.js";
import { useItem, pickItem } from "./items.js";

/***********************
 === LOGGING & HUD ===
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
 === ACTION BUTTONS (UI COMMANDS) ===
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
 === NOTEBOOK SYSTEM (FULL) ===
************************/
export function showNotebookUpdateBadge() {
  const badge = document.getElementById("notebook-update-badge");
  const btn = document.getElementById("notebook-toggle-btn");
  if (!badge || !btn) return;
  badge.style.display = "inline";
  btn.classList.add("shake");
  setTimeout(() => btn.classList.remove("shake"), 400);
}

export function clearNotebookUpdateBadge() {
  const badge = document.getElementById("notebook-update-badge");
  if (badge) badge.style.display = "none";
}

export function updateHeldItemsNotebook() {
  const list = document.getElementById("held-items-list");
  if (!list) return;
  list.innerHTML = "";
  const held = game.inventory.filter(i => i !== "Notebook");
  if (held.length) {
    held.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `• ${item}`;
      li.addEventListener("click", () => useItem(item));
      list.appendChild(li);
    });
  } else {
    list.innerHTML = "<li>No items currently held.</li>";
  }
}

export function updateNearbyItemsNotebook() {
  const list = document.getElementById("nearby-items-list");
  if (!list) return;
  list.innerHTML = "";
  if (game.nearbyItems && game.nearbyItems.length) {
    game.nearbyItems.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `• ${item}`;
      li.addEventListener("click", () => pickItem(item));
      list.appendChild(li);
    });
  } else {
    list.innerHTML = "<li>No nearby items.</li>";
  }
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
  if (!heldList || !vanList || !confirmBtn) return;

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
}

/***********************
 ✅ CONFIRM LOADOUT (NEW EXPORT)
************************/
export function confirmLoadout() {
  const confirmBtn = document.getElementById("confirm-loadout");
  if (!confirmBtn.classList.contains("active")) {
    logToGame("⚠️ Select at least one item before confirming.");
    return;
  }

  game.inventory = [...tempHeld, "Notebook", "Lighter"];
  game.confirmedLoadout = [...tempHeld]; // ✅ Track chosen starting items
  game.vanStock = [...tempVan];

  document.getElementById("loadout-screen").style.display = "none";
  logToGame("✅ Loadout confirmed. Ready to investigate!");

  if (gameSettings.autosave) saveGame(true);
}

/***********************
 === NOTEBOOK EXTRA
************************/
export function clearNotebookDetails() {
  const heldList = document.getElementById("held-items-list");
  const nearbyList = document.getElementById("nearby-items-list");
  if (heldList) heldList.innerHTML = "<li>No items currently held.</li>";
  if (nearbyList) nearbyList.innerHTML = "<li>No nearby items.</li>";
}

export function populateGhostNotebook() {
  const ghostList = document.getElementById("ghost-notebook-list");
  if (!ghostList) return;
  ghostList.innerHTML = "";
  Object.entries(ghostProfiles).forEach(([ghost, data]) => {
    const li = document.createElement("li");
    li.textContent = `${ghost} — Evidence: ${data.evidence.join(", ")}`;
    ghostList.appendChild(li);
  });
}

/***********************
 === LOGGING & HUD ===
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
 === ACTION BUTTONS (UI COMMANDS) ===
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
 === NOTEBOOK SYSTEM (FULL) ===
************************/
export function showNotebookUpdateBadge() {
  const badge = document.getElementById("notebook-update-badge");
  const btn = document.getElementById("notebook-toggle-btn");
  if (!badge || !btn) return;
  badge.style.display = "inline";
  btn.classList.add("shake");
  setTimeout(() => btn.classList.remove("shake"), 400);
}

export function clearNotebookUpdateBadge() {
  const badge = document.getElementById("notebook-update-badge");
  if (badge) badge.style.display = "none";
}

export function updateHeldItemsNotebook() {
  const list = document.getElementById("held-items-list");
  if (!list) return;
  list.innerHTML = "";
  const held = game.inventory.filter(i => i !== "Notebook");
  if (held.length) {
    held.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `• ${item}`;
      li.addEventListener("click", () => useItem(item));
      list.appendChild(li);
    });
  } else {
    list.innerHTML = "<li>No items currently held.</li>";
  }
}

export function updateNearbyItemsNotebook() {
  const list = document.getElementById("nearby-items-list");
  if (!list) return;
  list.innerHTML = "";
  if (game.nearbyItems && game.nearbyItems.length) {
    game.nearbyItems.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `• ${item}`;
      li.addEventListener("click", () => pickItem(item));
      list.appendChild(li);
    });
  } else {
    list.innerHTML = "<li>No nearby items.</li>";
  }
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
  if (!heldList || !vanList || !confirmBtn) return;

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
 === NOTEBOOK EXTRA (NEWLY FIXED) ===
************************/
export function clearNotebookDetails() {
  const heldList = document.getElementById("held-items-list");
  const nearbyList = document.getElementById("nearby-items-list");
  if (heldList) heldList.innerHTML = "<li>No items currently held.</li>";
  if (nearbyList) nearbyList.innerHTML = "<li>No nearby items.</li>";
}

export function populateGhostNotebook() {
  const ghostList = document.getElementById("ghost-notebook-list");
  if (!ghostList) return;
  ghostList.innerHTML = "";
  Object.entries(ghostProfiles).forEach(([ghost, data]) => {
    const li = document.createElement("li");
    li.textContent = `${ghost} — Evidence: ${data.evidence.join(", ")}`;
    ghostList.appendChild(li);
  });
}
