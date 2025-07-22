/*****************************************************
 * === PHASMA-PHONEY v2.6 — ITEM & CURSED ITEM LOGIC ===
 * Handles item use, van swaps, and cursed item effects.
 *****************************************************/

import { game, cursedItemSanityCost } from "./state.js";
import { logToGame, renderHUD } from "./ui.js";
import { advanceTurn } from "./ghostBehavior.js";

// === USE AN ITEM ===
export function useItem(item) {
  if (!game.inventory.includes(item)) {
    logToGame(`You are not holding a ${item}.`);
    return;
  }

  switch (item) {
    case "EMF Reader":
      logToGame("You hold up the EMF reader, watching for spikes...");
      break;
    case "Spirit Box":
      logToGame("You ask questions into the Spirit Box...");
      break;
    case "Thermometer":
      logToGame("You point the thermometer around the room...");
      break;
    case "Ghost Writing Book":
      logToGame("You place the book and wait for writing...");
      placeItem(item);
      break;
    case "Camera":
    case "Video Camera":
      logToGame("You scan with the camera for orbs...");
      break;
    case "Crucifix":
      logToGame("You place the crucifix on the floor...");
      placeItem(item, true);
      break;
    case "Smudge Stick":
      if (game.smudgeActive > 0) {
        logToGame("The smudge stick is already burning.");
        return;
      }
      game.smudgeActive = 3; // Ghost disabled for 3 turns
      game.inventory = game.inventory.filter(i => i !== "Smudge Stick");
      logToGame("You light and burn the smudge stick. The air feels calmer.");
      break;
    default:
      logToGame("You inspect the " + item + ".");
  }

  renderHUD();
  advanceTurn();
}

// === PLACE ITEM IN ROOM ===
export function placeItem(item, permanent = false) {
  if (!game.roomItems[game.playerRoom]) game.roomItems[game.playerRoom] = [];
  game.roomItems[game.playerRoom].push(item);

  if (!permanent) {
    game.inventory = game.inventory.filter(i => i !== item);
    logToGame(`${item} placed in ${game.playerRoom}.`);
  }
  renderHUD();
}

// === CURSED ITEM USE ===
export function useCursedItem(item) {
  if (!game.usedCursedItems) game.usedCursedItems = {};
  if (game.usedCursedItems[item]) {
    logToGame(`The ${item} has already been used.`);
    return;
  }

  const sanityCost = cursedItemSanityCost[item] || 5;
  game.sanity = Math.max(0, game.sanity - sanityCost);
  game.usedCursedItems[item] = true;

  logToGame(`You use the ${item}. Sanity drops by ${sanityCost}%.`);

  switch (item) {
    case "Ouija Board":
      logToGame("The planchette moves... the ghost answers eerily.");
      break;
    case "Tarot Cards":
      logToGame("You draw a card. Fate twists around you.");
      break;
    case "Music Box":
      logToGame("A haunting melody fills the room...");
      break;
    case "Voodoo Doll":
      logToGame("You poke the doll; something stirs angrily.");
      break;
    case "Haunted Mirror":
      logToGame("The mirror shows a dark room before cracking...");
      break;
    case "Summoning Circle":
      logToGame("You light the candles... the ghost materializes.");
      game.huntCooldown = 0; // Instant hunt possible next turn
      break;
    case "Monkey Paw":
      logToGame("You whisper your wish... and the ghost grows restless.");
      break;
  }

  renderHUD();
  advanceTurn();
}

// === VAN INVENTORY SWAP ===
export function openVanInventory() {
  const overlay = document.getElementById("van-inventory-overlay");
  const held = document.getElementById("van-held-items");
  const van = document.getElementById("van-stock-items");

  held.innerHTML = "";
  van.innerHTML = "";

  // Held Items
  game.inventory.forEach(item => {
    if (["Notebook", "Lighter"].includes(item)) return;
    const b = document.createElement("button");
    b.textContent = item + " (Drop)";
    b.onclick = () => {
      if (!game.vanStock.includes(item)) game.vanStock.push(item);
      game.inventory = game.inventory.filter(i => i !== item);
      openVanInventory();
    };
    held.appendChild(b);
  });

  // Van Stock
  game.vanStock.forEach(item => {
    const b = document.createElement("button");
    b.textContent = item + " (Take)";
    b.onclick = () => {
      if (game.inventory.length < 5) {
        game.inventory.push(item);
        game.vanStock = game.vanStock.filter(i => i !== item);
        openVanInventory();
      } else alert("You cannot hold more items!");
    };
    van.appendChild(b);
  });

  overlay.style.display = "flex";
}

export function closeVanInventory() {
  document.getElementById("van-inventory-overlay").style.display = "none";
  renderHUD();
}
