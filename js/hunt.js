/*****************************************************
 * === PHASMA-PHONEY v2.9 — HUNT SYSTEM ===
 *****************************************************/
import { game } from "./state.js";
import { logToGame } from "./ui.js";
import { saveGame } from "./saveManager.js";

export function startHunt() {
  logToGame("💀 The ghost is hunting!");
  flashRed();
  if (game.playerRoom === game.ghostRoom) {
    if (game.placedCrucifix[game.playerRoom] > 0) {
      game.placedCrucifix[game.playerRoom]--;
      logToGame("The crucifix burns, stopping the hunt.");
    } else {
      setTimeout(playerDeath, 1200);
    }
  } else {
    logToGame("You survived the hunt...");
  }
}

function flashRed() {
  const l = document.getElementById("lightning");
  let c = 0;
  (function pulse() {
    if (c >= 3) { l.style.opacity = 0; return; }
    l.style.background = "red";
    l.style.opacity = 0.6 + Math.random() * 0.2;
    setTimeout(() => { l.style.opacity = 0; c++; setTimeout(pulse, 150); }, 150);
  })();
}

function playerDeath() {
  const overlay = document.createElement("div");
  overlay.id = "death-screen";
  Object.assign(overlay.style, {
    position: "fixed", top: "0", left: "0",
    width: "100vw", height: "100vh",
    background: "rgba(0,0,0,0.9)", color: "#f00",
    fontSize: "4em", display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: "5000"
  });
  overlay.textContent = `YOU DIED — Ghost: ${game.ghost}`;
  document.body.appendChild(overlay);
  setTimeout(() => { document.body.removeChild(overlay); saveGame(true); }, 3000);
}
