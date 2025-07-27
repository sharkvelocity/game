/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAIN.JS (FIXED MASTER) ===
 *****************************************************/
import { game, resetGame as stateReset, possibleWeather, randomFromArray, roomVisuals, ghostProfiles } from "./state.js";
import { renderHUD, renderActionButtons, setupNotebookToggle, populateGhostNotebook, updateBackground } from "./ui.js";
import { showLoadout, confirmLoadout } from "./ui.js";
import { preloadAllAudio } from "./audioManager.js";
import { checkTurnEvents } from "./events.js";
import { saveGame, clearSave } from "./saveManager.js";

/***********************
 === INITIAL SETUP ===
************************/
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

  document.getElementById("confirm-loadout").addEventListener("click", () => {
    confirmLoadout();
    startInvestigation();
  });
});

/***********************
 === START INVESTIGATION ===
************************/
export function startInvestigation(newGame = true) {
  document.getElementById("loadout-screen").style.display = "none";
  document.getElementById("main-scene").style.display = "block";
  document.getElementById("narrator-ui").style.display = "flex";

  if (newGame) {
    stateReset();
    assignWeather();
    assignRandomGhost();
    assignGhostRoom();
    saveGame(true);
  }

  renderHUD();
  updateBackground();
  renderActionButtons();
  checkTurnEvents();
  console.log("✅ Investigation started");
}

function assignWeather() {
  game.weather = randomFromArray(possibleWeather);
}

function assignRandomGhost() {
  const ghosts = Object.keys(ghostProfiles || {});
  game.ghost = randomFromArray(ghosts);
}

function assignGhostRoom() {
  const rooms = Object.keys(roomVisuals).filter(r => r !== "Van");
  game.ghostRoom = randomFromArray(rooms);
}

/***********************
 === COMMAND HANDLER ===
************************/
document.addEventListener("ui-command", (e) => {
  const cmd = e.detail;
  switch (cmd) {
    case "move":
      console.log("Move command coming soon!");
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

function openGhostGuess() {
  alert("Ghost guessing coming soon!");
}

function returnToVan() {
  game.playerRoom = "Van";
  renderHUD();
  updateBackground();
  checkTurnEvents();
}

window.clearGameSave = () => { clearSave(); alert("Save cleared."); };
