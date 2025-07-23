/*****************************************************
 * === PHASMA-PHONEY v2.9 — EVENTS (SAFE AUDIO) ===
 * Handles ambient events, random ghost cues, and
 * turn-based environmental interactions.
 *****************************************************/

import { game, randomFromArray } from "./state.js";
import { logToGame, updateSanityBar } from "./ui.js";
import { playAudio } from "./audioManager.js";
import { ghostBehaviorTable } from "./ghostBehavior.js";
import { startHunt } from "./ghostBehavior.js";

/**
 * Called every turn to update ghost behavior, sanity,
 * and trigger ambient cues or hunts.
 */
export function advanceTurn() {
  game.currentTurn++;

  // === Sanity Drain ===
  if (game.playerRoom === game.ghostRoom) {
    game.sanity -= 3 + Math.random() * 3;
  } else {
    game.sanity -= 1;
  }
  game.sanity = Math.max(0, game.sanity);
  updateSanityBar();

  // === Ambient Ghost Cues ===
  if (game.playerRoom === game.ghostRoom && Math.random() < 0.3) {
    const ghost = game.ghost === "TheMimic" ? game.mimicForm : game.ghost;
    const behaviorHint = ghostBehaviorTable[ghost]?.behavior || "The air feels heavy...";
    logToGame(`[Ambient] ${behaviorHint}`);

    // Play a random ghost sound (safe)
    const ghostSounds = [
      "audio/ghost_whisper1.ogg",
      "audio/ghost_whisper2.ogg",
      "audio/ghost_breath.ogg"
    ];
    if (Math.random() < 0.4) {
      playAudio(randomFromArray(ghostSounds));
    }
  }

  // === Ambient Environmental Sounds (Random) ===
  if (Math.random() < 0.2) {
    const randomAmbient = [
      "audio/floor_creak1.ogg",
      "audio/floor_creak2.ogg",
      "audio/wall_knock1.ogg",
      "audio/wall_knock2.ogg"
    ];
    playAudio(randomFromArray(randomAmbient));
  }

  // === Hunt Attempt ===
  attemptHunt();
}

/**
 * Attempts to trigger a hunt based on sanity and ghost type.
 */
function attemptHunt() {
  if (game.smudgeActive > 0) {
    game.smudgeActive--;
    return;
  }

  if (game.huntCooldown > 0) {
    game.huntCooldown--;
    return;
  }

  if (game.sanity < 30 && Math.random() < 0.25) {
    logToGame("💀 The ghost is starting a hunt!");
    playAudio("audio/hunt_start_rumble.ogg");
    startHunt();
  }
}