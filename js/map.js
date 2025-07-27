/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAP (STUB, USING UNIFIED STATE) ===
 * Handles movement logic ONLY, importing map data,
 * compass directions, and visuals from state.js.
 *****************************************************/

import { game, mapConnections, roomVisuals } from "./state.js";
import { logToGame, renderHUD, updateBackground } from "./ui.js";
import { checkTurnEvents } from "./events.js";

/***********************
 === MOVE TO ROOM ===
************************/
export function moveToRoom(room) {
  if (game.playerRoom === room) {
    logToGame(`You are already in ${room}.`);
    return;
  }

  const available = mapConnections[game.playerRoom] || [];
  if (!available.includes(room)) {
    logToGame(`You cannot move directly to ${room} from here.`);
    return;
  }

  game.playerRoom = room;
  game.currentTurn++;

  if (room === "Van") {
    logToGame("You return to the van to regroup.");
  } else {
    logToGame(`You move to ${room}.`);
  }

  renderHUD();
  updateBackground();
  updateCompassButtons();
  checkTurnEvents();
}

/***********************
 === UPDATE COMPASS BUTTONS ===
************************/
export function updateCompassButtons() {
  const buttons = {
    N: document.getElementById("move-north"),
    S: document.getElementById("move-south"),
    E: document.getElementById("move-east"),
    W: document.getElementById("move-west")
  };

  const compass = buildCompassDirections();
  const paths = compass[game.playerRoom] || {};

  for (const dir in buttons) {
    if (!buttons[dir]) continue;
    const targetRoom = paths[dir];
    if (targetRoom) {
      buttons[dir].disabled = false;
      buttons[dir].textContent = `${dir} → ${targetRoom}`;
      buttons[dir].onclick = () => moveToRoom(targetRoom);
    } else {
      buttons[dir].disabled = true;
      buttons[dir].textContent = `${dir} (No Path)`;
      buttons[dir].onclick = null;
    }
  }
}

/***********************
 === AUTO-BUILD COMPASS FROM mapConnections ===
************************/
export function buildCompassDirections() {
  // You can predefine this in state.js if preferred, but we generate it dynamically here
  const compass = {};
  for (const [room, neighbors] of Object.entries(mapConnections)) {
    compass[room] = {};

    neighbors.forEach(neighbor => {
      // Quick heuristic: try to map cardinal directions (optional enhancement)
      if (neighbor.includes("Foyer") || neighbor.includes("Van")) compass[room]["S"] = neighbor;
      else if (neighbor.includes("Living") || neighbor.includes("Kitchen")) compass[room]["N"] = neighbor;
      else compass[room]["E"] = neighbor; // Fallback
    });
  }
  return compass;
}
