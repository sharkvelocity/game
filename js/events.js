/*****************************************************
 * === PHASMA-PHONEY v2.6 — AMBIENT, EVIDENCE & HUNTS ===
 * Manages turn-based sanity, ambient ghost events,
 * evidence interactions, and hunt system.
 *****************************************************/

import { game } from "./state.js";
import { logToGame, renderHUD } from "./ui.js";
import { playSound, stopSound, stopAllSounds } from "./audioManager.js";

// === SANITY TRACKING ===
export function updateSanity(baseDrain = 1) {
  // Ambient sanity drain
  if (game.playerRoom !== "Van") {
    let drain = baseDrain;

    // In ghost room, extra drain
    if (game.playerRoom === game.ghostRoom) {
      drain += 2;
      if (Math.random() < 0.3) playSound("ghost", "breath");
    }

    game.sanity = Math.max(0, game.sanity - drain);
  }

  renderHUD();
}

// === AMBIENT GHOST EVENTS ===
export function triggerAmbientEvents() {
  if (game.playerRoom === game.ghostRoom) {
    if (Math.random() < 0.4) {
      playSound("ghost", "whispers");
      logToGame("You hear faint whispers...");
    }
    if (Math.random() < 0.2) {
      playSound("ghost", "knocks");
      logToGame("A soft knock echoes nearby.");
    }
    if (game.ghost === "Poltergeist" && Math.random() < 0.6) {
      playSound("ghost", "polterThrow");
      logToGame("🔊 A loud crash echoes in the room!");
    }
    if (game.ghost === "Succubus" && Math.random() < 0.8) {
      playSound("ghost", "succubus");
      logToGame("💫 A soft murmur fills your ears...");
    }
  }
}

// === EVIDENCE ACTIONS ===
export function triggerEvidenceEvents() {
  if (game.playerRoom !== game.ghostRoom) return;

  switch (game.ghost) {
    case "Spirit":
    case "Jinn":
      if (Math.random() < 0.4) {
        playSound("evidence", "emf");
        logToGame("⚡ The EMF reader spikes suddenly.");
      }
      break;
    case "Mare":
      if (Math.random() < 0.5) {
        playSound("hunt", "flicker");
        logToGame("💡 The lights flicker violently.");
      }
      break;
    case "Revenant":
      if (Math.random() < 0.3) {
        playSound("evidence", "writing");
        logToGame("✏️ The ghost writes furiously in the book.");
      }
      break;
    case "Hantu":
      if (Math.random() < 0.5) {
        playSound("evidence", "freezing");
        logToGame("❄️ Your breath fogs as the room chills.");
      }
      break;
  }

  // Mimic & Orbs logic
  if (game.ghost === "The Mimic" || Math.random() < 0.2) {
    playSound("evidence", "orbs");
    logToGame("🔮 You notice faint orbs floating.");
  }
}

// === HUNT TRIGGER CHECK ===
export function checkForHunt() {
  if (game.huntCooldown > 0) {
    game.huntCooldown--;
    return false;
  }

  const sanityThreshold = getHuntThreshold(game.ghost);
  if (game.sanity <= sanityThreshold) {
    startHunt();
    return true;
  }
  return false;
}

// === HUNT START ===
function startHunt() {
  game.huntCooldown = getHuntCooldown(game.ghost);
  playSound("hunt", "start");
  playSound("hunt", "heartbeat", { loop: true, volume: 0.7 });

  logToGame("⚠️ The ghost begins to hunt!");

  setTimeout(() => executeHunt(), 2000);
}

// === EXECUTE HUNT LOGIC ===
function executeHunt() {
  // Ghost-specific audio cues
  if (game.ghost === "Revenant") playSound("hunt", "revenant");
  if (game.ghost === "Banshee") playSound("hunt", "banshee");
  if (game.ghost === "Mare") playSound("hunt", "mare");

  if (game.playerRoom === game.ghostRoom) {
    // Attempt defense
    if (!attemptDefense()) {
      triggerDeath();
      return;
    }
  }

  stopSound("hunt", "heartbeat");
  logToGame("The hunt ends. Silence fills the air again.");
}

// === DEFENSE ATTEMPT ===
function attemptDefense() {
  if (game.smudgeActive > 0) {
    logToGame("🔥 The smudge stick keeps the ghost at bay.");
    game.smudgeActive = 0;
    return true;
  }

  if (game.placedCrucifix[game.ghostRoom]) {
    logToGame("✝️ The crucifix burns, stopping the hunt!");
    playSound("defense", "crucifix");
    delete game.placedCrucifix[game.ghostRoom];
    return true;
  }

  return false;
}

// === PLAYER DEATH ===
function triggerDeath() {
  stopAllSounds();
  playSound("hunt", "death");
  logToGame("💀 The ghost finds you. You have died.");
  gameOver();
}

// === GAME OVER ===
function gameOver() {
  logToGame("❌ Investigation failed. Returning to van...");
  playSound("ui", "gameOver");
  // Implement full game-over screen in UI module if desired
}

// === HUNT UTILITY ===
function getHuntThreshold(ghost) {
  switch (ghost) {
    case "Demon": return 80;
    case "Revenant": return 65;
    case "Yurei": return 60;
    case "Banshee": return 50;
    default: return 40;
  }
}

function getHuntCooldown(ghost) {
  switch (ghost) {
    case "Demon": return 1;
    case "Revenant": return 2;
    case "Shade": return 4;
    default: return 3;
  }
}
