/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAIN MODULE (FINAL PATCHED) ===
 * Game startup, core loop, transitions and ghost setup.
 *****************************************************/
import { game, ghostProfiles, allRooms, allDirections } from "./state.js";
import { showLoadout, renderActionButtons, renderHUD, updateBackground } from "./ui.js";
import { advanceTurn } from "./events.js";
import { populateGhostNotebook, setupNotebookToggle } from "./ui.js";
import { updateHeldItemsNotebook, updateNearbyItemsNotebook } from "./ui.js";
import { confirmLoadout } from "./ui.js";

/***********************
 === GAME INIT
************************/
window.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startButton");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      document.getElementById("title-screen").style.display = "none";
      showLoadout();
    });
  }

  const confirmBtn = document.getElementById("confirm-loadout");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      confirmLoadout();
      setTimeout(() => startInvestigation(), 600);
    });
  }

  setupNotebookToggle();
});

/***********************
 === START INVESTIGATION
************************/
export function startInvestigation(newGame = true) {
  document.getElementById("loadout-screen").style.display = "none";
  document.getElementById("main-scene").style.display = "block";
  document.getElementById("narrator-ui").style.display = "flex";

  // Reset visuals
  updateBackground();
  renderHUD();
  renderActionButtons();

  // Populate notebook
  populateGhostNotebook();
  updateHeldItemsNotebook();
  updateNearbyItemsNotebook();

  // Setup ghost
  if (newGame) {
    const ghostNames = Object.keys(ghostProfiles);
    game.ghost = ghostNames[Math.floor(Math.random() * ghostNames.length)];
    game.ghostRoom = allRooms[Math.floor(Math.random() * allRooms.length)];
    game.ghostDirection = allDirections[Math.floor(Math.random() * allDirections.length)];
  }

  // Start first turn
  advanceTurn();
}
