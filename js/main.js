/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAIN.JS (FINAL FIXED MASTER) ===
 * Handles game start, title screen, investigation flow,
 * notebook initialization, and command routing.
 *****************************************************/
import {
  game,
  resetGame as stateReset,
  possibleWeather,
  randomFromArray,
  allRooms
} from "./state.js";
import {
  renderHUD,
  renderActionButtons,
  setupNotebookToggle,
  populateGhostNotebook,
  showLoadout,
  confirmLoadout,
  updateBackground
} from "./ui.js";
import { preloadAllAudio } from "./audioManager.js";
import { checkTurnEvents } from "./events.js";
import { saveGame, clearSave } from "./saveManager.js";
import { updateCompassButtons } from "./map.js";

/***********************
 === INITIAL SETUP ===
************************/
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ PHASMA‑PHONEY v2.9 MAIN.JS Ready.");

  // ✅ Core UI Setup
  setupNotebookToggle();
  populateGhostNotebook();
  preloadAllAudio();

  const startButton = document.getElementById("startButton");
  const confirmBtn = document.getElementById("confirm-loadout");

  if (startButton) {
    startButton.addEventListener("click", () => {
      console.log("🎮 Starting new game — Loadout screen shown.");
      stateReset();
      assignWeather();
      assignRandomGhost();
      assignGhostRoom();

      document.getElementById("title-screen").style.display = "none";
      document.getElementById("main-scene").style.display = "block";
      document.getElementById("loadout-screen").style.display = "flex";

      showLoadout();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      confirmLoadout();
      startInvestigation();
    });
  }
});

/***********************
 === START INVESTIGATION ===
************************/
export function startInvestigation() {
  console.log(`🔎 Investigation begins — Ghost: ${game.ghost}, Room: ${game.ghostRoom}`);

  document.getElementById("loadout-screen").style.display = "none";
  document.getElementById("main-scene").style.display = "block";
  document.getElementById("narrator-ui").style.display = "flex";

  renderHUD();
  updateBackground();
  updateCompassButtons();
  renderActionButtons();
  checkTurnEvents();

  saveGame(true);
}

/***********************
 === RANDOM SETUP ===
************************/
function assignWeather() {
  game.weather = randomFromArray(possibleWeather);
}

function assignRandomGhost() {
  const ghosts = Object.keys(game.ghostProfiles || {});
  game.ghost = randomFromArray(ghosts);
}

function assignGhostRoom() {
  game.ghostRoom = randomFromArray(allRooms || ["Foyer", "Living Room", "Kitchen"]);
}

/***********************
 === COMMAND HANDLER ===
************************/
document.addEventListener("ui-command", (e) => {
  const cmd = e.detail;
  switch (cmd) {
    case "move":
      updateCompassButtons();
      break;
    case "look":
      console.log("👀 Looking around...");
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

/***********************
 === GHOST GUESS (SIMPLE)
************************/
function openGhostGuess() {
  const popup = document.getElementById("guess-popup");
  if (!popup) return;

  popup.style.display = "block";
  popup.innerHTML = Object.keys(game.ghostProfiles)
    .map(g => `<button onclick="window.makeGuess('${g}')">${g}</button>`)
    .join("");

  window.makeGuess = (ghost) => {
    alert(ghost === game.ghost ? `✅ Correct! It was ${ghost}` : `❌ Wrong! It was ${game.ghost}`);
    window.location.reload();
  };
}

/***********************
 === RETURN TO VAN ===
************************/
function returnToVan() {
  game.playerRoom = "Van";
  console.log("🚐 Returning to van...");
  renderHUD();
  updateBackground();
  updateCompassButtons();
  checkTurnEvents();
}

/***********************
 === CLEAR SAVE (DEBUG)
************************/
window.clearGameSave = () => {
  clearSave();
  alert("Save cleared.");
};
