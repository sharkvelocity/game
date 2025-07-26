/*****************************************************
 * === PHASMA-PHONEY v2.9 — GHOSTBEHAVIOR.JS (CLEANED FINAL) ===
 * Handles only ghost-specific logic: mimic shifts,
 * hunts, and death. Turn flow is managed in events.js.
 *****************************************************/

import { game, ghostProfiles, randomFromArray } from "./state.js";
import { logToGame } from "./ui.js";
import { playAudio } from "./audioManager.js"; // ✅ Correct export

/***********************
 === MIMIC LOGIC ===
************************/
export function assignMimicForm() {
  const ghostList = Object.keys(ghostProfiles).filter(g => g !== "TheMimic");
  game.mimicForm = randomFromArray(ghostList);
  game.nextMimicShift = game.currentTurn + 3 + Math.floor(Math.random() * 4);
  logToGame("The Mimic shifts its behavior...");
}

/***********************
 === HUNT SYSTEM ===
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
    startHunt();
  }
}

export function startHunt() {
  logToGame("💀 The ghost is hunting!");
  playAudio("audio/hunt_start_rumble.ogg");

  if (game.playerRoom === game.ghostRoom) {
    if (game.placedCrucifix && game.placedCrucifix[game.playerRoom] > 0) {
      game.placedCrucifix[game.playerRoom]--;
      if (game.placedCrucifix[game.playerRoom] === 0) {
        delete game.placedCrucifix[game.playerRoom];
        logToGame("The crucifix has burned away completely.");
      } else {
        logToGame(`The crucifix burns, stopping the hunt. (${game.placedCrucifix[game.playerRoom]} uses left)`);
      }
      playAudio("audio/crucifix_burn.ogg");
    } else {
      setTimeout(playerDeath, 1500);
    }
  } else {
    logToGame("You survived the hunt...");
  }

  const aggressiveGhosts = ["Demon", "Oni", "Raiju", "Moroi"];
  game.huntCooldown = aggressiveGhosts.includes(game.ghost)
    ? 3 + Math.floor(Math.random() * 2)
    : 5 + Math.floor(Math.random() * 3);
}

export function playerDeath() {
  logToGame("💀 The ghost finds you. Everything goes cold...");
  playAudio("audio/player_death_choke.ogg");
  setTimeout(() => {
    alert("You died.");
    window.location.reload();
  }, 800);
}
