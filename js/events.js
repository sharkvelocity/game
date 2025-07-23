/*****************************************************
 * === PHASMA-PHONEY v2.9 — EVENTS MODULE (No Required Audio) ===
 * Handles turn-based updates, ambient events,
 * sanity drain, hunts, and player death WITHOUT required audio.
 *****************************************************/

import { game, randomFromArray } from "./state.js";
import { logToGame, updateSanityBar } from "./ui.js";
import { assignMimicForm, triggerGhostBehavior } from "./ghostBehavior.js";

/* === SAFE AUDIO PLAYER (No Required Audio) === */
function safePlay(audioId) {
  try {
    const audioElem = document.getElementById(audioId);
    if (audioElem && typeof audioElem.play === "function") {
      audioElem.play().catch(() => {}); // Suppress autoplay errors
    }
  } catch (e) {
    console.warn(`Audio skipped: ${audioId}`, e);
  }
}

/* === TURN ADVANCEMENT === */
export function advanceTurn() {
  game.currentTurn++;

  if (game.ghost === "TheMimic" && game.currentTurn >= game.nextMimicShift) {
    assignMimicForm();
    logToGame("The Mimic shifts its behavior...");
  }

  applySanityDrain();
  triggerGhostBehavior();
  ambientMotionSensor();
  attemptHunt();

  updateSanityBar();
}

/* === SANITY DRAIN === */
function applySanityDrain() {
  if (game.playerRoom === game.ghostRoom) {
    const drain = 3 + Math.random() * 3;
    game.sanity = Math.max(0, game.sanity - drain);

    if (game.currentTurn % 2 === 0 && Math.random() < 0.3) {
      const ghost = (game.ghost === "TheMimic" ? game.mimicForm : game.ghost);
      logToGame(`[Ambient] ${ghost} — ${ghostBehaviorDescription(ghost)}`);
      // Optional audio if available
      safePlay("ambient-creak");
    }
  } else {
    game.sanity = Math.max(0, game.sanity - 1);
  }
}

function ghostBehaviorDescription(ghost) {
  return {
    Demon: "You feel intense anger surrounding you...",
    Yurei: "Your mind feels strangely clouded.",
    Oni: "You sense something watching from nearby.",
    Succubus: "A cold whisper brushes your ear as if draining your will..."
  }[ghost] || "The air feels heavy...";
}

/* === MOTION SENSOR AMBIENCE === */
function ambientMotionSensor() {
  Object.keys(game.roomItems).forEach(room => {
    if (!game.roomItems[room]?.includes("Motion Sensor")) return;

    if (Math.random() < 0.25) {
      if (game.playerRoom === "Van") {
        logToGame(`[Van Monitor] Motion detected in ${room}!`);
      } else if (game.playerRoom === room) {
        logToGame("You hear the motion sensor *beep* nearby.");
      } else if (Math.random() < 0.4) {
        logToGame("You faintly hear a muffled *beep* through the walls...");
      }
      safePlay("motion-beep"); // Optional sound
    }
  });
}

/* === HUNT LOGIC === */
export function attemptHunt() {
  if (game.smudgeActive > 0) {
    game.smudgeActive--;
    return;
  }
  if (game.huntCooldown > 0) {
    game.huntCooldown--;
    return;
  }

  if (game.sanity <= 30 && Math.random() < 0.25) {
    startHunt();
  }
}

function startHunt() {
  logToGame("💀 The ghost is hunting!");
  safePlay("hunt-start"); // Optional sound
  flashRed();
  logToGame("You hear your heartbeat pounding...");
  safePlay("heartbeat"); // Optional sound

  if (game.playerRoom === game.ghostRoom) {
    if (game.placedCrucifix[game.playerRoom] > 0) {
      game.placedCrucifix[game.playerRoom]--;
      logToGame(`The crucifix burns, stopping the hunt. (${game.placedCrucifix[game.playerRoom]} uses left)`);
      if (game.placedCrucifix[game.playerRoom] === 0) {
        delete game.placedCrucifix[game.playerRoom];
        logToGame("The crucifix has burned away completely.");
      }
      safePlay("crucifix-burn"); // Optional sound
    } else {
      setTimeout(playerDeath, 1200);
    }
  } else {
    logToGame("You survive this hunt... for now.");
  }

  const aggressiveGhosts = ["Demon", "Oni", "Raiju", "Moroi"];
  game.huntCooldown = aggressiveGhosts.includes(game.ghost)
    ? 3 + Math.floor(Math.random() * 2)
    : 5 + Math.floor(Math.random() * 3);
}

/* === HUNT VISUALS === */
function flashRed() {
  const lightning = document.getElementById("lightning");
  let flashes = 3, count = 0;

  function pulse() {
    if (count >= flashes) {
      lightning.style.opacity = 0;
      return;
    }
    lightning.style.background = "red";
    lightning.style.opacity = 0.6 + Math.random() * 0.3;

    setTimeout(() => {
      lightning.style.opacity = 0;
      count++;
      setTimeout(pulse, 150 + Math.random() * 200);
    }, 150 + Math.random() * 150);
  }
  pulse();
}

/* === PLAYER DEATH === */
function playerDeath() {
  logToGame("💀 The ghost finds you. Everything goes cold...");
  safePlay("player-death"); // Optional sound
  setTimeout(() => {
    alert("You died.");
    window.location.reload();
  }, 1000);
}
