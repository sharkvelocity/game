/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAIN GAME FLOW (FIXED) ===
 *****************************************************/
import { game, randomFromArray, allRooms, possibleWeather } from "./state.js";
import { logToGame, renderHUD, showLoadout, confirmLoadout, updateBackground } from "./ui.js";
import { preloadAllAudio, stopAllSounds } from "./audioManager.js";
import { ghostProfiles } from "./state.js"; 
import { advanceTurn } from "./events.js";

document.addEventListener("DOMContentLoaded", () => {
  preloadAllAudio();
  setupTitleScreen();
});

function setupTitleScreen() {
  const titleScreen = document.getElementById("title-screen");
  const startBtn = document.getElementById("startButton");

  if (!startBtn) {
    console.error("❌ Start button not found in DOM!");
    return;
  }

  startBtn.addEventListener("click", () => {
    titleScreen.style.opacity = "0";
    setTimeout(() => {
      titleScreen.style.display = "none";
      startNewGame();
    }, 1000);
  });
}

function startNewGame() {
  // Reset core game state
  Object.assign(game, {
    currentTurn: 0,
    sanity: 100,
    usedCursedItems: {},
    roomItems: {},
    smudgeActive: 0,
    huntCooldown: 0,
    placedCrucifix: {},
    mimicForm: null,
    nextMimicShift: 0
  });

  game.ghost = randomFromArray(Object.keys(ghostProfiles));
  game.weather = randomFromArray(possibleWeather);
  game.ghostRoom = randomFromArray(allRooms.filter((r) => r !== "Van"));

  logToGame(`You are in the van. The weather is ${game.weather}.`);

  // Show Loadout Screen
  showLoadout();

  const confirmBtn = document.getElementById("confirm-loadout");
  confirmBtn.onclick = () => {
    confirmLoadout();
    startInvestigation();
  };
}

function startInvestigation() {
  game.playerRoom = "Van";
  game.currentTurn = 1;
  renderHUD();
  updateBackground();
  logToGame("You are ready to begin investigating.");

  const scene = document.getElementById("main-scene");
  const narrator = document.getElementById("narrator-ui");

  if (scene) scene.style.display = "block";
  if (narrator) narrator.style.display = "flex";

  advanceTurn();
}

export function restartGame() {
  stopAllSounds();
  document.getElementById("main-scene").style.display = "none";
  const ts = document.getElementById("title-screen");
  ts.style.display = "flex";
  ts.style.opacity = "1";
}