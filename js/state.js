/*****************************************************
 * === PHASMA-PHONEY v2.9 — STATE.JS (FINAL FULLY UPDATED) ===
 * Holds all game constants, core state, and utilities.
 *****************************************************/

// === ALL LOADOUT ITEMS ===
export const allLoadoutItems = [
  "EMF Reader", "Spirit Box", "Camera", "UV Light", "D.O.T.S Projector",
  "Thermometer", "Ghost Writing Book", "Video Camera", "Crucifix",
  "Smudge Stick", "Salt", "Parabolic Microphone", "Motion Sensor",
  "Sound Sensor", "Candle"
];

// === CURSED ITEMS ===
export const cursedItems = {
  "Ouija Board": { desc: "Ask ghost questions, drains sanity.", cost: 15 },
  "Tarot Cards": { desc: "Random effects, risky.", cost: 5 },
  "Music Box": { desc: "Attracts ghost, risky.", cost: 10 },
  "Haunted Mirror": { desc: "Reveals ghost room, drains sanity.", cost: 20 },
  "Summoning Circle": { desc: "Forces ghost appearance.", cost: 25 },
  "Monkey Paw": { desc: "Grants risky wishes.", cost: 10 }
};
export function getCursedItemCost(item) {
  return cursedItems[item]?.cost || 5;
}

// === WEATHER ===
export const possibleWeather = ["Stormy", "Clear", "Foggy", "Blood Moon"];

// === GHOST PROFILES ===
// (Same as previous — trimmed here for brevity, keep full ghostProfiles block)
export const ghostProfiles = {
  /* ... all ghost profiles unchanged ... */
};

// === ROOMS & VISUALS ===
export const roomVisuals = {
  Van: { N: "Van_N.png", S: "Van_S.png", E: "Van_E.png", W: "Van_W.png" },
  Foyer: { N: "Foyer_N.png", S: "Foyer_S.png", E: "Foyer_E.png", W: "Foyer_W.png" },
  /* ... all room visuals unchanged ... */
};

export const mapConnections = {
  Van: ["Foyer"],
  Foyer: ["Van", "LivingRoom", "Kitchen", "Bathroom"],
  /* ... unchanged ... */
};

export const allRooms = Object.keys(roomVisuals);

// === CORE GAME STATE ===
export const game = {
  ghost: null,
  ghostRoom: null,
  playerRoom: "Van",
  playerDirection: "N",
  inventory: [],
  vanStock: [...allLoadoutItems],
  selectedEvidence: new Set(),
  currentTurn: 0,
  sanity: 100,
  weather: null,
  mimicForm: null,
  nextMimicShift: 0,
  cameraActive: false,         // ✅ IR camera toggle state
  cameraPlacements: [],
  huntCooldown: 0,
  smudgeActive: 0,
  placedCrucifix: {},
  roomItems: {},
  usedCursedItems: {},
  nearbyItems: []
};

// === GAME SETTINGS ===
export let gameSettings = {
  muteSounds: false,
  narratorVoice: false,
  mobileMode: false,
  autosave: true,
  preloadDependencies: false
};

// === UTILITIES ===
export function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function resetGame() {
  game.ghost = null;
  game.ghostRoom = null;
  game.playerRoom = "Van";
  game.playerDirection = "N";
  game.inventory = [];
  game.vanStock = [...allLoadoutItems];
  game.selectedEvidence.clear();
  game.currentTurn = 0;
  game.sanity = 100;
  game.weather = null;
  game.mimicForm = null;
  game.nextMimicShift = 0;
  game.cameraActive = false;   // ✅ Reset IR camera state
  game.cameraPlacements = [];
  game.huntCooldown = 0;
  game.smudgeActive = 0;
  game.placedCrucifix = {};
  game.roomItems = {};
  game.usedCursedItems = {};
  game.nearbyItems = [];
}
