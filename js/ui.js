/*****************************************************
 * === PHASMA-PHONEY v2.9 — UI & HUD MANAGEMENT ===
 *****************************************************/
import { game, allRooms } from "./state.js";
import { logToGame } from "./ui_log.js"; // <- optional, or remove if not using external log file

// === LOG TO GAME (fallback if no external log file) ===
export function logToGame(msg) {
  const log = document.getElementById("game-log");
  if (!log) return;
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.textContent = msg;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// === RENDER HUD ===
export function renderHUD() {
  document.getElementById("hud-location").textContent = game.playerRoom;
  document.getElementById("hud-weather").textContent = game.weather || "--";
  document.getElementById("hud-turns").textContent = game.currentTurn;
  document.getElementById("sanity-bar").style.width = `${game.sanity}%`;

  // sanity color change
  if (game.sanity > 60) {
    document.getElementById("sanity-bar").style.background = "#0f0";
  } else if (game.sanity > 30) {
    document.getElementById("sanity-bar").style.background = "#ff0";
  } else {
    document.getElementById("sanity-bar").style.background = "#f00";
  }

  const heldItems = game.inventory.length
    ? game.inventory.join(", ")
    : "None";
  document.getElementById("held-items-display").textContent = heldItems;
}

// === SHOW LOADOUT ===
export function showLoadout() {
  const loadoutScreen = document.getElementById("loadout-screen");
  const heldList = document.getElementById("held-list");
  const vanList = document.getElementById("van-list");
  const confirmBtn = document.getElementById("confirm-loadout");

  loadoutScreen.style.display = "flex";
  heldList.innerHTML = "";
  vanList.innerHTML = "";
  confirmBtn.disabled = true;
  confirmBtn.classList.remove("active");

  const maxHeld = 3;
  let held = [];
  let van = [...game.vanStock];

  function renderLists() {
    heldList.innerHTML = held
      .map((item, i) => `<button data-i="${i}" class="item-button selected">${item}</button>`)
      .join("");
    vanList.innerHTML = van
      .map((item, i) => `<button data-i="${i}" class="item-button">${item}</button>`)
      .join("");
    confirmBtn.disabled = held.length === 0;
    confirmBtn.classList.toggle("active", held.length > 0);
  }

  heldList.onclick = (e) => {
    if (e.target.dataset.i !== undefined) {
      const i = +e.target.dataset.i;
      van.push(held[i]);
      held.splice(i, 1);
      renderLists();
    }
  };

  vanList.onclick = (e) => {
    if (e.target.dataset.i !== undefined && held.length < maxHeld) {
      const i = +e.target.dataset.i;
      held.push(van[i]);
      van.splice(i, 1);
      renderLists();
    }
  };

  renderLists();

  confirmBtn.onclick = () => {
    game.inventory = [...held, "Notebook", "Lighter"];
    game.vanStock = [...van];
    loadoutScreen.style.display = "none";
  };
}

// === UPDATE BACKGROUND ===
export function updateBackground() {
  const bg = document.getElementById("background");
  const visuals = game.playerRoom in allRooms ? game.playerRoom : "Van";
  const dir = game.playerDirection || "N";
  bg.style.backgroundImage = `url('images/${visuals}_${dir}.png')`;
}