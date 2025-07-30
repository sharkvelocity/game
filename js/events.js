// === js/events.js ===

import { game } from './state.js';
import { ghostBehaviorTurn } from './ghostBehavior.js';
import {
  playHuntStart,
  playHuntHeartbeat,
  playGameKilled,
  playSpiritBoxStatic,
  playDoorCreakRandom,
  playDoorSlam,
  playCrucifixBurn,
  playWildDog
} from './audioManager.js';

// === TURN PROGRESSION ===

export function advanceTurn() {
  game.turn++;

  // Random sanity drain
  const sanityLoss = Math.floor(Math.random() * 5) + 3; // 3–7
  game.sanity = Math.max(0, game.sanity - sanityLoss);

  // Random ambient cue
  randomAmbientEvent();

  // Ghost behavior and possible hunt
  ghostBehaviorTurn();
}

// === AMBIENT EVENTS ===

function randomAmbientEvent() {
  const inGhostRoom = game.currentRoom === game.ghostRoom;

  const roll = Math.random();
  if (roll < 0.2) {
    playSpiritBoxStatic();
  } else if (roll < 0.35) {
    playDoorCreakRandom();
  } else if (roll < 0.45 && inGhostRoom) {
    playDoorSlam();
  } else if (roll < 0.5) {
    playWildDog();
  }
}

// === HUNT RESPONSE ===

export function triggerHuntEvent() {
  // Play hunt audio
  playHuntStart();
  setTimeout(() => playHuntHeartbeat(), 800);

  // Check for defensive items
  if (hasCrucifixProtection()) {
    playCrucifixBurn();
    return;
  }

  if (hasSmudgeActive()) {
    // Smudge active: disable hunt this turn
    return;
  }

  killPlayer();
}

// === DEATH ===

function killPlayer() {
  playGameKilled();
  // This can be replaced with visual red screen flash or blackout
  alert("You were killed by the ghost. Game over.");
  // TODO: Add return to title logic here if not already handled
}

// === DEFENSES ===

function hasCrucifixProtection() {
  return game.inventory.includes("Crucifix");
}

function hasSmudgeActive() {
  return game.inventory.includes("Smudge Stick");
}
