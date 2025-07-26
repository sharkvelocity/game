/*****************************************************
 * === PHASMA-PHONEY v2.9 — SAVE MANAGER (FINAL FIXED) ===
 * Saves & loads full game state, including notebook,
 * camera placements, and settings. Modular & safe.
 *****************************************************/
import { 
  game, gameSettings, resetGame as stateReset 
} from "./state.js";
import { 
  logToGame, renderHUD, updateBackground
} from "./ui.js"; 
import { startInvestigation } from "./main.js"; // ✅ Uses main.js flow for restart

/***********************
 === SAVE GAME ===
************************/
export function saveGame(showIndicator = false) {
  if (!gameSettings.autosave) return; // ✅ Respect autosave toggle

  try {
    const saveData = {
      ghost: game.ghost,
      ghostRoom: game.ghostRoom,
      playerRoom: game.playerRoom,
      playerDirection: game.playerDirection,
      inventory: game.inventory,
      vanStock: game.vanStock,
      selectedEvidence: Array.from(game.selectedEvidence),
      currentTurn: game.currentTurn,
      sanity: game.sanity,
      weather: game.weather,
      mimicForm: game.mimicForm,
      nextMimicShift: game.nextMimicShift,
      cameraActive: game.cameraActive,
      huntCooldown: game.huntCooldown,
      smudgeActive: game.smudgeActive,
      placedCrucifix: game.placedCrucifix,
      roomItems: game.roomItems,
      usedCursedItems: game.usedCursedItems,
      nearbyItems: game.nearbyItems || [],        // ✅ Notebook integration
      cameraPlacements: game.cameraPlacements || [], // ✅ Van monitor cameras
      settings: { ...gameSettings }               // ✅ Save current settings
    };

    localStorage.setItem("phasmaPhoneySave", JSON.stringify(saveData));
    if (showIndicator) showSaveIndicator();
  } catch (e) {
    console.error("Save failed:", e);
    logToGame("⚠️ Save failed.");
  }
}

/***********************
 === LOAD GAME ===
************************/
export function loadGame() {
  const data = localStorage.getItem("phasmaPhoneySave");
  if (!data) {
    logToGame("⚠ No save data found.");
    return;
  }

  try {
    const s = JSON.parse(data);
    Object.assign(game, s);

    // ✅ Restore non-primitive objects properly
    game.selectedEvidence = new Set(s.selectedEvidence || []);
    game.placedCrucifix = s.placedCrucifix || {};
    game.roomItems = s.roomItems || {};
    game.usedCursedItems = s.usedCursedItems || {};
    game.nearbyItems = s.nearbyItems || [];
    game.cameraPlacements = s.cameraPlacements || [];

    if (s.settings) Object.assign(gameSettings, s.settings);

    // ✅ Properly hide/show screens
    document.getElementById("title-screen").style.display = "none";
    document.getElementById("loadout-screen").style.display = "none";
    document.getElementById("main-scene").style.display = "block";
    document.getElementById("narrator-ui").style.display = "flex";

    renderHUD();
    updateBackground();
    saveGame(); // ✅ Refresh autosave immediately
    logToGame("📂 Game loaded. Resuming investigation...");
  } catch (e) {
    console.error("Load failed:", e);
    logToGame("⚠ Load failed. Starting new game...");
    clearSave();
    resetGame();
    startInvestigation(false); // ✅ Fresh start via main flow
  }
}

/***********************
 === CLEAR SAVE ===
************************/
export function clearSave() {
  localStorage.removeItem("phasmaPhoneySave");
  logToGame("🗑️ Save data cleared.");
}

/***********************
 === RESET GAME (WRAPPER) ===
************************/
export function resetGame() {
  stateReset();
  renderHUD();
  updateBackground();
}

/***********************
 === SAVE INDICATOR ===
************************/
function showSaveIndicator() {
  const ind = document.getElementById("save-indicator");
  if (!ind) return;
  ind.style.display = "block";
  ind.style.opacity = "1";
  setTimeout(() => { ind.style.opacity = "0"; }, 500);
  setTimeout(() => { ind.style.display = "none"; }, 1000);
}
