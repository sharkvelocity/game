/*****************************************************
 * === PHASMA-PHONEY v2.9 — EVENTS (SAFE AUDIO, NOTEBOOK INTEGRATION) ===
 *****************************************************/
import { game, randomFromArray, cursedItems } from "./state.js";
import { logToGame, updateSanityBar, updateHeldItemsNotebook, updateNearbyItemsNotebook, showNotebookUpdateBadge } from "./ui.js";
import { playAudio } from "./audioManager.js";
import { ghostBehaviorTable, startHunt } from "./ghostBehavior.js";

/***********************
 === TURN ADVANCEMENT ===
************************/
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
    const behaviorHint = ghostBehaviorTable[ghost] || "The air feels heavy...";
    logToGame(`[Ambient] ${behaviorHint}`);

    const ghostSounds = [
      "audio/ghost_whisper1.ogg",
      "audio/ghost_whisper2.ogg",
      "audio/ghost_breath.ogg"
    ];
    if (Math.random() < 0.4) playAudio(randomFromArray(ghostSounds));
  }

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

  // ✅ === Notebook Auto-Refresh After Each Turn ===
  updateHeldItemsNotebook();
  updateNearbyItemsNotebook();

  // === Hunt Attempt ===
  attemptHunt();
}

/***********************
 === HUNT ATTEMPTS ===
************************/
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

/***********************
 === CURSED ITEM DISCOVERY (NEW) ===
************************/
export function discoverCursedItemsInRoom(roomName = game.playerRoom) {
  if (!game.roomItems[roomName]) game.roomItems[roomName] = [];

  // Already discovered or nothing to add
  const discovered = Object.keys(cursedItems).filter(ci => !game.roomItems[roomName].includes(ci));
  if (discovered.length === 0) {
    logToGame("You search but find nothing unusual.");
    return;
  }

  // 30% chance to find a random cursed item
  if (Math.random() < 0.3) {
    const foundItem = randomFromArray(discovered);
    game.roomItems[roomName].push(foundItem);
    logToGame(`You found a cursed item: ${foundItem}!`);
    game.nearbyItems = [...(game.roomItems[game.playerRoom] || [])];

    // ✅ Refresh Notebook with Update Badge
    updateNearbyItemsNotebook();
    showNotebookUpdateBadge();
  } else {
    logToGame("You search but find nothing unusual.");
  }
}
