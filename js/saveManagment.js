/*****************************************************
 * === PHASMA-PHONEY v2.9 — SAVE MANAGER MODULE ===
 *****************************************************/
import { game, allLoadoutItems } from "./state.js";
import { logToGame, renderHUD, updateBackground, showLoadout } from "./ui.js";

export function saveGame(showIndicator = false) {
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
      usedCursedItems: game.usedCursedItems
    };
    localStorage.setItem("phasmaPhoneySave", JSON.stringify(saveData));
    if (showIndicator) showSaveIndicator();
  } catch (e) {
    console.error("Save failed:", e);
    logToGame("⚠️ Save failed.");
  }
}

export function loadGame() {
  const data = localStorage.getItem("phasmaPhoneySave");
  if (!data) {
    logToGame("⚠ No save data found.");
    return;
  }
  try {
    const s = JSON.parse(data);
    Object.assign(game, s);
    game.selectedEvidence = new Set(s.selectedEvidence || []);
    game.placedCrucifix = s.placedCrucifix || {};
    game.roomItems = s.roomItems || {};
    game.usedCursedItems = s.usedCursedItems || {};

    document.getElementById("title-screen").style.display = "none";
    document.getElementById("loadout-screen").style.display = "none";
    document.getElementById("main-scene").style.display = "block";
    document.getElementById("narrator-ui").style.display = "flex";

    renderHUD();
    updateBackground();
    saveGame();
    logToGame("📂 Game loaded. Resuming investigation...");
  } catch (e) {
    console.error("Load failed:", e);
    logToGame("⚠ Load failed. Starting new game...");
    localStorage.removeItem("phasmaPhoneySave");
    resetGame();
    showLoadout();
  }
}

export function clearSave() {
  localStorage.removeItem("phasmaPhoneySave");
  logToGame("🗑️ Save data cleared.");
}

export function resetGame() {
  Object.assign(game, {
    ghost: null, ghostRoom: null, playerRoom: "Van", playerDirection: "N",
    inventory: [], vanStock: [...allLoadoutItems],
    selectedEvidence: new Set(), currentTurn: 0, sanity: 100,
    weather: null, mimicForm: null, nextMimicShift: 0,
    cameraActive: false, huntCooldown: 0, smudgeActive: 0,
    placedCrucifix: {}, roomItems: {}, usedCursedItems: {}
  });
  renderHUD();
  updateBackground();
}

function showSaveIndicator() {
  const ind = document.getElementById("save-indicator");
  if (!ind) return;
  ind.style.display = "block";
  ind.style.opacity = "1";
  setTimeout(() => { ind.style.opacity = "0"; }, 500);
  setTimeout(() => { ind.style.display = "none"; }, 1000);
}