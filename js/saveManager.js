/*****************************************************
 * === PHASMA-PHONEY v2.9 — SAVE MANAGER (FINAL MASTER MP3) ===
 * Saves & loads full game state, including notebook,
 * camera placements, and settings. Fully modular & safe.
 *****************************************************/
import { 
  game, gameSettings, resetGame as stateReset 
} from "./state.js";
import { 
  logToGame, renderHUD, updateBackground
} from "./ui.js";
import { startInvestigation } from "./main.js";

/***********************
 === SAVE GAME ===
************************/
export function saveGame(showIndicator = false) {
  if (!gameSettings.autosave) return;
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
      nearbyItems: game.nearbyItems || [],
      cameraPlacements: game.cameraPlacements || [],
      settings: { ...gameSettings }
    };

    localStorage.setItem("phasmaPhoneySave", JSON.stringify(saveData));
    if (showIndicator) showSaveIndicator();
  } catch (e) {
    console.error("❌ Save failed:", e);
    logToGame("⚠️ Save failed.");
  }
}

/***********************
 === LOAD GAME ===
************************/
export function loadGame() {
  const data = localStorage.getItem("phasmaPhoneySave");
  if (!data) {
    logToGame("⚠ No save data found. Starting new investigation...");
    return;
  }

  try {
    const s = JSON.parse(data);

    // ✅ Restore full game state
    Object.assign(game, s);
    game.selectedEvidence = new Set(s.selectedEvidence || []);
    game.placedCrucifix = s.placedCrucifix || {};
    game.roomItems = s.roomItems || {};
    game.usedCursedItems = s.usedCursedItems || {};
    game.nearbyItems = s.nearbyItems || [];
    game.cameraPlacements = s.cameraPlacements || [];
    if (s.settings) Object.assign(gameSettings, s.settings);

    // ✅ Correct UI transitions
    document.getElementById("title-screen").style.display = "none";
    document.getElementById("loadout-screen").style.display = "none";
    document.getElementById("main-scene").style.display = "block";
    document.getElementById("narrator-ui").style.display = "flex";

    renderHUD();
    updateBackground();

    logToGame("📂 Game loaded. Resuming investigation...");
    saveGame();
  } catch (e) {
    console.error("❌ Load failed:", e);
    logToGame("⚠ Load failed. Starting new investigation...");
    clearSave();
    resetGame();
    startInvestigation(false);
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
 === RESET GAME ===
************************/
export function resetGame() {
  stateReset();
  renderHUD();
  updateBackground();
}

/***********************
 === SAVE INDICATOR (UI) ===
************************/
function showSaveIndicator() {
  const ind = document.getElementById("save-indicator");
  if (!ind) return;
  ind.style.display = "block";
  ind.style.opacity = "1";
  setTimeout(() => { ind.style.opacity = "0"; }, 500);
  setTimeout(() => { ind.style.display = "none"; }, 1000);
}
