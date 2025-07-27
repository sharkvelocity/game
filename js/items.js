/*****************************************************
 * === PHASMA-PHONEY v2.9 — ITEMS.JS (FINAL MASTER) ===
 * Inventory, item interactions, cursed items, and consumables.
 *****************************************************/
import { game, cursedItems, getCursedItemCost, gameSettings, ghostProfiles } from "./state.js";
import { logToGame, renderHUD, updateHeldItemsNotebook, updateNearbyItemsNotebook, showNotebookUpdateBadge } from "./ui.js";
import { checkTurnEvents } from "./events.js";
import { startHunt } from "./ghostBehavior.js";

export function useItem(i) {
  if (i === "Notebook") {
    logToGame("You open your Notebook...");
    return;
  }
  switch (i) {
    case "Smudge Stick":
      if (game.playerRoom === game.ghostRoom) {
        game.smudgeActive = 3;
        logToGame("You smudge the room, calming the ghost.");
      } else logToGame("You smudge, but nothing happens.");
      consumeItem(i); break;

    case "Camera":
      if (game.playerRoom === game.ghostRoom &&
        (ghostProfiles[game.ghost]?.evidence.includes("Orbs") || game.ghost === "TheMimic"))
        logToGame("IR mode... Orbs shimmer faintly!");
      else logToGame("No orbs visible here.");
      break;

    case "Video Camera":
      if (game.playerRoom !== "Van") {
        game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
        if (!game.roomItems[game.playerRoom].includes("Video Camera")) {
          game.roomItems[game.playerRoom].push("Video Camera");
          game.cameraPlacements.push(game.playerRoom);
          logToGame(`You place a video camera in ${game.playerRoom}.`);
        }
      }
      break;

    case "Crucifix":
      if (game.playerRoom !== "Van") {
        game.placedCrucifix[game.playerRoom] = 2;
        logToGame("You place the crucifix.");
        consumeItem(i);
      }
      break;

    case "Salt":
      if (game.playerRoom !== "Van") {
        game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
        if (!game.roomItems[game.playerRoom].includes("Salt")) {
          game.roomItems[game.playerRoom].push("Salt");
          logToGame("You sprinkle salt.");
        }
        consumeItem(i);
      }
      break;

    default:
      if (cursedItems[i]) handleCursedItem(i);
      else logToGame(`You use the ${i}, but nothing happens.`);
  }
  endItemTurn();
}

function consumeItem(i) {
  game.inventory = game.inventory.filter(x => x !== i);
}

function endItemTurn() {
  game.currentTurn++;
  game.nearbyItems = [...(game.roomItems[game.playerRoom] || [])];
  renderHUD();
  updateHeldItemsNotebook();
  updateNearbyItemsNotebook();
  showNotebookUpdateBadge();
  checkTurnEvents();
  if (gameSettings.autosave)
    localStorage.setItem("phasmaPhoneySave", JSON.stringify(game));
}

export function handleCursedItem(i) {
  if (game.usedCursedItems[i]) {
    logToGame(`The ${i} is inert now.`);
    return;
  }
  logToGame(`You use the ${i}...`);
  game.sanity = Math.max(0, game.sanity - getCursedItemCost(i));
  if (i === "Summoning Circle") startHunt();
  game.usedCursedItems[i] = true;
  endItemTurn();
}

export function pickItem(item) {
  if (!item) return;
  if (game.inventory.filter(x => x !== "Notebook" && x !== "Lighter").length >= 3) {
    logToGame("⚠️ Max 3 items allowed.");
    return;
  }
  game.inventory.push(item);
  if (game.nearbyItems.includes(item))
    game.nearbyItems = game.nearbyItems.filter(i => i !== item);
  if (game.roomItems[game.playerRoom])
    game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom].filter(i => i !== item);
  logToGame(`You picked up the ${item}.`);
  renderHUD(); updateHeldItemsNotebook(); updateNearbyItemsNotebook(); showNotebookUpdateBadge();
}
