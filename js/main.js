/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAIN GAME FLOW ===
 * Handles title screen, loadout, investigation start,
 * and restart logic. Safe even if audio is missing.
 *****************************************************/

import { game, randomFromArray, allRooms, possibleWeather } from "./state.js";
import { logToGame, renderHUD, showLoadout, confirmLoadout } from "./ui.js";
import { preloadAllAudio, stopAllSounds } from "./audioManager.js";
import { ghostProfiles } from "./state.js"; // replaced ghostBehaviorTable for consistency
import { advanceTurn } from "./events.js";

document.addEventListener("DOMContentLoaded", () => {
  // ✅ Preload audio, but silently skip if files missing
  try {
    preloadAllAudio();
  } catch (e) {
    console.warn("Audio preload skipped (missing files).", e);
  }
  setupTitleScreen();
});

function setupTitleScreen() {
  const titleScreen = document.getElementById("title-screen");
  const startBtn = document.getElementById("startButton");
  if (!startBtn) {
    console.error("Start button not found in DOM!");
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
  game.ghostRoom = randomFromArray(allRooms.filter(r => r !== "Van"));

  logToGame(`You are in the van. The weather is ${game.weather}.`);
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
  logToGame("You are ready to begin investigating.");

  const mainScene = document.getElementById("main-scene");
  const narratorUI = document.getElementById("narrator-ui");

  if (mainScene && narratorUI) {
    mainScene.style.display = "block";
    narratorUI.style.display = "flex";
  } else {
    console.error("Main scene or narrator UI missing from DOM!");
  }

  advanceTurn();
}

export function restartGame() {
  try {
    stopAllSounds();
  } catch (e) {
    console.warn("No audio to stop (safe).");
  }
  document.getElementById("main-scene").style.display = "none";
  const ts = document.getElementById("title-screen");
  ts.style.display = "flex";
  ts.style.opacity = "1";
}