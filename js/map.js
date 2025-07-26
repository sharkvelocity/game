/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAP & MOVEMENT (FINAL) ===
 * Updated for compass-based movement, turn logic,
 * van-return handling, and synced with HUD & background.
 *****************************************************/
import { game, mapConnections } from "./state.js";
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
  checkTurnEvents();
}

/***********************
 === LIST AVAILABLE PATHS (OPTIONAL) ===
************************/
export function listAvailablePaths() {
  const paths = mapConnections[game.playerRoom] || [];
  logToGame(`Paths from ${game.playerRoom}: ${paths.join(", ")}`);
  return paths;
}
