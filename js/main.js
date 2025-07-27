/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAIN GAME FLOW (FINAL MASTER FIXED) ===
 * Handles title screen, loadout, investigation loop, and restart.
 * Fully compatible with ui.js, state.js, and modular event system.
 *****************************************************/
import { 
  game, randomFromArray, allRooms, possibleWeather, gameSettings, resetGame 
} from "./state.js";
import { 
  logToGame, renderHUD, showLoadout, confirmLoadout, updateBackground,
  clearNotebookDetails, populateGhostNotebook, clearNotebookUpdateBadge
} from "./ui.js";
import { preloadAllAudio, stopAllSounds } from "./audioManager.js";
import { advanceTurn } from "./events.js";
import { loadGame } from "./saveManager.js";

/***********************
 === INITIALIZATION ===
************************/
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame);
} else {
  initGame();
}

function initGame() {
  console.log("✅ Phasma‑Phoney v2.9 initialized.");
  if (gameSettings.preloadDependencies) preloadAllAudio();
  setupTitleScreen();
  setupUICommandListener();
  setupNotebookToggle(); // ✅ Notebook toggle wired
}

/***********************
 === TITLE SCREEN ===
************************/
function setupTitleScreen() {
  const titleScreen = document.getElementById("title-screen");
  const startBtn = document.getElementById("startButton");

  if (!startBtn) {
    console.error("❌ Start button not found in DOM!");
    return;
  }

  startBtn.disabled = false;
  startBtn.onclick = () => {
    console.log("🎬 Start Game button clicked!");
    startBtn.disabled = true;
    titleScreen.style.opacity = "0";
    setTimeout(() => {
      titleScreen.style.display = "none";
      promptContinueGame();
    }, 800);
  };
}

/***********************
 === CONTINUE OR NEW GAME ===
************************/
function promptContinueGame() {
  const savedState = localStorage.getItem("phasmaPhoneySave");
  if (savedState && confirm("Would you like to continue your last investigation?")) {
    loadGame();
    logToGame("Resuming previous investigation...");
    startInvestigation(true);
  } else {
    startNewGame();
  }
}

/***********************
 === START NEW GAME ===
************************/
function startNewGame() {
  resetGame();

  // ✅ Correct random ghost, weather, and ghost room selection
  const ghostKeys = Object.keys(gameSettings?.ghostProfiles || {});
  game.ghost = randomFromArray(ghostKeys.length ? ghostKeys : Object.keys(allRooms));
  game.weather = randomFromArray(possibleWeather);
  game.ghostRoom = randomFromArray(allRooms.filter(r => r !== "Van"));

  logToGame(`You are in the van. The weather is ${game.weather}.`);
  clearNotebookDetails();
  clearNotebookUpdateBadge();
  populateGhostNotebook();

  // ✅ Loadout & confirm flow
  showLoadout();
  const confirmBtn = document.getElementById("confirm-loadout");
  confirmBtn.onclick = null;
  confirmBtn.onclick = () => {
    confirmLoadout();
    startInvestigation();
  };
}

/***********************
 === START INVESTIGATION ===
************************/
export function startInvestigation(isResume = false) {
  if (!isResume) {
    game.playerRoom = "Van";
    game.currentTurn = 1;
    logToGame("You are ready to begin investigating.");
  } else {
    logToGame("Investigation resumed from your last save.");
  }

  renderHUD();
  updateBackground();

  document.getElementById("loadout-screen").style.display = "none";
  document.getElementById("main-scene").style.display = "block";
  document.getElementById("narrator-ui").style.display = "flex";

  advanceTurn();
}

/***********************
 === RESTART GAME ===
************************/
export function restartGame() {
  stopAllSounds();
  resetGame();

  document.getElementById("main-scene").style.display = "none";
  document.getElementById("narrator-ui").style.display = "none";
  document.getElementById("loadout-screen").style.display = "none";

  const ts = document.getElementById("title-screen");
  ts.style.display = "flex";
  ts.style.opacity = "1";

  clearNotebookDetails();
  clearNotebookUpdateBadge();
  console.log("🔄 Game restarted and returned to title screen.");
}

/***********************
 === NOTEBOOK TOGGLE ===
************************/
function setupNotebookToggle() {
  const notebook = document.getElementById("notebook");
  const btn = document.getElementById("notebook-toggle-btn");
  if (!btn || !notebook) return;

  btn.addEventListener("click", () => {
    const isVisible = notebook.style.display === "block";
    notebook.style.display = isVisible ? "none" : "block";
    if (!isVisible) clearNotebookUpdateBadge();
  });
}

/***********************
 === UI COMMAND HANDLER ===
************************/
function setupUICommandListener() {
  document.addEventListener("ui-command", (e) => {
    const cmd = e.detail;
    switch (cmd) {
      case "move":
        logToGame("You look for a path to move...");
        break;
      case "look":
        logToGame("You look around carefully...");
        advanceTurn();
        break;
      case "inventory":
        logToGame("Opening inventory...");
        break;
      case "guess":
        logToGame("You consider making a ghost guess...");
        break;
      case "van":
        if (game.playerRoom !== "Van") {
          logToGame("You return to the van.");
          game.playerRoom = "Van";
          advanceTurn();
          renderHUD();
          updateBackground();
        } else {
          logToGame("You are already in the van.");
        }
        break;
      default:
        logToGame(`⚠️ Unknown command: ${cmd}`);
    }
  });
}
