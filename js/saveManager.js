// === js/saveManager.js ===

import { game } from './state.js';

const saveKey = "phasmaPhoneySave";
export function clearSave() {
  localStorage.removeItem("phasmaphoneySave");
}

export function saveGame() {
  try {
    const data = {
      ghost: game.ghost,
      ghostRoom: game.ghostRoom,
      currentRoom: game.currentRoom,
      inventory: [...game.inventory],
      sanity: game.sanity,
      turn: game.turn,
      weather: game.weather
    };
    localStorage.setItem(saveKey, JSON.stringify(data));
    console.log("✅ Game saved.");
  } catch (e) {
    console.warn("❌ Failed to save game:", e);
  }
}

export function loadGame() {
  try {
    const data = JSON.parse(localStorage.getItem(saveKey));
    if (!data) {
      console.warn("⚠️ No save data found.");
      return;
    }

    game.ghost = data.ghost;
    game.ghostRoom = data.ghostRoom;
    game.currentRoom = data.currentRoom;
    game.inventory = data.inventory || [];
    game.sanity = data.sanity;
    game.turn = data.turn;
    game.weather = data.weather;

    console.log("✅ Game loaded.");
  } catch (e) {
    console.warn("❌ Failed to load game:", e);
  }
}
