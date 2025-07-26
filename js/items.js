/*****************************************************
 * === PHASMA-PHONEY v2.9 — ITEMS.JS (FINAL WITH FEATURES) ===
 * Handles inventory management, consumables, placed items,
 * cursed items, and camera IR logic.
 *****************************************************/

import { game, allLoadoutItems, cursedItems, getCursedItemCost, gameSettings, evidenceMap } from "./state.js";
import { 
  logToGame, renderHUD, updateHeldItemsNotebook, 
  updateNearbyItemsNotebook, showNotebookUpdateBadge 
} from "./ui.js";
import { checkTurnEvents } from "./events.js";
import { startHunt } from "./ghostBehavior.js";

/***********************
 === USE ITEM (UPDATED) ===
************************/
export function useItem(i) {
  if (i === "Notebook") {
    logToGame("You open your Notebook...");
    return;
  }

  switch (i) {
    /* === CONSUMABLES (REMOVED FROM INVENTORY ON USE) === */
    case "Smudge Stick":
      if (game.playerRoom === game.ghostRoom) {
        game.smudgeActive = 3;
        logToGame("You smudge the room, calming the ghost.");
      } else {
        logToGame("You smudge, but nothing happens.");
      }
      consumeItem(i);
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

    /* === PLACED ITEMS (STAY IN ROOM, NOT RETURNED) === */
    case "Crucifix":
      if (game.playerRoom !== "Van") {
        game.placedCrucifix[game.playerRoom] = 2;
        logToGame("You place the crucifix. It may stop two hunts.");
        consumeItem(i); // Crucifix is removed from inventory
      } else {
        logToGame("Cannot place crucifix in van.");
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

    case "Video Camera":
      if (game.playerRoom !== "Van") {
        game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
        if (!game.roomItems[game.playerRoom].includes("Video Camera")) {
          game.roomItems[game.playerRoom].push("Video Camera");
        }
        game.cameraPlacements = game.cameraPlacements || [];
        if (!game.cameraPlacements.includes(game.playerRoom)) {
          game.cameraPlacements.push(game.playerRoom);
        }
        logToGame(`You place a video camera in ${game.playerRoom}.`);
        consumeItem(i);
      } else {
        logToGame("Cannot place video cameras in the van.");
      }
      break;

    /* === CAMERA IR TOGGLE (HELD ONLY) === */
    case "Camera":
      toggleIRCamera();
      break;

    /* === UV LIGHT (EVIDENCE CHECK) === */
    case "UV Light":
      if (game.roomItems[game.playerRoom]?.includes("Footprints")) {
        logToGame("You see glowing footprints under UV!");
        game.selectedEvidence.add("Fingerprints");
      } else {
        logToGame("No visible prints under UV.");
      }
      break;

    /* === CURSED ITEMS === */
    default:
      if (cursedItems[i]) handleCursedItem(i);
      else logToGame("You use the " + i + ", but nothing significant occurs.");
  }

  game.currentTurn++;
  game.nearbyItems = [...(game.roomItems[game.playerRoom] || [])];
  renderHUD();
  updateHeldItemsNotebook();
  updateNearbyItemsNotebook();
  showNotebookUpdateBadge();
  checkTurnEvents();
  if (gameSettings.autosave) {
    localStorage.setItem("phasmaPhoneySave", JSON.stringify(game));
  }
}

/***********************
 === CONSUME ITEM (NEW)
************************/
function consumeItem(item) {
  game.inventory = game.inventory.filter(x => x !== item);
  logToGame(`${item} has been used and is now consumed.`);
}

/***********************
 === CAMERA IR TOGGLE (NEW)
************************/
function toggleIRCamera() {
  if (!game.cameraActive) {
    game.cameraActive = true;
    logToGame("You switch on the camera IR mode...");
    checkForOrbs();
  } else {
    game.cameraActive = false;
    logToGame("You turn off the camera IR mode.");
  }
}

/***********************
 === CHECK FOR ORBS (NEW)
************************/
function checkForOrbs() {
  const ghost = game.ghost === "TheMimic" ? "The Mimic" : game.ghost;
  const hasOrbsEvidence = evidenceMap[ghost]?.includes("Ghost Orbs");

  if (game.playerRoom === game.ghostRoom && (hasOrbsEvidence || game.ghost === "TheMimic")) {
    logToGame("✨ Orbs float faintly in the air through the IR camera!");
  } else {
    logToGame("No orbs detected through the IR camera.");
  }
}

/***********************
 === HANDLE CURSED ITEMS (UNCHANGED)
************************/
export function handleCursedItem(i) {
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
      if (r < 0.2) logToGame("The Fool — nothing happens.");
      else if (r < 0.4) logToGame("The Tower — ghost activity spikes!");
      else if (r < 0.6) {
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
  game.nearbyItems = [...(game.roomItems[game.playerRoom] || [])];
  renderHUD();
  updateNearbyItemsNotebook();
  showNotebookUpdateBadge();
  if (gameSettings.autosave) {
    localStorage.setItem("phasmaPhoneySave", JSON.stringify(game));
  }
}

/***********************
 ✅ GLOBAL EXPOSURE FOR INLINE BUTTONS
************************/
window.inspectItem = inspectItem;
window.dropItem = dropItem;
window.pickItem = pickItem;
window.useItem = useItem;
