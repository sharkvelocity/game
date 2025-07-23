/*****************************************************
 * === PHASMA-PHONEY v2.9 — ITEMS.JS (FINAL) ===
 * Handles inventory management, item interactions,
 * and cursed item usage.
 *****************************************************/

import { game, allLoadoutItems, cursedItems, getCursedItemCost } from "./state.js";
import { logToGame, renderHUD } from "./ui.js";
import { checkTurnEvents, saveGame } from "./events.js";
import { startHunt } from "./events.js";

/* === OPEN INVENTORY OVERLAY === */
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
  if (game.inventory.length > 0) {
    html += `<p><strong>Held Items:</strong></p>`;
    game.inventory.forEach(i => {
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
    saveGame(true);
  };
}

/* === INSPECT ITEM === */
export function inspectItem(i) {
  let desc = cursedItems[i]?.desc || "Standard investigation gear.";
  switch (i) {
    case "Crucifix": desc = "Placed to prevent hunts. 2 uses."; break;
    case "Camera":
    case "Video Camera": desc = "Detects orbs via night vision."; break;
    case "UV Light": desc = "Reveals fingerprints or footprints (salt needed)."; break;
    case "Salt": desc = "Sprinkle to reveal footprints with UV."; break;
    case "Motion Sensor": desc = "Alerts you in van when ghost triggers it."; break;
    case "Candle": desc = "Prevents Onryo hunts while lit."; break;
  }
  logToGame(`Inspecting ${i}: ${desc}`);
}

/* === DROP ITEM === */
export function dropItem(i) {
  if (game.playerRoom === "Van") {
    if (!game.vanStock.includes(i)) {
      game.vanStock.push(i);
      game.vanStock.sort();
    }
    logToGame(`Returned ${i} to van.`);
  } else {
    game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
    if (!game.roomItems[game.playerRoom].includes(i))
      game.roomItems[game.playerRoom].push(i);
    logToGame(`Dropped ${i} here.`);
  }
  game.inventory = game.inventory.filter(x => x !== i);
  renderHUD();
  saveGame(true);
}

/* === PICK UP ITEM === */
export function pickItem(i) {
  if (game.inventory.length >= 3) {
    logToGame("Max 3 items.");
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
  renderHUD();
  saveGame(true);
}

/* === USE ITEM === */
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

    case "Camera":
    case "Video Camera":
      if (game.playerRoom !== "Van") {
        game.cameraActive = !game.cameraActive;
        logToGame(game.cameraActive
          ? "Camera on: watching for orbs."
          : "Camera off.");
      } else {
        logToGame("Cannot use cameras in the van.");
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

    case "Salt":
      if (game.playerRoom !== "Van") {
        game.roomItems[game.playerRoom] = game.roomItems[game.playerRoom] || [];
        if (!game.roomItems[game.playerRoom].includes("Salt")) {
          game.roomItems[game.playerRoom].push("Salt");
          logToGame("You sprinkle salt on the ground.");
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
  renderHUD();
  checkTurnEvents();
  saveGame(true);
}

/* === HANDLE CURSED ITEMS === */
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
  renderHUD();
  saveGame(true);
}

/* ✅ GLOBAL EXPOSURE FOR INLINE BUTTONS */
window.inspectItem = inspectItem;
window.dropItem = dropItem;
window.pickItem = pickItem;
window.useItem = useItem;