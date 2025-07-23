/*****************************************************
 * === PHASMA-PHONEY v2.9 — EVENTS MODULE ===
 * Manages turn events, sanity drain, ghost hunts,
 * and game save/load system.
 *****************************************************/

import { game, randomFromArray } from "./state.js";
import { ghostProfiles } from "./ghostBehavior.js";
import { logToGame, renderHUD, updateBackground } from "./ui.js";
import { playSound, playAmbient, stopAmbient } from "./audioManager.js";

/* === CHECK TURN EVENTS (SANITY, AMBIENCE, MIMIC SHIFTS) === */
export function advanceTurn() {
  game.currentTurn++;

  // Sanity drain
  if (game.playerRoom === game.ghostRoom) {
    game.sanity -= 3 + Math.random() * 3;
    if (game.currentTurn % 2 === 0 && Math.random() < 0.3) {
      const ghostType = (game.ghost === "TheMimic" ? game.mimicForm : game.ghost);
      logToGame("[Ambient] " + (ghostProfiles[ghostType]?.behavior || "The air feels heavy..."));
      playSound("ghostWhisper1", 0.4);
    }
  } else {
    game.sanity -= 1;
  }

  // Mimic logic
  if (game.ghost === "TheMimic" && game.currentTurn >= game.nextMimicShift) {
    game.mimicForm = randomFromArray(Object.keys(ghostProfiles).filter(g => g !== "TheMimic"));
    game.nextMimicShift = game.currentTurn + 3 + Math.floor(Math.random() * 4);
    logToGame("The Mimic shifts behavior...");
  }

  // Update visuals
  game.sanity = Math.max(0, game.sanity);
  renderHUD();
  attemptHunt();
  saveGame();
}

/* === HUNT ATTEMPT === */
export function attemptHunt() {
  if (game.smudgeActive > 0) {
    game.smudgeActive--;
    return;
  }
  if (game.huntCooldown > 0) {
    game.huntCooldown--;
    return;
  }
  if (game.sanity < 30 && Math.random() < 0.25) startHunt();
}

/* === START HUNT === */
export function startHunt() {
  logToGame("💀 The ghost is hunting!");
  playSound("startRumble", 0.8);
  playAmbient("heartbeat", 0.6);

  if (game.playerRoom === game.ghostRoom) {
    if (game.placedCrucifix[game.playerRoom] > 0) {
      game.placedCrucifix[game.playerRoom]--;
      logToGame(`The crucifix burns, stopping the hunt. (${game.placedCrucifix[game.playerRoom]} uses left)`);
      playSound("crucifixBurn");
      if (game.placedCrucifix[game.playerRoom] === 0) delete game.placedCrucifix[game.playerRoom];
    } else {
      setTimeout(playerDeath, 2000);
    }
  } else {
    logToGame("You survived the hunt...");
  }

  const aggressiveGhosts = ["Demon", "Oni", "Raiju", "Moroi"];
  game.huntCooldown = aggressiveGhosts.includes(game.ghost)
    ? 3 + Math.floor(Math.random() * 2)
    : 5 + Math.floor(Math.random() * 3);
}

/* === PLAYER DEATH === */
export function playerDeath() {
  stopAmbient();
  playSound("playerDeath", 0.9);
  logToGame("💀 The ghost finds you. Everything goes cold...");
  setTimeout(() => {
    alert("You died. Game Over.");
    clearSave();
    window.location.reload();
  }, 2000);
}

/* === SAVE & LOAD SYSTEM === */
export function saveGame() {
  try {
    const saveData = {
      ghost: game.ghost,
      ghostRoom: game.ghostRoom,
      playerRoom: game.playerRoom,
      inventory: game.inventory,
      sanity: game.sanity,
      currentTurn: game.currentTurn,
      placedCrucifix: game.placedCrucifix,
      roomItems: game.roomItems,
      smudgeActive: game.smudgeActive,
      huntCooldown: game.huntCooldown
    };
    localStorage.setItem("phasmaPhoneySave", JSON.stringify(saveData));
  } catch (err) {
    console.error("Save failed:", err);
  }
}

export function loadGame() {
  const data = localStorage.getItem("phasmaPhoneySave");
  if (!data) {
    logToGame("⚠️ No save data found.");
    return;
  }
  try {
    const s = JSON.parse(data);
    Object.assign(game, s);
    logToGame("📂 Game loaded. Resuming investigation...");
    renderHUD();
    updateBackground();
  } catch (err) {
    console.error("Load failed:", err);
  }
}

export function clearSave() {
  localStorage.removeItem("phasmaPhoneySave");
  logToGame("🗑️ Save data cleared.");
}
