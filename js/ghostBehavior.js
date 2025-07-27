/*****************************************************
 * === PHASMA-PHONEY v2.9 — GHOST BEHAVIOR (FINAL MASTER) ===
 * Mimic logic, hunts, and player death with synced MP3.
 *****************************************************/
import { game, ghostProfiles, randomFromArray } from "./state.js";
import { logToGame } from "./ui.js";
import { playAudio, stopAllSounds, stopLoopAudio } from "./audioManager.js";

/* === MIMIC LOGIC === */
export function assignMimicForm() {
  const ghosts = Object.keys(ghostProfiles).filter(g => g !== "TheMimic");
  game.mimicForm = randomFromArray(ghosts);
  game.nextMimicShift = game.currentTurn + 3 + Math.floor(Math.random() * 4);
  logToGame("The Mimic shifts its behavior...");
}

/* === HUNT SYSTEM === */
export function attemptHunt() {
  if (game.smudgeActive > 0) { game.smudgeActive--; return; }
  if (game.huntCooldown > 0) { game.huntCooldown--; return; }
  if (game.sanity < 30 && Math.random() < 0.25) startHunt();
}

export function startHunt() {
  logToGame("💀 The ghost is hunting!");
  playAudio("audio/hunt_start_rumble.mp3");
  setTimeout(() => playAudio("audio/hunt_start_rumble_heartbeat.mp3", true, 0.7), 2000);

  if (game.playerRoom === game.ghostRoom) {
    if (game.placedCrucifix[game.playerRoom] > 0) {
      game.placedCrucifix[game.playerRoom]--;
      logToGame(game.placedCrucifix[game.playerRoom]
        ? `The crucifix burns, stopping the hunt. (${game.placedCrucifix[game.playerRoom]} left)`
        : "The crucifix has burned away completely.");
      if (game.placedCrucifix[game.playerRoom] === 0) delete game.placedCrucifix[game.playerRoom];
      playAudio("audio/crucifix_burn.mp3");
      setTimeout(() => stopLoopAudio("audio/hunt_start_rumble_heartbeat.mp3"), 500);
    } else setTimeout(playerDeath, 3000);
  } else {
    logToGame("You survived the hunt...");
    setTimeout(() => stopLoopAudio("audio/hunt_start_rumble_heartbeat.mp3"), 2000);
  }

  const aggressive = ["Demon", "Oni", "Raiju", "Moroi"];
  game.huntCooldown = aggressive.includes(game.ghost)
    ? 3 + Math.floor(Math.random() * 2)
    : 5 + Math.floor(Math.random() * 3);
}

export function playerDeath() {
  logToGame("💀 The ghost finds you. Everything goes cold...");
  playAudio("audio/gameKilled.mp3");
  setTimeout(() => stopAllSounds(), 300);
  setTimeout(() => { alert(`You died. It was ${game.ghost}.`); window.location.reload(); }, 1200);
}
