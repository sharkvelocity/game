/*****************************************************
 * === PHASMA-PHONEY v2.9 — EVENTS.JS (FINAL MASTER) ===
 * Turn logic, mimic shifts, ambient sounds, and hunts.
 *****************************************************/
import { game, randomFromArray, cursedItems, ghostProfiles } from "./state.js";
import { logToGame, updateSanityBar, updateHeldItemsNotebook, updateNearbyItemsNotebook, showNotebookUpdateBadge } from "./ui.js";
import { playAudio } from "./audioManager.js";
import { startHunt, assignMimicForm } from "./ghostBehavior.js";

export function advanceTurn() {
  game.currentTurn++;
  if (game.ghost === "TheMimic" && game.currentTurn >= game.nextMimicShift) assignMimicForm();

  if (game.playerRoom === game.ghostRoom) game.sanity -= 3 + Math.random() * 3;
  else game.sanity -= 1;
  game.sanity = Math.max(0, game.sanity);
  updateSanityBar();

  if (game.playerRoom === game.ghostRoom && Math.random() < 0.3) {
    const ghost = game.ghost === "TheMimic" ? game.mimicForm : game.ghost;
    logToGame(`[Ambient] ${ghostProfiles[ghost]?.behavior || "The air feels heavy..."}`);
  }

  if (Math.random() < 0.2) playAudio("audio/doorCreak1.mp3");
  updateHeldItemsNotebook(); updateNearbyItemsNotebook(); showNotebookUpdateBadge();
  attemptHunt();
}

export function attemptHunt() {
  if (game.smudgeActive > 0) { game.smudgeActive--; return; }
  if (game.huntCooldown > 0) { game.huntCooldown--; return; }
  if (game.sanity < 30 && Math.random() < 0.25) startHunt();
}

export function checkTurnEvents() { advanceTurn(); }
