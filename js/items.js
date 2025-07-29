/*****************************************************
 * === PHASMA-PHONEY v2.9 — ITEMS.JS (FINAL CLEANED) ===
 * Inventory use, cursed item effects, pickups, and HUD sync
 *****************************************************/
import { game, cursedItems, getCursedItemCost, gameSettings, ghostProfiles } from "./state.js";
import {
  logToGame, renderHUD, updateHeldItemsNotebook,
  updateNearbyItemsNotebook, showNotebookUpdateBadge
} from "./ui.js";
import { checkTurnEvents } from "./events.js";
import { startHunt } from "./ghostBehavior.js";

/***********************
 * INVENTORY OVERLAY
 ************************/
export function openInventoryOverlay() {
  const overlay = document.getElementById("inventory-overlay");
  if (!overlay) return console.error("❌ Inventory overlay not found!");
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
 * USE ITEM
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
        logToGame("You smudge the ghost room. The entity recoils.");
      } else {
        logToGame("You smudge, but nothing reacts.");
      }
      consumeItem(i);
      break;

    case "Camera":
      if (
        game.playerRoom === game.ghostRoom &&
        (ghostProfiles[game.ghost]?.evidence.includes("Ghost Orb") || game.ghost === "The Mimic")
      ) {
        logToGame("You snap a photo — shimmering orbs appear on IR!");
      } else {
        logToGame("You take a photo, but nothing unusual shows.");
      }
      break;

    case "Video Camera":
      if (game.playerRoom === "Van") {
        logToGame("You can't place cameras in the van.");
        break;
      }
      if (!game.roomItems[game.playerRoom]?.includes("Video Camera")) {
        game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
        game.roomItems[game.playerRoom].push("Video Camera");
        game.cameraPlacements.push(game.playerRoom);
        logToGame(`You set up a video camera in the ${game.playerRoom}.`);
      } else {
        logToGame("There's already a video camera here.");
      }
      break;

    case "Crucifix":
      if (game.playerRoom === "Van") {
        logToGame("Can't place crucifix in the van.");
        break;
      }
      game.placedCrucifix[game.playerRoom] = 2;
      logToGame("You place the crucifix to block hunts (2 charges).");
      consumeItem(i);
      break;

    case "Salt":
      if (game.playerRoom === "Van") {
        logToGame("Salt won't help inside the van.");
        break;
      }
      game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
      if (!game.roomItems[game.playerRoom].includes("Salt")) {
        game.roomItems[game.playerRoom].push("Salt");
        logToGame("You sprinkle salt across the floor.");
        consumeItem(i);
      } else {
        logToGame("You've already used salt in this room.");
      }
      break;

    case "UV Light":
      if (game.roomItems[game.playerRoom]?.includes("Footprints")) {
        logToGame("UV reveals glowing footprints!");
        game.selectedEvidence.add("Fingerprints");
      } else {
        logToGame("You scan the room... nothing lights up.");
      }
      break;

    case "Candle":
      if (game.playerRoom === "Van") {
        logToGame("No need to place a candle in the van.");
        break;
      }
      game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
      if (!game.roomItems[game.playerRoom].includes("Candle")) {
        game.roomItems[game.playerRoom].push("Candle");
        logToGame("You light a candle in the room.");
        consumeItem(i);
      } else {
        logToGame("A candle is already burning here.");
      }
      break;

    case "Motion Sensor":
      if (game.playerRoom !== "Van") {
        game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
        if (!game.roomItems[game.playerRoom].includes("Motion Sensor")) {
          game.roomItems[game.playerRoom].push("Motion Sensor");
          logToGame("You set up a motion sensor.");
          consumeItem(i);
        } else {
          logToGame("Motion sensor already placed.");
        }
      } else {
        logToGame("Motion sensors don’t work inside the van.");
      }
      break;

    default:
      if (cursedItems[i]) {
        handleCursedItem(i);
      } else {
        logToGame(`You use the ${i}, but nothing happens.`);
      }
  }

  endItemTurn();
}

function consumeItem(i) {
  game.inventory = game.inventory.filter(x => x !== i);
}

/***********************
 * END TURN + HUD UPDATE
 ************************/
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
 * CURSED ITEMS
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
    case "Tarot Cards":
      const r = Math.random();
      if (r < 0.2) logToGame("The Fool — nothing happens.");
      else if (r < 0.4) logToGame("The Tower — sudden burst of ghost activity!");
      else if (r < 0.6) { logToGame("The Death card — a hunt is triggered!"); startHunt(); }
      else logToGame("The Sun — your mind clears. Sanity +10.");
      if (r >= 0.6) game.sanity = Math.min(100, game.sanity + 10);
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
  endItemTurn();
}

/***********************
 * PICKUP ITEM
 ************************/
export function pickItem(item) {
  if (!item) return logToGame("⚠️ No item selected.");

  if (item === "Notebook" || item === "Lighter") {
    return logToGame(`⚠️ The ${item} is always with you.`);
  }

  const carryable = game.inventory.filter(i => i !== "Notebook" && i !== "Lighter");
  if (carryable.length >= 3) {
    logToGame("⚠️ Max 3 carryable items at once (Notebook/Lighter excluded).");
    return;
  }

  game.inventory.push(item);

  // Remove from room
  if (game.roomItems[game.playerRoom]) {
    game.roomItems[game.playerRoom] =
      game.roomItems[game.playerRoom].filter(i => i !== item);
    if (game.roomItems[game.playerRoom].length === 0)
      delete game.roomItems[game.playerRoom];
  }

  game.nearbyItems = game.nearbyItems.filter(i => i !== item);

  logToGame(`You picked up the ${item}.`);

  renderHUD();
  updateHeldItemsNotebook();
  updateNearbyItemsNotebook();
  showNotebookUpdateBadge();
}
