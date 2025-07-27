/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAIN.JS (FINAL MASTER) ===
 * Title screen, investigation flow, and commands.
 *****************************************************/
import { game, resetGame as stateReset, possibleWeather, randomFromArray } from "./state.js";
import { renderHUD, renderActionButtons, setupNotebookToggle, populateGhostNotebook, updateBackground } from "./ui.js";
import { showLoadout, confirmLoadout } from "./ui.js";
import { preloadAllAudio } from "./audioManager.js";
import { checkTurnEvents } from "./events.js";
import { saveGame, clearSave } from "./saveManager.js";

document.addEventListener("DOMContentLoaded", () => {
  preloadAllAudio(); setupNotebookToggle(); populateGhostNotebook();
  document.getElementById("startButton").addEventListener("click", () => {
    document.getElementById("title-screen").style.display = "none";
    document.getElementById("loadout-screen").style.display = "flex";
    showLoadout();
  });
  document.getElementById("confirm-loadout").addEventListener("click", () => {
    confirmLoadout(); startInvestigation(true);
  });
});

export function startInvestigation(newGame = true) {
  document.getElementById("loadout-screen").style.display = "none";
  document.getElementById("main-scene").style.display = "block";
  document.getElementById("narrator-ui").style.display = "flex";

  if (newGame) {
    stateReset(); assignWeather(); assignRandomGhost(); assignGhostRoom();
    saveGame(true);
  }
  renderHUD(); updateBackground(); renderActionButtons(); checkTurnEvents();
}

function assignWeather() { game.weather = randomFromArray(possibleWeather); }
function assignRandomGhost() { game.ghost = randomFromArray(Object.keys(game.ghostProfiles)); }
function assignGhostRoom() { game.ghostRoom = randomFromArray(Object.keys(game.roomVisuals)); }

document.addEventListener("ui-command", (e) => {
  switch (e.detail) {
    case "move": logToGame("🧭 Use compass controls."); break;
    case "look": logToGame("👀 You look around."); break;
    case "inventory": import("./items.js").then(m => m.openInventoryOverlay()); break;
    case "guess": openGhostGuess(); break;
    case "van": game.playerRoom = "Van"; renderHUD(); updateBackground(); checkTurnEvents(); break;
  }
});

function openGhostGuess() {
  const popup = document.getElementById("guess-popup");
  popup.style.display = "block";
  popup.innerHTML = Object.keys(game.ghostProfiles)
    .map(g => `<button onclick="window.makeGuess('${g}')">${g}</button>`).join("");
  window.makeGuess = (ghost) => {
    alert(ghost === game.ghost ? `✅ Correct! ${ghost}` : `❌ Wrong! It was ${game.ghost}`);
    window.location.reload();
  };
}

window.clearGameSave = () => { clearSave(); alert("Save cleared."); };
