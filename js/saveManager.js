/*****************************************************
 * === PHASMA-PHONEY v2.9 — SAVE MANAGER (FINAL MASTER) ===
 * Handles full game save/load/reset logic.
 *****************************************************/
import { game, gameSettings, resetGame as stateReset } from "./state.js";
import { logToGame, renderHUD, updateBackground } from "./ui.js";
import { startInvestigation } from "./main.js";

export function saveGame(show = false) {
  if (!gameSettings.autosave) return;
  try {
    const save = { ...game, selectedEvidence: [...game.selectedEvidence] };
    localStorage.setItem("phasmaPhoneySave", JSON.stringify(save));
    if (show) logToGame("💾 Game saved.");
  } catch (e) { console.error("Save failed", e); }
}

export function loadGame() {
  try {
    const s = JSON.parse(localStorage.getItem("phasmaPhoneySave"));
    if (!s) return logToGame("⚠ No save data.");
    Object.assign(game, s);
    game.selectedEvidence = new Set(s.selectedEvidence || []);
    document.getElementById("title-screen").style.display = "none";
    document.getElementById("loadout-screen").style.display = "none";
    document.getElementById("main-scene").style.display = "block";
    document.getElementById("narrator-ui").style.display = "flex";
    renderHUD(); updateBackground(); logToGame("📂 Game loaded.");
  } catch (e) {
    console.error("Load error", e);
    stateReset(); startInvestigation(true);
  }
}

export function clearSave() { localStorage.removeItem("phasmaPhoneySave"); logToGame("🗑 Save cleared."); }
export function resetGame() { stateReset(); renderHUD(); updateBackground(); }
