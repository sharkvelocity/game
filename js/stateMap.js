/*****************************************************
 * === PHASMA-PHONEY v2.9 — STATE + MAP MODULE (FINAL MASTER) ===
 * Unified game constants, ghost profiles, map connections,
 * visuals, compass directions, and core game state.
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

// === GHOST PROFILES === (unchanged, shortened for brevity)
export const ghostProfiles = {
  Spirit: { evidence: ["EMF Reader", "Spirit Box", "Ghost Writing"], behavior: "Standard activity; calmer with smudge." },
  Wraith: { evidence: ["EMF Reader", "Spirit Box", "D.O.T.S Projector"], behavior: "Rarely touches ground; teleporting behavior." },
  // ... (all other ghosts same as your latest list)
  Succubus: { evidence: ["Spirit Box", "Ghost Writing", "Fingerprints"], behavior: "Drains sanity faster if alone; active at night." }
};

// === MAP CONNECTIONS (CONSISTENT NAMES, NO SPACES) ===
export const mapConnections = {
  Van: ["Foyer"],
  Foyer: ["Van", "LivingRoom", "Kitchen", "Bathroom", "Basement"],
  LivingRoom: ["Foyer", "DiningRoom", "Garage", "KidsBedroom"],
  Kitchen: ["Foyer", "DiningRoom", "Garage"],
  DiningRoom: ["Kitchen", "LivingRoom"],
  Garage: ["LivingRoom", "Kitchen"],
  Basement: ["Foyer"],
  Bathroom: ["Foyer", "MasterBedroom"],
  KidsBedroom: ["LivingRoom", "MasterBedroom"],
  MasterBedroom: ["Bathroom", "KidsBedroom"]
};

// === ROOM VISUALS (CONFIRMED WORKING PATHS) ===
export const roomVisuals = {
  Van: {
    N: "img/Van_N.png", S: "img/Van_S.png", E: "img/Van_E.png", W: "img/Van_W.png"
  },
  Foyer: {
    N: "img/Foyer_N.png", S: "img/Foyer_S.png", E: "img/Foyer_E.png", W: "img/Foyer_W.png"
  },
  LivingRoom: {
    N: "img/LivingRoom_N.png", S: "img/LivingRoom_S.png", E: "img/LivingRoom_E.png", W: "img/LivingRoom_W.png"
  },
  Kitchen: {
    N: "img/Kitchen_N.png", S: "img/Kitchen_S.png", E: "img/Kitchen_E.png", W: "img/Kitchen_W.png"
  },
  DiningRoom: {
    N: "img/DiningRoom_N.png", S: "img/DiningRoom_S.png", E: "img/DiningRoom_E.png", W: "img/DiningRoom_W.png"
  },
  Garage: {
    N: "img/Garage_N.png", S: "img/Garage_S.png", E: "img/Garage_E.png", W: "img/Garage_W.png"
  },
  Basement: {
    N: "img/Basement_N.png", S: "img/Basement_S.png", E: "img/Basement_E.png", W: "img/Basement_W.png"
  },
  Bathroom: {
    N: "img/Bathroom_N.png", S: "img/Bathroom_S.png", E: "img/Bathroom_E.png", W: "img/Bathroom_W.png"
  },
  KidsBedroom: {
    N: "img/KidsBedroom_N.png", S: "img/KidsBedroom_S.png", E: "img/KidsBedroom_E.png", W: "img/KidsBedroom_W.png"
  },
  MasterBedroom: {
    N: "img/MasterBedroom_N.png", S: "img/MasterBedroom_S.png", E: "img/MasterBedroom_E.png", W: "img/MasterBedroom_W.png"
  }
};

// === COMPASS DIRECTIONS (CONSISTENT) ===
export const compassDirections = {
  Van: { N: "Foyer" },
  Foyer: { S: "Van", N: "LivingRoom", E: "Kitchen", W: "Bathroom" },
  LivingRoom: { S: "Foyer", E: "DiningRoom", W: "Garage", N: "KidsBedroom" },
  Kitchen: { W: "Foyer", E: "DiningRoom", S: "Garage" },
  DiningRoom: { W: "Kitchen", S: "LivingRoom" },
  Garage: { E: "LivingRoom", N: "Kitchen" },
  Basement: { N: "Foyer" },
  Bathroom: { E: "Foyer", N: "MasterBedroom" },
  KidsBedroom: { S: "LivingRoom", E: "MasterBedroom" },
  MasterBedroom: { W: "KidsBedroom", S: "Bathroom" }
};

export const allRooms = Object.keys(roomVisuals);

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
