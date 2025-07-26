/*****************************************************
 * === PHASMA-PHONEY v2.9 — EVENTS.JS (FINAL UPDATED) ===
 * Turn events, ambient ghost cues, mimic shift,
 * cursed items, hunt logic, and orb detection.
 *****************************************************/

import { game, randomFromArray, cursedItems, ghostProfiles } from "./state.js";
import {
  logToGame, updateSanityBar, updateHeldItemsNotebook,
  updateNearbyItemsNotebook, showNotebookUpdateBadge
} from "./ui.js";
import { playAudio } from "./audioManager.js";
import { startHunt, assignMimicForm } from "./ghostBehavior.js"; 

/***********************
 === TURN ADVANCEMENT ===
************************/
export function advanceTurn() {
  game.currentTurn++;

  // === Mimic Behavior Shift ===
  if (game.ghost === "TheMimic" && game.currentTurn >= game.nextMimicShift) {
    assignMimicForm();
  }

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
    const behaviorHint = ghostProfiles[ghost]?.behavior || "The air feels heavy...";
    logToGame(`[Ambient] ${behaviorHint}`);

    const ghostSounds = [
      "audio/ghost_whisper1.ogg",
      "audio/ghost_whisper2.ogg",
      "audio/ghost_breath.ogg"
    ];
    if (Math.random() < 0.4) playAudio(randomFromArray(ghostSounds));
  }

  // === IR CAMERA ORB DETECTION ===
  detectOrbsWithCamera();

  // === Ambient Environmental Sounds ===
  if (Math.random() < 0.2) {
    const randomAmbient = [
      "audio/floor_creak1.ogg",
      "audio/floor_creak2.ogg",
      "audio/wall_knock1.ogg",
      "audio/wall_knock2.ogg"
    ];
    playAudio(randomFromArray(randomAmbient));
  }

  // ✅ Auto-refresh notebook each turn
  updateHeldItemsNotebook();
  updateNearbyItemsNotebook();

  // === Hunt Attempt ===
  attemptHunt();
}

/***********************
 === ORB DETECTION (NEW)
************************/
function detectOrbsWithCamera() {
  const ghost = game.ghost === "TheMimic" ? "TheMimic" : game.ghost;
  const orbEvidence = ghost === "TheMimic" || ghostProfiles[ghost]?.evidence?.includes("Orbs");

  if (!orbEvidence) return;

  const hasCameraPlaced = game.cameraPlacements?.includes(game.playerRoom);
  const hasCameraHeld = game.inventory.includes("Video Camera");

  if ((hasCameraPlaced || hasCameraHeld) && game.playerRoom === game.ghostRoom) {
    if (Math.random() < 0.7) {
      logToGame("✨ You notice glowing orbs floating in the air through the IR camera!");
    }
  }
}

/***********************
 === HUNT ATTEMPTS ===
************************/
export function attemptHunt() {
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

/***********************
 === CURSED ITEM DISCOVERY ===
************************/
export function discoverCursedItemsInRoom(roomName = game.playerRoom) {
  if (!game.roomItems[roomName]) game.roomItems[roomName] = [];

  const undiscovered = Object.keys(cursedItems)
    .filter(ci => !game.roomItems[roomName].includes(ci));

  if (undiscovered.length === 0) {
    logToGame("You search but find nothing unusual.");
    return;
  }

  if (Math.random() < 0.3) {
    const foundItem = randomFromArray(undiscovered);
    game.roomItems[roomName].push(foundItem);
    logToGame(`You found a cursed item: ${foundItem}!`);

    game.nearbyItems = [...(game.roomItems[game.playerRoom] || [])];
    updateNearbyItemsNotebook();
    showNotebookUpdateBadge();
  } else {
    logToGame("You search but find nothing unusual.");
  }
}

/***********************
 ✅ CHECK TURN EVENTS (EXPORTED)
************************/
export function checkTurnEvents() {
  advanceTurn();
}
