/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAIN GAME FLOW (FINAL FIXED) ===
 * Fully integrated with Notebook, Settings & Resume.
 * Now listens for UI command events instead of direct handleCommand calls.
 *****************************************************/
import { 
  game, randomFromArray, allRooms, possibleWeather, gameSettings, resetGame 
} from "./state.js";
import { 
  logToGame, renderHUD, showLoadout, confirmLoadout, updateBackground,
  clearNotebookDetails, populateGhostNotebook, clearNotebookUpdateBadge
} from "./ui.js";
import { preloadAllAudio, stopAllSounds } from "./audioManager.js";
import { ghostBehaviorTable } from "./ghostBehavior.js";
import { advanceTurn } from "./events.js";
import { loadGame } from "./saveManager.js";
import { openInventoryOverlay } from "./items.js"; // ✅ Needed for Inventory UI

/***********************
 === INITIALIZATION ===
************************/
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame);
} else {
  initGame();
}

function initGame() {
  if (gameSettings.preloadDependencies) preloadAllAudio();
  setupTitleScreen();
  setupUICommandListener(); // ✅ NEW: Hook UI command events
}

/***********************
 === TITLE SCREEN ===
************************/
function setupTitleScreen() {
  const titleScreen = document.getElementById("title-screen");
  const startBtn = document.getElementById("startButton");

  if (!startBtn) {
    console.error("❌ Start button not found!");
    return;
  }

  startBtn.disabled = false; 

  startBtn.onclick = () => {
    startBtn.disabled = true; 
    titleScreen.style.opacity = "0";
    setTimeout(() => {
      titleScreen.style.display = "none";
      promptContinueGame();
    }, 1000);
  };
}

/***********************
 === CONTINUE OR START NEW ===
************************/
function promptContinueGame() {
  const savedState = localStorage.getItem("phasmaPhoneySave");
  if (savedState) {
    const continueGame = confirm("Would you like to continue where you left off?");
    if (continueGame) {
      loadGame();
      logToGame("Resuming your previous investigation...");
      startInvestigation(true);
      return;
    }
  }
  startNewGame();
}

/***********************
 === START NEW GAME ===
************************/
function startNewGame() {
  resetGame();

  Object.assign(game, {
    ghost: randomFromArray(Object.keys(ghostBehaviorTable)),
    weather: randomFromArray(possibleWeather),
    ghostRoom: randomFromArray(allRooms.filter(r => r !== "Van"))
  });

  logToGame(`You are in the van. The weather is ${game.weather}.`);
  showLoadout();

  clearNotebookDetails();
  clearNotebookUpdateBadge();
  populateGhostNotebook();

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
    logToGame("Investigation resumed.");
  }

  renderHUD();
  updateBackground();

  const scene = document.getElementById("main-scene");
  const narrator = document.getElementById("narrator-ui");
  const loadout = document.getElementById("loadout-screen");

  if (loadout) loadout.style.display = "none";
  if (scene) scene.style.display = "block";
  if (narrator) narrator.style.display = "flex";

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
}

/***********************
 === UI COMMAND LISTENER (NEW)
************************/
function setupUICommandListener() {
  document.addEventListener("ui-command", (e) => {
    const cmd = e.detail;
    switch (cmd) {
      case "move":
        logToGame("You look for a path to move... (movement UI coming soon)");
        break;
      case "look":
        logToGame("You look around carefully...");
        advanceTurn();
        break;
      case "inventory":
        openInventoryOverlay();
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
