/*****************************************************
 * === PHASMA-PHONEY v2.9 — EVENTS (FINAL MASTER) ===
 * Handles turn events, mimic shifts, ambient sounds,
 * notebook sync, and hunt attempts.
 *****************************************************/
import { game, randomFromArray, cursedItems, ghostProfiles } from "./state.js";
import { logToGame, updateSanityBar, updateHeldItemsNotebook, updateNearbyItemsNotebook, showNotebookUpdateBadge } from "./ui.js";
import { playAudio } from "./audioManager.js";
import { startHunt, assignMimicForm } from "./ghostBehavior.js";

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
    logToGame(`[Ambient] ${ghostProfiles[ghost]?.behavior || "The air feels heavy..."}`);
    if (Math.random() < 0.4) {
      const ghostSounds = ["audio/spiritBoxStatic.mp3", "audio/music_box_play.mp3", "audio/Radio.mp3"];
      playAudio(randomFromArray(ghostSounds));
    }
  }

  // ✅ Ambient Environmental Sounds
  if (Math.random() < 0.25) {
    const randomAmbient = [
      "audio/ambient_wind.mp3",
      "audio/ambient_house_creak.mp3",
      "audio/doorCreak1.mp3",
      "audio/doorCreak2.mp3"
    ];
    playAudio(randomFromArray(randomAmbient));
  }

  updateHeldItemsNotebook();
  updateNearbyItemsNotebook();
  showNotebookUpdateBadge();

  attemptHunt();
}

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

export function discoverCursedItemsInRoom(roomName = game.playerRoom) {
  if (!game.roomItems[roomName]) game.roomItems[roomName] = [];
  const undiscovered = Object.keys(cursedItems).filter(ci => !game.roomItems[roomName].includes(ci));
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

export function checkTurnEvents() {
  advanceTurn();
}
