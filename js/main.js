/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAIN GAME FLOW (FINAL MASTER) ===
 *****************************************************/
import { game, randomFromArray, allRooms, possibleWeather, gameSettings, resetGame } from "./state.js";
import { logToGame, renderHUD, showLoadout, confirmLoadout, updateBackground, clearNotebookDetails, populateGhostNotebook, clearNotebookUpdateBadge } from "./ui.js";
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
  setupNotebookToggle();
  setupAudioSettings();
}

/***********************
 === AUDIO SETTINGS ===
************************/
function setupAudioSettings() {
  const muteToggle = document.getElementById("mute-sounds");
  if (!muteToggle) return;
  muteToggle.addEventListener("change", () => {
    gameSettings.muteSounds = muteToggle.checked;
    if (muteToggle.checked) stopAllSounds();
  });
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
    console.log("🎬 Start clicked!");
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
  if (savedState && confirm("Continue previous investigation?")) {
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
  game.ghost = randomFromArray(Object.keys(gameSettings));
  game.weather = randomFromArray(possibleWeather);
  game.ghostRoom = randomFromArray(allRooms.filter(r => r !== "Van"));

  logToGame(`You are in the van. The weather is ${game.weather}.`);
  clearNotebookDetails();
  clearNotebookUpdateBadge();
  populateGhostNotebook();

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
    logToGame("Investigation resumed.");
  }
  renderHUD();
  updateBackground();
  document.getElementById("loadout-screen").style.display = "none";
  document.getElementById("main-scene").style.display = "block";
  document.getElementById("narrator-ui").style.display = "flex";
  advanceTurn();
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
 === UI COMMANDS ===
************************/
function setupUICommandListener() {
  document.addEventListener("ui-command", (e) => {
    const cmd = e.detail;
    switch (cmd) {
      case "move": logToGame("You look for a path to move..."); break;
      case "look": logToGame("You look around carefully..."); advanceTurn(); break;
      case "inventory": logToGame("Opening inventory..."); break;
      case "guess": logToGame("You consider making a ghost guess..."); break;
      case "van":
        if (game.playerRoom !== "Van") {
          logToGame("You return to the van.");
          game.playerRoom = "Van";
          advanceTurn();
          renderHUD();
          updateBackground();
        } else logToGame("You are already in the van.");
        break;
      default: logToGame(`⚠️ Unknown command: ${cmd}`);
    }
  });
}
