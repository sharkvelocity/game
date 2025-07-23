/*****************************************************
 * === PHASMA-PHONEY v2.9 — ITEM & INVENTORY MODULE ===
 * Handles van stock, pickup/drop logic, cursed items,
 * and basic item use interactions.
 *****************************************************/

import { game, allLoadoutItems, cursedItems, getCursedItemCost } from "./state.js";
import { logToGame, renderHUD } from "./ui.js";
import { triggerGhostBehavior, evidenceInteraction } from "./ghostBehavior.js";
import { playSound } from "./audioManager.js";

/* === PICK UP AN ITEM === */
export function pickItem(item) {
  if (game.inventory.length >= 3) {
    logToGame("⚠️ You can only hold 3 items at once.");
    return;
  }
  if (cursedItems[item] && item === "Summoning Circle") {
    logToGame("The summoning circle cannot be moved.");
    return;
  }

  game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
  game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom].filter(i => i !== item);

  if (!game.inventory.includes(item)) {
    game.inventory.push(item);
    game.inventory.sort();
    logToGame(`Picked up ${item}.`);
  }
  renderHUD();
}

/* === DROP AN ITEM === */
export function dropItem(item) {
  if (game.playerRoom === "Van") {
    if (!game.vanStock.includes(item)) {
      game.vanStock.push(item);
      game.vanStock.sort();
      logToGame(`Returned ${item} to van.`);
    }
  } else {
    game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
    if (!game.roomItems[game.playerRoom].includes(item)) {
      game.roomItems[game.playerRoom].push(item);
      logToGame(`Dropped ${item} here.`);
    }
  }

  game.inventory = game.inventory.filter(i => i !== item);
  renderHUD();
}

/* === USE AN ITEM === */
export function useItem(item) {
  if (!item) return;
  const room = game.playerRoom;
  const inGhostRoom = room === game.ghostRoom;

  switch (item) {
    case "Smudge Stick":
      if (inGhostRoom) {
        game.smudgeActive = 3;
        logToGame("You smudge the room, calming the ghost temporarily.");
        playSound("smudge_sizzle.ogg", 0.8);
      } else {
        logToGame("You smudge, but nothing happens.");
      }
      break;

    case "Crucifix":
      if (room !== "Van") {
        game.placedCrucifix[room] = 2;
        game.inventory = game.inventory.filter(i => i !== item);
        logToGame("You place a crucifix—it may stop two hunts.");
        playSound("crucifix_burn.ogg", 0.7);
      } else {
        logToGame("Cannot place crucifix in van.");
      }
      break;

    case "Salt":
      if (room !== "Van") {
        game.roomItems[room] = game.roomItems[room] || [];
        if (!game.roomItems[room].includes("Salt")) {
          game.roomItems[room].push("Salt");
          logToGame("You sprinkle salt on the ground.");
        }
      }
      break;

    case "Candle":
      if (room !== "Van") {
        game.roomItems[room] = game.roomItems[room] || [];
        if (!game.roomItems[room].includes("Candle")) {
          game.roomItems[room].push("Candle");
          logToGame("You place and light a candle here.");
          playSound("candle_out.ogg", 0.4);
        }
      }
      break;

    case "Motion Sensor":
      if (room !== "Van") {
        game.roomItems[room] = game.roomItems[room] || [];
        if (!game.roomItems[room].includes("Motion Sensor")) {
          game.roomItems[room].push("Motion Sensor");
          logToGame("You place a motion sensor.");
        }
      }
      break;

    case "Camera":
    case "Video Camera":
      if (room !== "Van") {
        game.cameraActive = !game.cameraActive;
        logToGame(game.cameraActive
          ? "Camera activated—watch for orbs."
          : "Camera deactivated.");
      } else {
        logToGame("You cannot use cameras in the van.");
      }
      break;

    case "UV Light":
    case "EMF Reader":
    case "Spirit Box":
    case "Ghost Writing Book":
    case "D.O.T.S Projector":
    case "Thermometer":
      evidenceInteraction(item);
      break;

    default:
      if (cursedItems[item]) {
        useCursedItem(item);
      } else {
        logToGame(`You use the ${item}, but nothing significant occurs.`);
      }
  }

  triggerGhostBehavior();
}

/* === USE A CURSED ITEM === */
export function useCursedItem(item) {
  if (game.usedCursedItems[item]) {
    logToGame(`The ${item} is inert now.`);
    return;
  }

  logToGame(`You use the ${item}...`);
  game.sanity -= getCursedItemCost(item);
  if (game.sanity < 0) game.sanity = 0;

  switch (item) {
    case "Ouija Board":
      if (Math.random() < 0.2) logToGame("The ghost grows angry after your question!");
      break;

    case "Tarot Cards":
      const r = Math.random();
      if (r < 0.2) logToGame("The Fool—nothing happens.");
      else if (r < 0.4) logToGame("The Tower—activity spikes!");
      else if (r < 0.6) logToGame("The Death card—a hunt begins!");
      else {
        logToGame("The Sun—your mind clears, sanity restored.");
        game.sanity = Math.min(100, game.sanity + 10);
      }
      break;

    case "Music Box":
    case "Haunted Mirror":
    case "Monkey Paw":
      if (Math.random() < 0.3) logToGame("You feel the ghost's presence drawing closer...");
      break;

    case "Summoning Circle":
      logToGame("The ghost is forced to appear!");
      break;
  }

  game.usedCursedItems[item] = true;
  renderHUD();
}
