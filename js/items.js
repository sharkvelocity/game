/*****************************************************
 * === PHASMA-PHONEY v2.9 — ITEMS.JS (FINAL MASTER) ===
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
 === INVENTORY OVERLAY
************************/
export function openInventoryOverlay() {
  const overlay = document.getElementById("inventory-overlay");
  if (!overlay) {
    console.error("❌ Inventory overlay not found!");
    return;
  }
  overlay.style.display = "flex";
  renderInventoryOverlay();
}

function renderInventoryOverlay() {
  const list = document.getElementById("inventory-list");
  if (!list) return;
  list.innerHTML = "";

  const inv = game.inventory.filter(i => i !== "Notebook");
  if (inv.length) {
    inv.forEach(item => {
      const btn = document.createElement("button");
      btn.className = "inventory-item";
      btn.textContent = item;
      btn.onclick = () => {
        useItem(item);
        closeInventoryOverlay();
      };
      list.appendChild(btn);
    });
  } else {
    list.innerHTML = "<p>No items currently held.</p>";
  }
}

export function closeInventoryOverlay() {
  const overlay = document.getElementById("inventory-overlay");
  if (overlay) overlay.style.display = "none";
}

/***********************
 === USE ITEM
************************/
export function useItem(i) {
  if (i === "Notebook") {
    logToGame("You open your Notebook...");
    document.getElementById("notebook").classList.add("open");
    return;
  }

  switch (i) {
    case "Smudge Stick":
      if (game.playerRoom === game.ghostRoom) {
        game.smudgeActive = 3;
        logToGame("You smudge the room, calming the ghost.");
      } else {
        logToGame("You smudge, but nothing happens.");
      }
      consumeItem(i);
      break;

    case "Camera":
      if (
        game.playerRoom === game.ghostRoom &&
        (ghostProfiles[game.ghost]?.evidence.includes("Orbs") || game.ghost === "TheMimic")
      ) {
        logToGame("You switch to IR mode... Orbs shimmer faintly!");
      } else {
        logToGame("No orbs visible through IR here.");
      }
      break;

    case "Video Camera":
      if (game.playerRoom !== "Van") {
        if (!game.roomItems[game.playerRoom]?.includes("Video Camera")) {
          game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
          game.roomItems[game.playerRoom].push("Video Camera");
          game.cameraPlacements.push(game.playerRoom);
          logToGame(`You place a video camera in ${game.playerRoom}.`);
        }
      } else {
        logToGame("Cannot place video cameras in the van.");
      }
      break;

    case "Crucifix":
      if (game.playerRoom !== "Van") {
        game.placedCrucifix[game.playerRoom] = 2;
        logToGame("You place the crucifix. It may stop two hunts.");
        consumeItem(i);
      } else {
        logToGame("Cannot place crucifix in van.");
      }
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
      } else {
        logToGame("No visible prints under UV.");
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
      if (cursedItems[i]) {
        handleCursedItem(i);
      } else {
        logToGame(`You use the ${i}, but nothing significant occurs.`);
      }
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
  if (gameSettings.autosave) {
    localStorage.setItem("phasmaPhoneySave", JSON.stringify(game));
  }
}

/***********************
 === HANDLE CURSED ITEMS
************************/
export function handleCursedItem(i) {
  if (game.usedCursedItems[i]) {
    logToGame(`The ${i} is inert now.`);
    return;
  }
  logToGame(`You use the ${i}...`);
  game.sanity = Math.max(0, game.sanity - getCursedItemCost(i));

  switch (i) {
    case "Ouija Board":
      if (Math.random() < 0.2) startHunt();
      break;
    case "Tarot Cards": {
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
    }
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
  endItemTurn();
}

/***********************
 === PICK ITEM
************************/
export function pickItem(item) {
  if (!item) {
    logToGame("⚠️ No item selected to pick up.");
    return;
  }

  if (item === "Notebook" || item === "Lighter") {
    logToGame(`⚠️ You cannot pick up the ${item}.`);
    return;
  }

  const carryable = game.inventory.filter(x => x !== "Notebook" && x !== "Lighter");
  if (carryable.length >= 3) {
    logToGame("⚠️ You can only hold 3 items at once (Notebook & Lighter excluded).");
    return;
  }

  game.inventory.push(item);

  if (game.nearbyItems.includes(item)) {
    game.nearbyItems = game.nearbyItems.filter(i => i !== item);
  }

  if (game.roomItems[game.playerRoom]) {
    game.roomItems[game.playerRoom] =
      game.roomItems[game.playerRoom].filter(i => i !== item);
    if (game.roomItems[game.playerRoom].length === 0) {
      delete game.roomItems[game.playerRoom];
    }
  }

  logToGame(`You picked up the ${item}.`);

  renderHUD();
  updateHeldItemsNotebook();
  updateNearbyItemsNotebook();
  showNotebookUpdateBadge();
}
