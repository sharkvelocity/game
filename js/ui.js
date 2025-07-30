/*****************************************************
 * === PHASMA-PHONEY v2.9 — UI.JS (FINAL PATCHED) ===
 * Handles HUD, inventory display, notebook updates,
 * evidence sync, and interaction UI overlays.
 *****************************************************/
import { game, gameSettings } from "./state.js";
import { useItem } from "./items.js";
import { logToGame } from "./events.js";

/***********************
 === RENDER HUD
************************/
export function renderHUD() {
  const sanityBar = document.getElementById("sanity-bar");
  const turnCount = document.getElementById("turn-count");
  const locationText = document.getElementById("location");
  const tempText = document.getElementById("temp-reading");
  const heldItems = document.getElementById("held-items");

  if (sanityBar) sanityBar.style.width = `${game.sanity}%`;
  if (turnCount) turnCount.textContent = `Turn ${game.currentTurn}`;
  if (locationText) locationText.textContent = `📍 ${game.playerRoom}`;
  if (tempText) tempText.textContent = getRoomTemperature();

  const items = game.inventory.filter(i => i !== "Notebook" && i !== "Lighter");
  if (heldItems) {
    heldItems.innerHTML = items.length
      ? items.map(i => `<span class="item-held">${i}</span>`).join(", ")
      : "<em>None</em>";
  }
}

/***********************
 === INVENTORY OVERLAY
************************/
export function toggleInventoryOverlay() {
  const overlay = document.getElementById("inventory-overlay");
  if (!overlay) return;
  if (overlay.style.display === "flex") {
    overlay.style.display = "none";
  } else {
    overlay.style.display = "flex";
    renderInventoryList();
  }
}

function renderInventoryList() {
  const list = document.getElementById("inventory-list");
  if (!list) return;
  list.innerHTML = "";

  const inv = game.inventory.filter(i => i !== "Notebook");
  if (!inv.length) {
    list.innerHTML = "<p>No items currently held.</p>";
    return;
  }

  inv.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "inventory-item-btn";
    btn.textContent = item;
    btn.onclick = () => {
      useItem(item);
      toggleInventoryOverlay();
    };
    list.appendChild(btn);
  });
}

/***********************
 === NOTEBOOK SYSTEM
************************/
export function toggleNotebook() {
  const nb = document.getElementById("notebook");
  if (!nb) return;
  nb.classList.toggle("open");
}

export function updateHeldItemsNotebook() {
  const el = document.getElementById("notebook-held");
  if (!el) return;
  const items = game.inventory.filter(i => i !== "Notebook" && i !== "Lighter");
  el.innerHTML = items.length
    ? items.map(i => `<li>${i}</li>`).join("")
    : "<li><em>None</em></li>";
}

export function updateNearbyItemsNotebook() {
  const el = document.getElementById("notebook-nearby");
  if (!el) return;
  const items = game.nearbyItems || [];
  el.innerHTML = items.length
    ? items.map(i => `<li>${i}</li>`).join("")
    : "<li><em>None</em></li>";
}

export function updateEvidenceNotebook() {
  const el = document.getElementById("notebook-evidence");
  if (!el) return;
  const found = Array.from(game.selectedEvidence);
  el.innerHTML = found.length
    ? found.map(e => `<li>${e}</li>`).join("")
    : "<li><em>No evidence yet.</em></li>";
}

export function showNotebookUpdateBadge() {
  const badge = document.getElementById("notebook-badge");
  if (badge) {
    badge.style.opacity = 1;
    setTimeout(() => badge.style.opacity = 0, 1500);
  }
}

/***********************
 === TEMP (HUD SIM)
************************/
function getRoomTemperature() {
  if (game.inventory.includes("Thermometer")) {
    const temp = game.playerRoom === game.ghostRoom ? 3 : 18 + Math.floor(Math.random() * 5);
    return `${temp}°C`;
  }
  return "??°C";
}
