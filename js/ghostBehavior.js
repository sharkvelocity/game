/*****************************************************
 * === PHASMA-PHONEY v2.9 — GHOSTBEHAVIOR.JS (FINAL) ===
 * Handles mimic shifts, hunts, and death with synced MP3 audio.
 *****************************************************/
import { game, ghostProfiles, randomFromArray } from "./state.js";
import { logToGame } from "./ui.js";
import { playAudio, stopAllSounds } from "./audioManager.js";

export function assignMimicForm() {
  const list = Object.keys(ghostProfiles).filter(g => g !== "TheMimic");
  game.mimicForm = randomFromArray(list);
  game.nextMimicShift = game.currentTurn + 3 + Math.floor(Math.random() * 4);
  logToGame("The Mimic shifts its behavior...");
}

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
      logToGame(game.placedCrucifix[game.playerRoom] === 0
        ? "The crucifix has burned away completely."
        : `The crucifix burns, stopping the hunt. (${game.placedCrucifix[game.playerRoom]} uses left)`);
      playAudio("audio/crucifix_burn.mp3");
      setTimeout(stopAllSounds, 500);
    } else {
      setTimeout(playerDeath, 3000);
    }
  } else {
    logToGame("You survived the hunt...");
    setTimeout(stopAllSounds, 2000);
  }

  const aggressive = ["Demon", "Oni", "Raiju", "Moroi"];
  game.huntCooldown = aggressive.includes(game.ghost)
    ? 3 + Math.floor(Math.random() * 2)
    : 5 + Math.floor(Math.random() * 3);
}

export function playerDeath() {
  logToGame("💀 The ghost finds you. Everything goes cold...");
  playAudio("audio/gameKilled.mp3");
  setTimeout(stopAllSounds, 300);
  setTimeout(() => { alert("You died."); window.location.reload(); }, 1200);
}
