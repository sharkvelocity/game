/*****************************************************
 * === PHASMA-PHONEY v2.9 — ITEM & CURSED ITEM LOGIC ===
 *****************************************************/
import { game } from "./state.js";
import { logToGame, renderHUD } from "./ui.js";
import { startHunt } from "./events.js";

export const cursedItems = {
  "Ouija Board": { desc: "Ask ghost questions, drains sanity.", cost: 15 },
  "Tarot Cards": { desc: "Random effects, risky.", cost: 5 },
  "Music Box": { desc: "Attracts ghost, risky.", cost: 10 },
  "Haunted Mirror": { desc: "Reveals ghost room, drains sanity.", cost: 20 },
  "Summoning Circle": { desc: "Forces ghost appearance.", cost: 25 },
  "Monkey Paw": { desc: "Grants risky wishes.", cost: 10 }
};

export function getCursedItemCost(item) {
  return cursedItems[item]?.cost || 5;
}

export function useItem(i) {
  switch (i) {
    case "Smudge Stick":
      if (game.playerRoom === game.ghostRoom) {
        game.smudgeActive = 3;
        logToGame("You smudge the room, calming the ghost.");
      } else {
        logToGame("You smudge, but nothing happens.");
      }
      break;

    case "Crucifix":
      if (game.playerRoom !== "Van") {
        game.placedCrucifix[game.playerRoom] = 2;
        logToGame("You place the crucifix. It may stop two hunts.");
        game.inventory = game.inventory.filter(x => x !== i);
      } else {
        logToGame("Cannot place crucifix in van.");
      }
      break;

    default:
      if (cursedItems[i]) handleCursedItem(i);
      else logToGame("You use the " + i + ", but nothing significant occurs.");
  }
  game.currentTurn++;
  renderHUD();
}

function handleCursedItem(i) {
  if (game.usedCursedItems[i]) {
    logToGame("The " + i + " is inert now.");
    return;
  }
  logToGame("You use the " + i + "...");
  game.sanity -= getCursedItemCost(i);
  if (game.sanity < 0) game.sanity = 0;

  switch (i) {
    case "Ouija Board":
      if (Math.random() < 0.2) startHunt();
      break;
    case "Tarot Cards":
      const r = Math.random();
      if (r < 0.3) logToGame("The Fool — nothing happens.");
      else if (r < 0.5) logToGame("The Tower — ghost activity spikes!");
      else if (r < 0.7) {
        logToGame("The Death card — hunt triggered!");
        startHunt();
      } else {
        logToGame("The Sun — sanity restored.");
        game.sanity = Math.min(100, game.sanity + 10);
      }
      break;
    case "Music Box":
    case "Haunted Mirror":
      if (Math.random() < 0.3) startHunt();
      break;
    case "Summoning Circle":
      startHunt();
      break;
    case "Monkey Paw":
      if (Math.random() < 0.5) startHunt();
      break;
  }
  game.usedCursedItems[i] = true;
}
