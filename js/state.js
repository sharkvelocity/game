/*****************************************************
 * === PHASMA-PHONEY v2.9 — STATE.JS (FINAL PATCHED) ===
 * Full core state, constants, and utilities exported
 * for all modules. Includes gameSettings & cursedItems.
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

// === GHOST PROFILES (TRIMMED FOR DEMO; USE YOUR FULL LIST) ===
export const ghostProfiles = {
  Spirit: { evidence: ["EMF Reader", "Spirit Box", "Ghost Writing"], behavior: "Standard activity; calmer with smudge." },
  Wraith: { evidence: ["EMF Reader", "Spirit Box", "D.O.T.S Projector"], behavior: "Rarely touches ground; teleporting behavior." },
  TheMimic: { evidence: ["Spirit Box", "Fingerprints", "Freezing Temps"], behavior: "Mimics other ghosts; fake orbs appear on camera only." }
  // ✅ include all 25 ghosts in final
};

// === ROOM VISUALS (SAMPLE — extend fully) ===
export const roomVisuals = {
  Van: {
    N: "img/Van_N.png", S: "img/Van_S.png", E: "img/Van_E.png", W: "img/Van_W.png"
  },
  Foyer: {
    N: "img/Foyer_N.png", S: "img/Foyer_S.png", E: "img/Foyer_E.png", W: "img/Foyer_W.png"
  },
  LivingRoom: {
    N: "img/LivingRoom_N.png", S: "img/LivingRoom_S.png", E: "img/LivingRoom_E.png", W: "img/LivingRoom_W.png"
  }
};

// === CORE GAME STATE ===
export const game = {
  ghost: null,
  ghostRoom: null,
  playerRoom: "Van",
  playerDirection: "N",
  inventory: [],
  confirmedLoadout: [],
  vanStock: [...allLoadoutItems],
  selectedEvidence: new Set(),
  currentTurn: 0,
  sanity: 100,
  weather: null,
  mimicForm: null,
  nextMimicShift: 0,
  cameraActive: false,
  cameraPlacements: [],
  huntCooldown: 0,
  smudgeActive: 0,
  placedCrucifix: {},
  roomItems: {},
  usedCursedItems: {},
  nearbyItems: []
};

// === GAME SETTINGS (✅ EXPORT FIXED) ===
export const gameSettings = {
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
  game.confirmedLoadout = [];
  game.vanStock = [...allLoadoutItems];
  game.selectedEvidence.clear();
  game.currentTurn = 0;
  game.sanity = 100;
  game.weather = null;
  game.mimicForm = null;
  game.nextMimicShift = 0;
  game.cameraActive = false;
  game.cameraPlacements = [];
  game.huntCooldown = 0;
  game.smudgeActive = 0;
  game.placedCrucifix = {};
  game.roomItems = {};
  game.usedCursedItems = {};
  game.nearbyItems = [];
}
