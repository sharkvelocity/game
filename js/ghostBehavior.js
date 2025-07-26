/***************************************************** 
 * === PHASMA-PHONEY v2.9 — GHOSTBEHAVIOR.JS (FINAL FIXED) ===
 * Handles ghost-specific logic: mimic shifts, hunts, and death.
 * Turn flow (advanceTurn) is handled in events.js.
 *****************************************************/

import { game, ghostProfiles, randomFromArray } from "./state.js";
import { logToGame } from "./ui.js";
import { playAudio } from "./audioManager.js";

/***********************
 === GHOST BEHAVIOR TABLE (EXPORT FOR MAIN.JS) ===
************************/
export const ghostBehaviorTable = Object.entries(ghostProfiles).reduce((table, [name, data]) => {
  table[name] = {
    evidence: data.evidence,
    behavior: data.behavior
  };
  return table;
}, {});

/***********************
 === MIMIC LOGIC ===
************************/
export function assignMimicForm() {
  const ghostList = Object.keys(ghostProfiles).filter(g => g !== "TheMimic");
  game.mimicForm = randomFromArray(ghostList);
  game.nextMimicShift = game.currentTurn + 3 + Math.floor(Math.random() * 4);
  logToGame(`The Mimic shifts... now acting like a ${game.mimicForm}.`);
}

/***********************
 === HUNT SYSTEM ===
************************/
export function attemptHunt() {
  // ✅ Smudge sticks delay hunts
  if (game.smudgeActive > 0) {
    game.smudgeActive--;
    return;
  }

  // ✅ Hunt cooldown check
  if (game.huntCooldown > 0) {
    game.huntCooldown--;
    return;
  }

  // ✅ Aggression based on sanity + ghost type
  let huntChance = 0;
  switch (game.ghost) {
    case "Demon": huntChance = game.sanity < 80 ? 0.25 : 0.1; break;
    case "Succubus": huntChance = game.sanity < 60 ? 0.25 : 0.1; break;
    case "Revenant": huntChance = game.sanity < 50 ? 0.2 : 0.05; break;
    default: huntChance = game.sanity < 30 ? 0.25 : 0.05;
  }

  if (Math.random() < huntChance) startHunt();
}

export function startHunt() {
  logToGame("💀 The ghost is hunting!");
  playAudio("audio/hunt_start_rumble.ogg");

  if (game.playerRoom === game.ghostRoom) {
    // ✅ Crucifix defense
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

  // ✅ Set cooldown after hunt
  const aggressiveGhosts = ["Demon", "Oni", "Raiju", "Moroi", "Succubus"];
  game.huntCooldown = aggressiveGhosts.includes(game.ghost)
    ? 3 + Math.floor(Math.random() * 2)
    : 5 + Math.floor(Math.random() * 3);
}

/***********************
 === PLAYER DEATH ===
************************/
export function playerDeath() {
  logToGame("💀 The ghost finds you. Everything goes cold...");
  playAudio("audio/player_death_choke.ogg");
  setTimeout(() => {
    alert("You died.");
    window.location.reload();
  }, 800);
}
