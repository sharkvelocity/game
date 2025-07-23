/*****************************************************
 * === PHASMA-PHONEY v2.9 — GHOSTBEHAVIOR.JS ===
 * Handles ghost behaviors, hunts, mimic shifts,
 * and ambient events. Fully safe with missing audio.
 *****************************************************/

import { game, ghostProfiles, randomFromArray } from "./state.js";
import { logToGame, updateSanityBar, renderHUD } from "./ui.js";
import { safePlaySound } from "./audioManager.js";

// === MIMIC LOGIC ===
export function assignMimicForm() {
  const ghostList = Object.keys(ghostProfiles).filter(g => g !== "TheMimic");
  game.mimicForm = randomFromArray(ghostList);
  game.nextMimicShift = game.currentTurn + 3 + Math.floor(Math.random() * 4);
  logToGame("The Mimic shifts its behavior...");
}

// === ADVANCE TURN ===
export function advanceTurn() {
  game.currentTurn++;

  // === Mimic Behavior Shift ===
  if (game.ghost === "TheMimic" && game.currentTurn >= game.nextMimicShift) {
    assignMimicForm();
  }

  // === Sanity Drain ===
  if (game.playerRoom === game.ghostRoom) {
    game.sanity -= 3 + Math.random() * 3;
    const ghostType = (game.ghost === "TheMimic" ? game.mimicForm : game.ghost);
    if (game.currentTurn % 2 === 0 && Math.random() < 0.3) {
      logToGame("[Ambient] " + ghostProfiles[ghostType].behavior);
      safePlaySound("ghost_whisper1");
    }
  } else {
    game.sanity -= 1;
  }

  // === Motion Sensor Alerts ===
  Object.keys(game.roomItems).forEach(r => {
    if (!game.roomItems[r]?.includes("Motion Sensor")) return;
    if (Math.random() < 0.25) {
      if (game.playerRoom === "Van") {
        logToGame("[Van Monitor] Motion detected in " + r + "!");
        safePlaySound("console_key1");
      } else if (game.playerRoom === r) {
        logToGame("You hear the motion sensor *beep* nearby.");
        safePlaySound("console_key1");
      }
    }
  });

  game.sanity = Math.max(0, game.sanity);
  updateSanityBar();
  attemptHunt();
}

// === HUNT SYSTEM ===
export function attemptHunt() {
  if (game.smudgeActive > 0) { game.smudgeActive--; return; }
  if (game.huntCooldown > 0) { game.huntCooldown--; return; }
  if (game.sanity < 30 && Math.random() < 0.25) startHunt();
}

export function startHunt() {
  logToGame("💀 The ghost is hunting!");
  safePlaySound("hunt_start_rumble");

  if (game.playerRoom === game.ghostRoom) {
    if (game.placedCrucifix && game.placedCrucifix[game.playerRoom] > 0) {
      game.placedCrucifix[game.playerRoom]--;
      if (game.placedCrucifix[game.playerRoom] === 0) {
        delete game.placedCrucifix[game.playerRoom];
        logToGame("The crucifix has burned away completely.");
      } else {
        logToGame(`The crucifix burns, stopping the hunt. (${game.placedCrucifix[game.playerRoom]} uses left)`);
      }
      safePlaySound("crucifix_burn");
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
  safePlaySound("player_death_choke");
  setTimeout(() => {
    alert("You died.");
    window.location.reload();
  }, 800);
}