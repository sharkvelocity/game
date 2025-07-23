/*****************************************************
 * === PHASMA-PHONEY v2.9 — UI HANDLING ===
 * HUD updates, logging, and loadout UI logic.
 *****************************************************/
import { game, allLoadoutItems } from "./state.js";

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
  document.getElementById("hud-location").textContent = game.playerRoom;
  document.getElementById("hud-weather").textContent = game.weather || "--";
  document.getElementById("hud-turns").textContent = game.currentTurn;
  document.getElementById("held-items-display").textContent =
    game.inventory.length ? game.inventory.join(", ") : "None";

  updateSanityBar();
}

export function updateSanityBar() {
  const bar = document.getElementById("sanity-bar");
  const s = Math.max(0, Math.floor(game.sanity));
  bar.style.width = s + "%";
  bar.style.background = s > 66 ? "#0f0" : s > 33 ? "#ff0" : "#f00";
}

export function showLoadout() {
  let tempHeld = [];
  let tempVan = [...allLoadoutItems];

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

    confirmBtn.classList.toggle("active", tempHeld.length > 0);
    confirmBtn.disabled = tempHeld.length === 0;
  }

  window.addHeldItem = (item) => {
    if (tempHeld.length >= 3) {
      logToGame("⚠️ You can only hold 3 items.");
      return;
    }
    tempHeld.push(item);
    tempVan = tempVan.filter(v => v !== item);
    renderLoadout();
  };

  window.removeHeldItem = (item) => {
    tempVan.push(item);
    tempHeld = tempHeld.filter(h => h !== item);
    renderLoadout();
  };

  confirmBtn.onclick = () => {
    if (!confirmBtn.classList.contains("active")) return;
    confirmLoadout(tempHeld, tempVan);
  };

  renderLoadout();
  document.getElementById("loadout-screen").style.display = "flex";
}

export function confirmLoadout(tempHeld, tempVan) {
  game.inventory = [...tempHeld, "Notebook", "Lighter"];
  game.vanStock = [...tempVan];
  document.getElementById("loadout-screen").style.display = "none";
}
