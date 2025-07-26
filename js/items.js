/*****************************************************
 * === PHASMA-PHONEY v2.9 — ITEMS.JS (FINAL FIXED) ===
 * Handles inventory, item interactions, cursed items,
 * consumables, and camera placement with IR logic.
 *****************************************************/
import { game, cursedItems, getCursedItemCost, gameSettings, ghostProfiles } from "./state.js";
import { 
  logToGame, renderHUD, updateHeldItemsNotebook, 
  updateNearbyItemsNotebook, showNotebookUpdateBadge 
} from "./ui.js";
import { checkTurnEvents } from "./events.js";
import { startHunt } from "./ghostBehavior.js";

/***********************
 === PICK UP ITEM ===
************************/
export function pickItem(i) {
  if (i === "Notebook") {
    logToGame("You always carry the Notebook.");
    return;
  }
  if (game.inventory.filter(x => x !== "Notebook" && x !== "Lighter").length >= 3) {
    logToGame("Max 3 carryable items (Notebook & Lighter excluded).");
    return;
  }
  if (cursedItems[i] && i === "Summoning Circle") {
    logToGame("The circle cannot be moved.");
    return;
  }

  game.roomItems[game.playerRoom] =
    (game.roomItems[game.playerRoom] || []).filter(x => x !== i);

  if (!game.inventory.includes(i)) {
    game.inventory.push(i);
    game.inventory.sort();
  }
  logToGame(`Picked up ${i}.`);
  endItemTurn();
}

/***********************
 === DROP ITEM ===
************************/
export function dropItem(i) {
  if (i === "Notebook") {
    logToGame("The Notebook cannot be dropped.");
    return;
  }
  if (game.playerRoom === "Van") {
    if (!game.vanStock.includes(i)) game.vanStock.push(i);
    logToGame(`Returned ${i} to the van.`);
  } else {
    game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
    if (!game.roomItems[game.playerRoom].includes(i)) game.roomItems[game.playerRoom].push(i);
    logToGame(`Dropped ${i} here.`);
  }
  game.inventory = game.inventory.filter(x => x !== i);
  endItemTurn();
}

/***********************
 === INSPECT ITEM ===
************************/
export function inspectItem(i) {
  let desc = cursedItems[i]?.desc || "Standard investigation gear.";
  switch (i) {
    case "Crucifix": desc = "Placed to prevent hunts. 2 uses."; break;
    case "Camera": desc = "Switch to IR to spot orbs in ghost room."; break;
    case "Video Camera": desc = "Place and view orbs from van monitor."; break;
    case "UV Light": desc = "Reveals fingerprints or footprints."; break;
    case "Salt": desc = "Sprinkle to reveal footprints."; break;
    case "Candle": desc = "Prevents Onryo hunts while lit."; break;
    case "Motion Sensor": desc = "Triggers alerts in van."; break;
  }
  logToGame(`Inspecting ${i}: ${desc}`);
}

/***********************
 === USE ITEM (UPDATED)
************************/
export function useItem(i) {
  if (i === "Notebook") { logToGame("You open your Notebook..."); return; }

  switch (i) {
    case "Smudge Stick":
      if (game.playerRoom === game.ghostRoom) {
        game.smudgeActive = 3;
        logToGame("You smudge the room, calming the ghost.");
      } else logToGame("You smudge, but nothing happens.");
      consumeItem(i);
      break;

    case "Camera":
      if (game.playerRoom === game.ghostRoom &&
          ghostProfiles[game.ghost]?.evidence.includes("Orbs")) {
        logToGame("You switch to IR mode... Orbs shimmer faintly!");
      } else logToGame("No orbs visible through IR here.");
      break;

    case "Video Camera":
      if (game.playerRoom !== "Van") {
        if (!game.roomItems[game.playerRoom]?.includes("Video Camera")) {
          game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
          game.roomItems[game.playerRoom].push("Video Camera");
          game.cameraPlacements.push(game.playerRoom);
          logToGame(`You place a video camera in ${game.playerRoom}.`);
        }
      } else logToGame("Cannot place video cameras in the van.");
      break;

    case "Crucifix":
      if (game.playerRoom !== "Van") {
        game.placedCrucifix[game.playerRoom] = 2;
        logToGame("You place the crucifix. It may stop two hunts.");
        consumeItem(i);
      } else logToGame("Cannot place crucifix in van.");
      break;

    case "Salt":
      if (game.playerRoom !== "Van") {
        game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
        if (!game.roomItems[game.playerRoom].includes("Salt")) {
          game.roomItems[game.playerRoom].push("Salt");
          logToGame("You sprinkle salt on the ground.");
        }
        consumeItem(i);
      }
      break;

    case "UV Light":
      if (game.roomItems[game.playerRoom]?.includes("Footprints")) {
        logToGame("You see glowing footprints under UV!");
        game.selectedEvidence.add("Fingerprints");
      } else logToGame("No visible prints under UV.");
      break;

    case "Candle":
      if (game.playerRoom !== "Van") {
        game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
        if (!game.roomItems[game.playerRoom].includes("Candle")) {
          game.roomItems[game.playerRoom].push("Candle");
          logToGame("You place and light a candle here.");
        }
        consumeItem(i);
      }
      break;

    case "Motion Sensor":
      if (game.playerRoom !== "Van") {
        game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
        if (!game.roomItems[game.playerRoom].includes("Motion Sensor")) {
          game.roomItems[game.playerRoom].push("Motion Sensor");
          logToGame("You place a motion sensor in this room.");
        }
        consumeItem(i);
      }
      break;

    default:
      if (cursedItems[i]) handleCursedItem(i);
      else logToGame(`You use the ${i}, but nothing significant occurs.`);
  }

  endItemTurn();
}

/***********************
 === HELPERS
************************/
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
  if (gameSettings.autosave) localStorage.setItem("phasmaPhoneySave", JSON.stringify(game));
}

/***********************
 === HANDLE CURSED ITEMS
************************/
export function handleCursedItem(i) {
  if (game.usedCursedItems[i]) { logToGame(`The ${i} is inert now.`); return; }
  logToGame(`You use the ${i}...`);
  game.sanity = Math.max(0, game.sanity - getCursedItemCost(i));
  switch (i) {
    case "Ouija Board": if (Math.random() < 0.2) startHunt(); break;
    case "Tarot Cards":
      const r = Math.random();
      if (r < 0.2) logToGame("The Fool — nothing happens.");
      else if (r < 0.4) logToGame("The Tower — ghost activity spikes!");
      else if (r < 0.6) { logToGame("The Death card — hunt triggered!"); startHunt(); }
      else { logToGame("The Sun — sanity restored."); game.sanity = Math.min(100, game.sanity + 10); }
      break;
    case "Music Box":
    case "Haunted Mirror": if (Math.random() < 0.3) startHunt(); break;
    case "Summoning Circle": startHunt(); break;
    case "Monkey Paw": if (Math.random() < 0.5) startHunt(); break;
  }
  game.usedCursedItems[i] = true;
  endItemTurn();
}

/***********************
 ✅ GLOBAL + ES6 EXPORTS
************************/
window.inspectItem = inspectItem;
window.dropItem = dropItem;
window.pickItem = pickItem;
window.useItem = useItem;

export { inspectItem, dropItem, pickItem, useItem, handleCursedItem };
