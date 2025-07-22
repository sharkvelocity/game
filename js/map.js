/*****************************************************
 * === PHASMA-PHONEY v2.6 — MAP & MOVEMENT SYSTEM ===
 * Handles room connections, overlays, and movement.
 *****************************************************/

import { game, mapConnections } from "./state.js";
import { logToGame, renderHUD, updateBackground } from "./ui.js";
import { advanceTurn } from "./ghostBehavior.js";

// === OPEN MOVE OVERLAY ===
export function openMoveOverlay() {
  const overlay = document.getElementById("move-overlay");
  const options = document.getElementById("move-options");
  const connectedRooms = mapConnections[game.playerRoom] || [];

  options.innerHTML = "";
  if (!connectedRooms.length) {
    logToGame("No available paths from here.");
    return;
  }

  connectedRooms.forEach(room => {
    const btn = document.createElement("button");
    btn.textContent = "Go to " + room;
    btn.onclick = () => {
      overlay.style.display = "none";
      moveToRoom(room);
    };
    options.appendChild(btn);
  });

  overlay.style.display = "flex";
}

// === MOVE TO A NEW ROOM ===
export function moveToRoom(room) {
  game.playerRoom = room;
  game.currentTurn++;
  logToGame("You move to " + room + ".");
  renderHUD();
  updateBackground();
  advanceTurn(); // Tick ghost logic after moving
}
