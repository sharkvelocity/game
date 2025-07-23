/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAIN GAME FLOW ===
 *****************************************************/
import { game, randomFromArray, allRooms, possibleWeather } from "./state.js";
import { logToGame, renderHUD, showLoadout, confirmLoadout } from "./ui.js";
import { preloadAllAudio, stopAllSounds } from "./audioManager.js";
import { ghostBehaviorTable } from "./ghostBehavior.js";
import { advanceTurn } from "./events.js";

document.addEventListener("DOMContentLoaded", () => {
  preloadAllAudio();
  setupTitleScreen();
});

function setupTitleScreen() {
  const titleScreen = document.getElementById("title-screen");
  const startBtn = document.getElementById("startButton");
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
    currentTurn: 0, sanity: 100, usedCursedItems: {}, roomItems: {},
    smudgeActive: 0, huntCooldown: 0, placedCrucifix: {}, mimicForm: null,
    nextMimicShift: 0
  });

  game.ghost = randomFromArray(Object.keys(ghostBehaviorTable));
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

  document.getElementById("main-scene").style.display = "block";
  document.getElementById("narrator-ui").style.display = "flex";
  advanceTurn();
}

export function restartGame() {
  stopAllSounds();
  document.getElementById("main-scene").style.display = "none";
  const ts = document.getElementById("title-screen");
  ts.style.display = "flex";
  ts.style.opacity = "1";
}
