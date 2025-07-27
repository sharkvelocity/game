/*****************************************************
 * === PHASMA-PHONEY v2.9 — EVENTS (FINAL MASTER) ===
 * Safe audio, notebook integration, mimic shift,
 * and turn events. Fully synced with ghostBehavior.js.
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

  // ✅ Mimic Behavior Shift
  if (game.ghost === "TheMimic" && game.currentTurn >= game.nextMimicShift) {
    assignMimicForm();
  }

  // ✅ Sanity Drain
  if (game.playerRoom === game.ghostRoom) {
    game.sanity -= 3 + Math.random() * 3;
  } else {
    game.sanity -= 1;
  }
  game.sanity = Math.max(0, game.sanity);
  updateSanityBar();

  // ✅ Ambient Ghost Cues
  if (game.playerRoom === game.ghostRoom && Math.random() < 0.3) {
    const ghost = game.ghost === "TheMimic" ? game.mimicForm : game.ghost;
    const behaviorHint = ghostProfiles[ghost]?.behavior || "The air feels heavy...";
    logToGame(`[Ambient] ${behaviorHint}`);

    const ghostSounds = [
      "wildDog",          // random ghost-like animal noises
      "spiritBox",        // static burst for spooky effect
      "radioStatic"       // distant whisper effect
    ];
    if (Math.random() < 0.4) playAudio(randomFromArray(ghostSounds));
  }

  // ✅ Ambient Environmental Sounds
  if (Math.random() < 0.25) {
    const randomAmbient = [
      "ambientCreak",
      "ambientWind",
      "doorCreak1",
      "doorCreak2",
      "doorCreak3"
    ];
    playAudio(randomFromArray(randomAmbient));
  }

  // ✅ Auto-refresh notebook each turn
  updateHeldItemsNotebook();
  updateNearbyItemsNotebook();
  showNotebookUpdateBadge();

  // ✅ Hunt Attempt
  attemptHunt();
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
    // Hunt rumble sound now triggers heartbeat from ghostBehavior.js internally
    playAudio("huntStart");
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
 ✅ CHECK TURN EVENTS
************************/
export function checkTurnEvents() {
  advanceTurn();
}
