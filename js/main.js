/***************************************************** 
 * === PHASMA‑PHONEY v2.9 — MAIN.JS (FINAL MASTER) ===
 * Game start, title screen, investigation, UI routing.
 *****************************************************/
import {
  game, resetGame as stateReset,
  possibleWeather, randomFromArray,
  ghostProfiles, allRooms
} from "./state.js";

import {
  renderHUD, renderActionButtons,
  setupNotebookToggle, populateGhostNotebook,
  updateBackground, logToGame,
  renderInventoryList
} from "./ui.js";

import { showLoadout } from "./ui.js";
import { preloadAllAudio } from "./audioManager.js";
import { checkTurnEvents } from "./events.js";
import { clearSave } from "./saveManager.js";

/****************************
 * === CONFIRM LOADOUT ===
 ****************************/
export function confirmLoadout() {
  const loadout = document.getElementById("loadout-screen");
  if (loadout) loadout.style.display = "none";

  const scene = document.getElementById("main-scene");
  if (scene) scene.style.display = "block";

  const narrator = document.getElementById("narrator-ui");
  if (narrator) narrator.style.display = "flex";

  if (game.confirmedLoadout?.length) {
    game.inventory = [...game.confirmedLoadout];
  }

  renderHUD();
  renderInventoryList?.();
}

/****************************
 * === INVESTIGATION START ===
 ****************************/
export function startInvestigation(newGame = true) {
  const loadout = document.getElementById("loadout-screen");
  if (loadout) loadout.style.display = "none";

  const scene = document.getElementById("main-scene");
  if (scene) scene.style.display = "block";

  const narrator = document.getElementById("narrator-ui");
  if (narrator) narrator.style.display = "flex";

  if (newGame) {
    stateReset();
    assignWeather();
    assignRandomGhost();
    assignGhostRoom();
    game.playerRoom = "Van";
    game.playerDirection = "N";
    game.sanity = 100;
    game.currentTurn = 1;
    game.inventory = [...game.confirmedLoadout];
    game.itemsPlaced = {};
  }

  updateBackground();
  renderHUD();
  renderActionButtons();
  setupNotebookToggle();
  populateGhostNotebook();

  logToGame("🚪 You arrive at the haunted location.");
  logToGame(`🌦️ Weather: ${game.weather}`);
  logToGame("🧽 Your starting point is the Van. Good luck.");

  preloadAllAudio();

  const log = document.getElementById("game-log");
  if (log) log.scrollTop = log.scrollHeight;
}

/****************************
 * === INITIAL SETUP LOGIC ===
 ****************************/
document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("startButton");
  setupNotebookToggle();
  populateGhostNotebook();
  preloadAllAudio();

  if (startButton) {
    startButton.addEventListener("click", () => {
      document.getElementById("title-screen").style.display = "none";
      document.getElementById("loadout-screen").style.display = "flex";
      showLoadout();
    });
  }

  const confirmBtn = document.getElementById("confirm-loadout");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      confirmLoadout();
      setTimeout(() => {
        startInvestigation(true);
      }, 100);
    });
  }
});

/*******************************
 * === RANDOM SETUP FUNCTIONS ===
 *******************************/
function assignWeather() {
  game.weather = randomFromArray(possibleWeather);
}

function assignRandomGhost() {
  const ghosts = Object.keys(ghostProfiles);
  game.ghost = randomFromArray(ghosts);
}

function assignGhostRoom() {
  game.ghostRoom = randomFromArray(allRooms.filter(r => r !== "Van"));
}

/****************************
 * === COMMAND UI HANDLER ===
 ****************************/
document.addEventListener("ui-command", (e) => {
  const cmd = e.detail;
  switch (cmd) {
    case "move":
      logToGame("🧽 Use compass buttons to move.");
      break;
    case "look":
      logToGame("👀 You look around carefully...");
      break;
    case "inventory":
      import("./items.js").then(m => m.openInventoryOverlay());
      break;
    case "guess":
      openGhostGuess();
      break;
    case "van":
      returnToVan();
      break;
  }
});

/****************************
 * === GHOST GUESS POPUP ===
 ****************************/
function openGhostGuess() {
  const popup = document.getElementById("guess-popup");
  if (!popup) return;
  popup.style.display = "block";
  popup.innerHTML = Object.keys(ghostProfiles)
    .map(g => `<button onclick="window.makeGuess('${g}')">${g}</button>`)
    .join("");
  window.makeGuess = (ghost) => {
    alert(ghost === game.ghost
      ? `✅ Correct! It was ${ghost}.`
      : `❌ Wrong! It was actually ${game.ghost}.`);
    window.location.reload();
  };
}

/****************************
 * === RETURN TO VAN ===
 ****************************/
function returnToVan() {
  game.playerRoom = "Van";
  renderHUD();
  updateBackground();
  checkTurnEvents();
}

/****************************
 * === CLEAR SAVE DEBUG ===
 ****************************/
window.clearGameSave = () => {
  clearSave();
  alert("Save cleared.");
};
