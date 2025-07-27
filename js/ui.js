/*****************************************************
 * === PHASMA-PHONEY v2.9 — UI.JS (FINAL MODULAR) ===
 * Handles HUD, notebook, action buttons, and inventory display.
 *****************************************************/
import { game, ghostProfiles, roomVisuals, gameSettings, allLoadoutItems } from "./state.js";
import { saveGame } from "./saveManager.js";
import { useItem, pickItem } from "./items.js";
import { playNotebookSound } from "./audioManager.js";

/* === LOGGING === */
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

/* === HUD === */
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
  held.textContent = game.inventory.filter(i => i !== "Notebook").join(", ") || "None";

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
  const bg = document.getElementById("background");
  const room = roomVisuals[game.playerRoom];
  const dir = game.playerDirection || "N";
  if (bg && room && room[dir]) {
    bg.style.backgroundImage = `url('${room[dir]}')`;
  }
}

/* === ACTION BUTTONS === */
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

/* === NOTEBOOK === */
export function setupNotebookToggle() {
  const btn = document.getElementById("notebook-toggle-btn");
  const notebook = document.getElementById("notebook");
  if (!btn || !notebook) return;
  btn.addEventListener("click", () => {
    const isOpen = notebook.style.display === "block";
    notebook.style.display = isOpen ? "none" : "block";
    playNotebookSound(isOpen ? "close" : "open");
    if (!isOpen) clearNotebookUpdateBadge();
  });
}

export function showNotebookUpdateBadge() {
  const badge = document.getElementById("notebook-update-badge");
  if (badge) badge.style.display = "inline";
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
      li.onclick = () => useItem(item);
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
  if (game.nearbyItems.length) {
    game.nearbyItems.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `• ${item}`;
      li.onclick = () => pickItem(item);
      list.appendChild(li);
    });
  } else {
    list.innerHTML = "<li>No nearby items.</li>";
  }
}

export function populateGhostNotebook() {
  const ghostList = document.getElementById("ghost-notebook-list");
  if (!ghostList) return;
  ghostList.innerHTML = "";
  Object.entries(ghostProfiles).forEach(([name, data]) => {
    const li = document.createElement("li");
    li.textContent = `${name} — Evidence: ${data.evidence.join(", ")}`;
    ghostList.appendChild(li);
  });
}

/* === LOADOUT === */
let tempHeld = [], tempVan = [];

export function showLoadout() {
  tempHeld = [];
  tempVan = [...allLoadoutItems];

  const heldList = document.getElementById("held-list");
  const vanList = document.getElementById("van-list");
  const confirmBtn = document.getElementById("confirm-loadout");

  function render() {
    heldList.innerHTML = tempHeld.map(i => `<button onclick="removeHeldItem('${i}')">${i}</button>`).join("");
    vanList.innerHTML = tempVan.map(i => `<button onclick="addHeldItem('${i}')">${i}</button>`).join("");
    confirmBtn.disabled = tempHeld.length === 0;
  }

  window.addHeldItem = function (i) {
    if (tempHeld.filter(x => x !== "Notebook" && x !== "Lighter").length >= 3) {
      logToGame("⚠️ Max 3 items allowed.");
      return;
    }
    tempHeld.push(i);
    tempVan = tempVan.filter(v => v !== i);
    render();
  };

  window.removeHeldItem = function (i) {
    tempVan.push(i);
    tempHeld = tempHeld.filter(h => h !== i);
    render();
  };

  render();
  document.getElementById("loadout-screen").style.display = "flex";
}

export function confirmLoadout() {
  game.inventory = [...tempHeld, "Notebook", "Lighter"];
  game.confirmedLoadout = [...tempHeld];
  game.vanStock = [...tempVan];
  document.getElementById("loadout-screen").style.display = "none";
  logToGame("✅ Loadout confirmed. Ready to investigate.");
  if (gameSettings.autosave) saveGame(true);
}
