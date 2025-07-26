/*****************************************************
 * === PHASMA-PHONEY v2.9 — ITEMS.JS (FINAL FIXED) ===
 * Handles inventory management, item interactions,
 * cursed items, and camera placement for van monitor.
 * ✅ Consumables consumed after use.
 * ✅ Video Camera handheld IR toggle added for orb detection.
 *****************************************************/

import { game, allLoadoutItems, cursedItems, getCursedItemCost, gameSettings } from "./state.js";
import { 
  logToGame, renderHUD, updateHeldItemsNotebook, 
  updateNearbyItemsNotebook, showNotebookUpdateBadge 
} from "./ui.js";
import { checkTurnEvents } from "./events.js";
import { startHunt } from "./ghostBehavior.js";

/***********************
 === OPEN INVENTORY OVERLAY ===
************************/
export function openInventoryOverlay() {
  const existing = document.getElementById("inventory-temp");
  if (existing) document.body.removeChild(existing);

  const c = document.createElement("div");
  c.id = "inventory-temp";
  Object.assign(c.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    background: "#111",
    padding: "12px",
    maxHeight: "75%",
    overflowY: "auto",
    maxWidth: "92%",
    zIndex: "3000",
    border: "1px solid #555",
    borderRadius: "6px",
    color: "#eee",
    textAlign: "center",
    lineHeight: "1.4"
  });

  let html = `<h3 style="margin-top:0;color:#0ff;">Inventory</h3>`;
  const filteredInv = game.inventory.filter(i => i !== "Notebook");

  if (filteredInv.length > 0) {
    html += `<p><strong>Held Items:</strong></p>`;
    filteredInv.forEach(i => {
      html += `
        <div style="margin-bottom:4px;">
          <button onclick="inspectItem('${i}')">Inspect: ${i}</button>
          <button onclick="dropItem('${i}');closeInventory()">Drop: ${i}</button>
          <button onclick="useItem('${i}');closeInventory()">Use: ${i}</button>
        </div>`;
    });
  } else {
    html += `<p style="opacity:0.7;">No items held.</p>`;
  }

  const roomInv = game.roomItems[game.playerRoom] || [];
  if (roomInv.length > 0) {
    html += `<p><strong>Items in this Room:</strong></p>`;
    roomInv.forEach(i => {
      html += `
        <div style="margin-bottom:4px;">
          <button onclick="pickItem('${i}');closeInventory()">Pick up: ${i}</button>
        </div>`;
    });
  }

  html += `<button style="margin-top:10px;" onclick="closeInventory()">Close</button>`;
  c.innerHTML = html;
  document.body.appendChild(c);

  window.closeInventory = function () {
    const t = document.getElementById("inventory-temp");
    if (t) document.body.removeChild(t);
    if (gameSettings.autosave) {
      localStorage.setItem("phasmaPhoneySave", JSON.stringify(game));
    }
  };
}

/***********************
 === INSPECT ITEM ===
************************/
export function inspectItem(i) {
  let desc = cursedItems[i]?.desc || "Standard investigation gear.";
  switch (i) {
    case "Crucifix": desc = "Placed to prevent hunts. 2 uses."; break;
    case "Camera": desc = "Handheld photo camera for evidence shots."; break;
    case "Video Camera": desc = "Handheld IR toggle for orb detection. Placeable for van monitor."; break;
    case "UV Light": desc = "Reveals fingerprints or footprints (salt needed)."; break;
    case "Salt": desc = "Sprinkle to reveal footprints with UV. Consumable."; break;
    case "Smudge Stick": desc = "Burn to calm the ghost. Consumable."; break;
    case "Candle": desc = "Prevents Onryo hunts while lit. Consumable."; break;
    case "Motion Sensor": desc = "Alerts you in van when ghost triggers it."; break;
  }
  logToGame(`Inspecting ${i}: ${desc}`);
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
    if (!game.vanStock.includes(i)) {
      game.vanStock.push(i);
      game.vanStock.sort();
    }
    logToGame(`Returned ${i} to van.`);
  } else {
    game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
    if (!game.roomItems[game.playerRoom].includes(i)) {
      game.roomItems[game.playerRoom].push(i);
    }
    logToGame(`Dropped ${i} here.`);
  }
  game.inventory = game.inventory.filter(x => x !== i);

  game.nearbyItems = [...(game.roomItems[game.playerRoom] || [])];
  renderHUD();
  updateHeldItemsNotebook();
  updateNearbyItemsNotebook();
  showNotebookUpdateBadge();
  if (gameSettings.autosave) {
    localStorage.setItem("phasmaPhoneySave", JSON.stringify(game));
  }
}

/***********************
 === PICK UP ITEM ===
************************/
export function pickItem(i) {
  if (i === "Notebook") {
    logToGame("You always carry the Notebook. It cannot be picked up.");
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
    game.roomItems[game.playerRoom].filter(x => x !== i);

  if (!game.inventory.includes(i)) {
    game.inventory.push(i);
    game.inventory.sort();
  }
  logToGame(`Picked up ${i}.`);

  game.nearbyItems = [...(game.roomItems[game.playerRoom] || [])];
  renderHUD();
  updateHeldItemsNotebook();
  updateNearbyItemsNotebook();
  showNotebookUpdateBadge();
  if (gameSettings.autosave) {
    localStorage.setItem("phasmaPhoneySave", JSON.stringify(game));
  }
}

/***********************
 === USE ITEM (CONSUMABLES + IR FIXED) ===
************************/
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
      } else {
        logToGame("You smudge, but nothing happens.");
      }
      game.inventory = game.inventory.filter(x => x !== i); // ✅ Consumed
      break;

    case "Camera":
      logToGame("This is a handheld photo camera. Use it to capture evidence shots.");
      break;

    case "Video Camera":
      // ✅ Handheld IR Toggle + Orb Detection
      if (!game.irActive) {
        game.irActive = true;
        logToGame("You turn on the IR on the video camera.");
        if (
          game.playerRoom === game.ghostRoom &&
          ghostProfiles[game.ghost]?.evidence.includes("Ghost Orbs")
        ) {
          logToGame("✨ You see faint ghost orbs floating in the air!");
        } else {
          logToGame("No ghost orbs detected.");
        }
      } else {
        game.irActive = false;
        logToGame("You turn off the IR on the video camera.");
      }
      break;

    case "Crucifix":
      if (game.playerRoom !== "Van") {
        game.placedCrucifix[game.playerRoom] = 2;
        logToGame("You place the crucifix. It may stop two hunts.");
        game.inventory = game.inventory.filter(x => x !== i); // ✅ Placed
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
          game.inventory = game.inventory.filter(x => x !== i); // ✅ Consumed
        }
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
          game.inventory = game.inventory.filter(x => x !== i); // ✅ Consumed
        }
      }
      break;

    case "Motion Sensor":
      if (game.playerRoom !== "Van") {
        game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
        if (!game.roomItems[game.playerRoom].includes("Motion Sensor")) {
          game.roomItems[game.playerRoom].push("Motion Sensor");
          logToGame("You place a motion sensor in this room.");
        }
      }
      break;

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
