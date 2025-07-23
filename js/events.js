/*****************************************************
 * === PHASMA-PHONEY v2.9 — GAME EVENTS & HUNT LOGIC ===
 *****************************************************/
import { game } from "./state.js";
import { logToGame, renderHUD } from "./ui.js";

export function advanceTurn() {
  if (game.playerRoom === game.ghostRoom) {
    game.sanity -= 3 + Math.random() * 3;
    logToGame("The air feels heavy...");
  } else {
    game.sanity -= 1;
  }

  game.sanity = Math.max(0, game.sanity);
  renderHUD();

  if (game.sanity < 30 && Math.random() < 0.25) startHunt();
}

export function startHunt() {
  logToGame("💀 The ghost is hunting!");
  if (game.playerRoom === game.ghostRoom) {
    if (game.placedCrucifix[game.playerRoom] > 0) {
      game.placedCrucifix[game.playerRoom]--;
      logToGame("The crucifix burns, stopping the hunt.");
    } else {
      playerDeath();
    }
  } else {
    logToGame("You survived the hunt...");
  }
}

export function playerDeath() {
  logToGame("💀 The ghost finds you. Everything goes cold...");
  setTimeout(() => {
    alert("You died.");
    location.reload();
  }, 800);
}
