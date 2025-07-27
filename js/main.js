/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAIN.JS (FINAL MASTER) ===
 *****************************************************/
import { game, resetGame as stateReset, possibleWeather, randomFromArray, roomVisuals } from "./state.js";
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
  const titleScreen = document.getElementById("title-screen");

  setupNotebookToggle();
  populateGhostNotebook();
  preloadAllAudio();

  if (startButton) {
    startButton.addEventListener("click", () => {
      titleScreen.style.display = "none";
      document.getElementById("loadout-screen").style.display = "flex";
      showLoadout();
    });
  }

  const confirmBtn = document.getElementById("confirm-loadout");
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
      console.log("Compass movement triggered.");
      break;
    case "look":
      console.log("👀 Looking around (future detailed logic here)");
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
    alert(ghost === game.ghost ? "✅ Correct! It was " + ghost : "❌ Wrong! It was " + game.ghost);
    window.location.reload();
  };
}

/***********************
 === RETURN TO VAN ===
************************/
function returnToVan() {
  game.playerRoom = "Van";
  renderHUD();
  updateBackground();
  checkTurnEvents();
}

/***********************
 === CLEAR SAVE (DEBUG)
************************/
window.clearGameSave = () => {
  clearSave();
  alert("Save cleared.");
};
