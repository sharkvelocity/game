/*****************************************************
 * === PHASMA-PHONEY v2.9 — HUNT SYSTEM (FINAL FIXED) ===
 * Integrated with MP3 audio, red flash effect, and save.
 *****************************************************/
import { game } from "./state.js";
import { logToGame } from "./ui.js";
import { saveGame } from "./saveManager.js";
import { playAudio, stopAllSounds } from "./audioManager.js";

export function startHunt() {
  logToGame("💀 The ghost is hunting!");
  flashRed();

  // 🔊 Play rumble, then heartbeat after ~1.8 seconds
  playAudio("audio/hunt_start_rumble.mp3");
  setTimeout(() => {
    playAudio("audio/hunt_start_rumble_heartbeat.mp3", true); // looped heartbeat
  }, 1800);

  if (game.playerRoom === game.ghostRoom) {
    if (game.placedCrucifix && game.placedCrucifix[game.playerRoom] > 0) {
      game.placedCrucifix[game.playerRoom]--;
      if (game.placedCrucifix[game.playerRoom] === 0) {
        delete game.placedCrucifix[game.playerRoom];
        logToGame("The crucifix burns away completely!");
      } else {
        logToGame(`The crucifix burns, stopping the hunt. (${game.placedCrucifix[game.playerRoom]} uses left)`);
      }
      playAudio("audio/crucifix_burn.mp3");
      stopAllSounds();
    } else {
      setTimeout(playerDeath, 2000);
    }
  } else {
    logToGame("You survived the hunt...");
    setTimeout(() => stopAllSounds(), 2500);
  }

  // Hunt cooldown scaling by ghost aggression
  const aggressiveGhosts = ["Demon", "Oni", "Raiju", "Moroi"];
  game.huntCooldown = aggressiveGhosts.includes(game.ghost)
    ? 3 + Math.floor(Math.random() * 2)
    : 5 + Math.floor(Math.random() * 3);
}

/***********************
 === RED FLASH VISUAL ===
************************/
function flashRed() {
  const l = document.getElementById("lightning");
  let c = 0;
  (function pulse() {
    if (c >= 4) { l.style.opacity = 0; return; }
    l.style.background = "red";
    l.style.opacity = 0.6 + Math.random() * 0.2;
    setTimeout(() => {
      l.style.opacity = 0;
      c++;
      setTimeout(pulse, 150);
    }, 150);
  })();
}

/***********************
 === PLAYER DEATH ===
************************/
function playerDeath() {
  stopAllSounds();
  playAudio("audio/gameKilled.mp3");

  const overlay = document.createElement("div");
  overlay.id = "death-screen";
  Object.assign(overlay.style, {
    position: "fixed", top: "0", left: "0",
    width: "100vw", height: "100vh",
    background: "rgba(0,0,0,0.9)", color: "#f00",
    fontSize: "4em", display: "flex",
    justifyContent: "center", alignItems: "center",
    zIndex: "5000"
  });
  overlay.textContent = `YOU DIED — Ghost: ${game.ghost}`;
  document.body.appendChild(overlay);

  setTimeout(() => {
    document.body.removeChild(overlay);
    saveGame(true);
    window.location.reload();
  }, 3000);
}
