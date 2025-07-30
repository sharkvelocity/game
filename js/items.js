// === js/items.js ===

import { game } from './state.js';
import { applyYureiSmudge } from './ghostBehavior.js';
import {
  playCrucifixBurn,
  playSpiritBoxStatic,
  playDoorCreakRandom,
  playTarotFlip,
  playMusicBox,
  playWildDog
} from './audioManager.js';
import { advanceTurn } from './events.js';

// === ITEM USAGE ENTRYPOINT ===

export function useItem(itemName) {
  const inGhostRoom = game.currentRoom === game.ghostRoom;

  switch (itemName) {
    case "EMF Reader": return handleEMFReader(inGhostRoom);
    case "Spirit Box": return handleSpiritBox(inGhostRoom);
    case "Thermometer": return handleThermometer(inGhostRoom);
    case "Camera": return handleCamera(inGhostRoom);
    case "Smudge Stick": return handleSmudge(inGhostRoom);
    case "Crucifix": return handleCrucifix(inGhostRoom);
    case "Tarot Cards": return handleTarotCards();
    case "Music Box": return handleMusicBox(inGhostRoom);
    case "Ouija Board": return handleOuijaBoard();
    case "Voodoo Doll": return handleVoodooDoll(inGhostRoom);
    default:
      console.warn("Item not implemented:", itemName);
  }

  advanceTurn();
}

// === STANDARD TOOLS ===

function handleEMFReader(inGhostRoom) {
  if (inGhostRoom && hasEvidence("EMF 5")) {
    log("📶 EMF 5 spikes detected!");
  } else {
    log("📶 EMF levels are inconclusive.");
  }
}

function handleSpiritBox(inGhostRoom) {
  playSpiritBoxStatic();
  if (inGhostRoom && hasEvidence("Spirit Box")) {
    log("📻 A voice whispers through the Spirit Box...");
  } else {
    log("📻 Nothing but static.");
  }
}

function handleThermometer(inGhostRoom) {
  if (inGhostRoom && hasEvidence("Freezing Temps")) {
    log("❄️ Breath becomes visible — it's freezing in here.");
  } else {
    log("🌡️ Temperature is normal.");
  }
}

function handleCamera(inGhostRoom) {
  const ghost = game.ghost.name;
  if (ghost === "The Mimic" && inGhostRoom) {
    log("📸 Orbs detected through the camera — possibly a Mimic?");
  } else if (inGhostRoom && hasEvidence("Ghost Orb")) {
    log("📸 Ghost Orb spotted!");
  } else {
    log("📸 No ghostly activity captured.");
  }
}

function handleSmudge(inGhostRoom) {
  if (!game.inventory.includes("Smudge Stick")) {
    log("🔥 You need a Smudge Stick to perform that.");
    return;
  }

  if (inGhostRoom) {
    log("🌀 You light the Smudge Stick — the ghost is repelled.");
    if (game.ghost.name === "Yurei") {
      applyYureiSmudge();
    }
  } else {
    log("🌀 You burn the Smudge Stick, but nothing happens.");
  }

  game.inventory = game.inventory.filter(i => i !== "Smudge Stick");
}

function handleCrucifix(inGhostRoom) {
  if (inGhostRoom) {
    log("✝️ Crucifix placed. You feel a little safer.");
    playCrucifixBurn();
  } else {
    log("✝️ You place the crucifix down, but it's not the ghost's room.");
  }
}

// === CURSED ITEMS ===

function handleTarotCards() {
  playTarotFlip();
  const effects = [
    () => { game.sanity = Math.max(0, game.sanity - 25); log("🎴 The Fool: You feel your mind slip... (-25 Sanity)"); },
    () => { game.sanity = Math.min(100, game.sanity + 25); log("🎴 The Sun: Warmth fills your mind. (+25 Sanity)"); },
    () => { triggerGhostInteraction(); log("🎴 The Devil: Something stirs nearby..."); },
    () => { log("🎴 The Moon: You feel cold. Something is coming."); triggerHunt(); }
  ];
  const card = effects[Math.floor(Math.random() * effects.length)];
  card();
}

function handleMusicBox(inGhostRoom) {
  playMusicBox();
  if (inGhostRoom) {
    log("🎵 The ghost is lured by the music...");
    triggerHunt();
  } else {
    log("🎵 The box plays its eerie tune, but the air remains still.");
  }
}

function handleOuijaBoard() {
  game.sanity = Math.max(0, game.sanity - 15);
  log(`🔮 The planchette moves: "${game.ghostRoom.toUpperCase()}" (-15 Sanity)`);
}

function handleVoodooDoll(inGhostRoom) {
  if (Math.random() < 0.4) {
    log("🪆 The doll jerks violently! Ghost responds...");
    triggerGhostInteraction();
  } else {
    log("🪆 Nothing happens. Just a creepy little doll.");
  }
}

// === HOOKS ===

function triggerHunt() {
  // Delegate hunt logic to events.js
  const evt = new CustomEvent("forceHunt");
  window.dispatchEvent(evt);
}

function triggerGhostInteraction() {
  playDoorCreakRandom();
}

// === UTILITY ===

function hasEvidence(type) {
  return game.ghost.evidence.includes(type);
}

function log(msg) {
  const logBox = document.getElementById("game-log");
  if (logBox) {
    const line = document.createElement("div");
    line.textContent = msg;
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
  } else {
    console.log(msg);
  }
}
