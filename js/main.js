/*****************************************************
 * === PHASMA-PHONEY v2.6 — MAIN GAME FLOW ===
 * Handles title screen, loadout, investigation start,
 * and restart logic.
 *****************************************************/

import { game, randomFromArray, allRooms, possibleWeather } from "./state.js";
import { logToGame, renderHUD, showLoadout, confirmLoadout, updateBackground } from "./ui.js";
import { preloadAllAudio } from "./audioManager.js";
import { ghostBehaviorTable } from "./ghostBehavior.js";
import { advanceTurn } from "./ghostBehavior.js";

// === INITIAL SETUP ===
document.addEventListener("DOMContentLoaded", () => {
  preloadAllAudio();
  setupTitleScreen();
  renderHUD();
});

// === TITLE SCREEN ===
function setupTitleScreen() {
  const titleScreen = document.getElementById("title-screen");
  const startBtn = document.getElementById("start-button");

  startBtn.addEventListener("click", () => {
    titleScreen.style.opacity = "0";
    setTimeout(() => {
      titleScreen.style.display = "none";
      startNewGame();
    }, 1000);
  });
}

// === START A NEW GAME ===
function startNewGame() {
  // Reset core game state
  game.currentTurn = 0;
  game.sanity = 100;
  game.usedCursedItems = {};
  game.roomItems = {};
  game.smudgeActive = 0;
  game.huntCooldown = 0;
  game.placedCrucifix = {};
  game.mimicForm = null;
  game.nextMimicShift = 0;

  // Random ghost & weather
  const ghostList = Object.keys(ghostBehaviorTable);
  game.ghost = randomFromArray(ghostList);
  game.weather = randomFromArray(possibleWeather);

  // Random ghost room (not Van)
  const rooms = allRooms.filter(r => r !== "Van");
  game.ghostRoom = randomFromArray(rooms);

  // Debug log
  console.log(`Ghost Selected: ${game.ghost} in ${game.ghostRoom}`);
  logToGame(`You are in the van. The weather is ${game.weather}.`);

  // Show loadout screen
  showLoadout();

  // Hook up confirm button
  const confirmBtn = document.getElementById("confirm-loadout");
  confirmBtn.onclick = () => {
    confirmLoadout();
    startInvestigation();
  };
}

// === START INVESTIGATION ===
function startInvestigation() {
  game.playerRoom = "Van";
  game.currentTurn = 1;
  renderHUD();
  updateBackground();
  logToGame("You are ready to begin investigating.");

  document.getElementById("game-ui").style.display = "block";
  document.getElementById("narrator-ui").style.display = "flex";

  advanceTurn();
}

// === RESTART GAME ===
export function restartGame() {
  stopAllSounds();
  document.getElementById("game-ui").style.display = "none";
  document.getElementById("title-screen").style.display = "flex";
  document.getElementById("title-screen").style.opacity = "1";
  setupTitleScreen();
}
