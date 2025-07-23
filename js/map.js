/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAP & MOVEMENT ===
 *****************************************************/
import { game } from "./state.js";
import { logToGame, renderHUD } from "./ui.js";

export const mapConnections = {
  Van: ["Foyer"],
  Foyer: ["Van", "LivingRoom", "Kitchen", "Bathroom"],
  LivingRoom: ["Foyer", "DiningRoom", "Garage", "KidsBedroom", "MasterBedroom"],
  Kitchen: ["Foyer", "DiningRoom", "Basement"],
  DiningRoom: ["Kitchen", "LivingRoom"],
  Basement: ["Kitchen"],
  Garage: ["LivingRoom"],
  Bathroom: ["Foyer"],
  KidsBedroom: ["LivingRoom"],
  MasterBedroom: ["LivingRoom"]
};

export function moveToRoom(r) {
  if (game.playerRoom === r) {
    logToGame("You are already in " + r + ".");
    return;
  }
  game.playerRoom = r;
  game.currentTurn++;
  logToGame("You move to " + r + ".");
  renderHUD();
}
