/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAP & MOVEMENT MODULE ===
 * Handles room navigation, map connections, and
 * updates the visual background per direction.
 *****************************************************/

import { game, mapConnections, roomVisuals } from "./state.js";
import { logToGame, renderHUD } from "./ui.js";
import { triggerGhostBehavior } from "./ghostBehavior.js";
import { saveGame } from "./events.js";

/* === MOVE OVERLAY (UI) === */
export function openMoveOverlay() {
  const existing = document.getElementById("move-temp");
  if (existing) document.body.removeChild(existing);

  const exits = mapConnections[game.playerRoom] || [];
  if (!exits.length) {
    logToGame("No available exits from this room.");
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "move-temp";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "50%", left: "50%",
    transform: "translate(-50%,-50%)",
    background: "#111",
    padding: "10px",
    maxWidth: "90%",
    zIndex: "3000",
    border: "1px solid #555",
    borderRadius: "4px"
  });

  let html = `<h3 style="color:#0ff;margin-top:0;">Available Exits</h3>`;
  html += exits.map(r => `<button data-move="${r}">Go to ${r}</button>`).join("");
  html += `<button style="margin-top:6px;" data-close="true">Close</button>`;

  overlay.innerHTML = html;
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target.dataset.move) {
      moveToRoom(e.target.dataset.move);
      document.body.removeChild(overlay);
    }
    if (e.target.dataset.close) {
      document.body.removeChild(overlay);
    }
  });
}

/* === MOVE TO A ROOM === */
export function moveToRoom(room) {
  if (game.playerRoom === room) {
    logToGame(`You are already in ${room}.`);
    return;
  }

  game.playerRoom = room;
  game.currentTurn++;
  game.playerDirection = "N"; // Reset view direction
  logToGame(`You move to ${room}.`);

  renderHUD();
  updateBackground();
  triggerGhostBehavior();
  saveGame(true);
}

/* === UPDATE BACKGROUND IMAGE === */
export function updateBackground() {
  const visuals = roomVisuals[game.playerRoom] || roomVisuals["Van"];
  const direction = game.playerDirection || "N";
  const bg = document.getElementById("background");

  if (visuals && visuals[direction]) {
    bg.style.backgroundImage = `url('${visuals[direction]}')`;
  } else {
    console.warn(`Missing background for ${game.playerRoom} (${direction}).`);
    bg.style.backgroundImage = `url('${roomVisuals["Van"]["N"]}')`;
  }
}
