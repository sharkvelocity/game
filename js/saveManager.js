/*****************************************************
 * === PHASMA-PHONEY v2.9 — SAVE MANAGER (FINAL) ===
 * Saves & loads full game state, including notebook.
 *****************************************************/
import { game, gameSettings, resetGame as stateReset } from "./state.js";
import { logToGame, renderHUD, updateBackground } from "./ui.js";
import { startInvestigation } from "./main.js";

export function saveGame(showIndicator = false) {
  if (!gameSettings.autosave) return;
  try {
    const saveData = { ...game, selectedEvidence: Array.from(game.selectedEvidence), settings: { ...gameSettings } };
    localStorage.setItem("phasmaPhoneySave", JSON.stringify(saveData));
    if (showIndicator) console.log("Game saved!");
  } catch (e) {
    console.error("Save failed:", e);
  }
}

export function loadGame() {
  const data = localStorage.getItem("phasmaPhoneySave");
  if (!data) {
    logToGame("⚠ No save found.");
    return;
  }
  try {
    const s = JSON.parse(data);
    Object.assign(game, s);
    game.selectedEvidence = new Set(s.selectedEvidence || []);
    if (s.settings) Object.assign(gameSettings, s.settings);

    document.getElementById("title-screen").style.display = "none";
    document.getElementById("main-scene").style.display = "block";
    document.getElementById("narrator-ui").style.display = "flex";

    renderHUD();
    updateBackground();
    saveGame();
    logToGame("📂 Game loaded.");
  } catch (e) {
    console.error("Load failed:", e);
    clearSave();
    stateReset();
    startInvestigation(false);
  }
}

export function clearSave() {
  localStorage.removeItem("phasmaPhoneySave");
  logToGame("🗑️ Save data cleared.");
}
