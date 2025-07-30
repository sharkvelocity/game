// === js/ghostBehavior.js ===

import { game, ghostProfiles, allRooms, randomFromArray } from './state.js';
import { tryPlayRadioEvent, playHuntStart, playHuntHeartbeat } from './audioManager.js';

let mimicTimer = 0;
let mimicTarget = null;
let yureiSmudgeLock = 0;
let huntCooldown = 0;

// Called every turn
export function ghostBehaviorTurn() {
  if (!game.ghost) return;

  const ghostName = game.ghost.name;

  // Handle mimic mimicry
  if (ghostName === "The Mimic") {
    if (mimicTimer <= 0 || !mimicTarget) {
      mimicTarget = randomFromArray(ghostProfiles.filter(g => g.name !== "The Mimic"));
      mimicTimer = Math.floor(Math.random() * 4) + 3; // 3–6 turns
    } else {
      mimicTimer--;
    }
  }

  // Handle ghost room changes unless fixed
  if (huntCooldown > 0) huntCooldown--;
  if (ghostName !== "Goryo") {
    if (ghostName === "Yurei" && yureiSmudgeLock > 0) {
      yureiSmudgeLock--;
    } else if (Math.random() < 0.25) {
      game.ghostRoom = randomFromArray(allRooms.filter(r => r !== game.ghostRoom));
    }
  }

  // Ghost interaction
  ghostInteraction();

  // Attempt hunt
  if (game.sanity <= 20 && huntCooldown === 0) {
    attemptHunt();
  }
}

export function ghostInteraction() {
  const isShade = getCurrentGhostName() === "Shade";
  const inGhostRoom = game.currentRoom === game.ghostRoom;

  tryPlayRadioEvent(inGhostRoom, isShade);
}

// Get active ghost name (Mimic-aware)
function getCurrentGhostName() {
  return game.ghost.name === "The Mimic" && mimicTarget
    ? mimicTarget.name
    : game.ghost.name;
}

// Get active evidence (Mimic-aware)
export function getCurrentGhostEvidence() {
  return game.ghost.name === "The Mimic" && mimicTarget
    ? game.ghost.evidence // Still uses Mimic's actual evidence
    : game.ghost.evidence;
}

// === HUNT LOGIC ===
function attemptHunt() {
  const name = getCurrentGhostName();
  const aggressiveGhosts = ["Demon", "Oni", "Thaye", "Deogen", "Raiju", "Moroi", "Revenant", "Succubus"];
  const passiveGhosts = ["Shade", "Goryo", "Yokai"];

  let baseChance = 0.3;

  if (aggressiveGhosts.includes(name)) {
    baseChance += 0.25;
  }
  if (passiveGhosts.includes(name)) {
    baseChance -= 0.15;
  }

  if (Math.random() < baseChance) {
    triggerHunt();
  }
}

function triggerHunt() {
  playHuntStart();
  setTimeout(() => playHuntHeartbeat(), 800);
  huntCooldown = 4; // prevent immediate re-hunt
  // The rest of the hunt (smudge, crucifix, death) handled in events.js or a huntManager
}

// External hook to apply Yurei smudge behavior
export function applyYureiSmudge() {
  if (game.ghost.name === "Yurei") {
    yureiSmudgeLock = 5;
  }
}
