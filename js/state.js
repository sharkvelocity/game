/*****************************************************
 * === PHASMA-PHONEY v2.9 — STATE.JS (FINAL) ===
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
export const ghostProfiles = {
  Spirit: { evidence: ["EMF Reader", "Spirit Box", "Ghost Writing"], behavior: "Standard activity; calmer with smudge." },
  Wraith: { evidence: ["EMF Reader", "Spirit Box", "D.O.T.S Projector"], behavior: "Rarely touches ground; teleporting behavior." },
  Phantom: { evidence: ["Spirit Box", "Fingerprints", "D.O.T.S Projector"], behavior: "Long visual contact drops sanity faster." },
  Poltergeist: { evidence: ["Spirit Box", "Fingerprints", "Ghost Writing"], behavior: "Throws multiple objects at once." },
  Banshee: { evidence: ["Fingerprints", "Orbs", "D.O.T.S Projector"], behavior: "Focuses on one target." },
  Jinn: { evidence: ["EMF Reader", "Fingerprints", "Freezing Temps"], behavior: "Moves quickly when power is on." },
  Mare: { evidence: ["Spirit Box", "Ghost Writing", "Orbs"], behavior: "Prefers darkness; active in dark rooms." },
  Revenant: { evidence: ["Ghost Writing", "Orbs", "Freezing Temps"], behavior: "Very fast during hunts if target seen." },
  Shade: { evidence: ["EMF Reader", "Ghost Writing", "Freezing Temps"], behavior: "Shy; less active with multiple people." },
  Demon: { evidence: ["Fingerprints", "Ghost Writing", "Freezing Temps"], behavior: "Aggressive; hunts more often." },
  Yurei: { evidence: ["Orbs", "Freezing Temps", "D.O.T.S Projector"], behavior: "Strong sanity drain; trapped by smudge." },
  Oni: { evidence: ["EMF Reader", "Freezing Temps", "D.O.T.S Projector"], behavior: "Very active when visible." },
  Yokai: { evidence: ["Spirit Box", "Orbs", "D.O.T.S Projector"], behavior: "Talkative; attracted to voices." },
  Hantu: { evidence: ["Fingerprints", "Orbs", "Freezing Temps"], behavior: "Faster in cold rooms." },
  Goryo: { evidence: ["EMF Reader", "Fingerprints", "D.O.T.S Projector"], behavior: "Seen only through camera; rarely changes rooms." },
  Myling: { evidence: ["EMF Reader", "Fingerprints", "Ghost Writing"], behavior: "Quieter footsteps; active on sound equipment." },
  Onryo: { evidence: ["Spirit Box", "Orbs", "Freezing Temps"], behavior: "Hunts after extinguishing flames; avoids lit candles." },
  TheTwins: { evidence: ["EMF Reader", "Spirit Box", "Freezing Temps"], behavior: "Alternates activity between rooms." },
  Raiju: { evidence: ["EMF Reader", "Orbs", "D.O.T.S Projector"], behavior: "Faster near electronic equipment." },
  Obake: { evidence: ["EMF Reader", "Fingerprints", "Orbs"], behavior: "Rare ghostly fingerprint changes." },
  TheMimic: { evidence: ["Spirit Box", "Fingerprints", "Freezing Temps"], behavior: "Mimics other ghosts; fake orbs appear on camera only." },
  Moroi: { evidence: ["Spirit Box", "Ghost Writing", "Freezing Temps"], behavior: "Curses sanity when responding on Spirit Box." },
  Deogen: { evidence: ["Spirit Box", "Ghost Writing", "D.O.T.S Projector"], behavior: "Always knows player’s location but very slow close." },
  Thaye: { evidence: ["Ghost Writing", "Orbs", "D.O.T.S Projector"], behavior: "Very active early, weaker over time." },
  Succubus: { evidence: ["Spirit Box", "Ghost Writing", "Fingerprints"], behavior: "Drains sanity faster if alone; active at night." }
};

// === ROOMS & VISUALS ===
export const roomVisuals = {
  Van: { N: "Van_N.png", S: "Van_S.png", E: "Van_E.png", W: "Van_W.png" },
  Foyer: { N: "Foyer_N.png", S: "Foyer_S.png", E: "Foyer_E.png", W: "Foyer_W.png" },
  LivingRoom: { N: "LivingRoom_N.png", S: "LivingRoom_S.png", E: "LivingRoom_E.png", W: "LivingRoom_W.png" },
  Kitchen: { N: "Kitchen_N.png", S: "Kitchen_S.png", E: "Kitchen_E.png", W: "Kitchen_W.png" },
  DiningRoom: { N: "DiningRoom_N.png", S: "DiningRoom_S.png", E: "DiningRoom_E.png", W: "DiningRoom_W.png" },
  Basement: { N: "Basement_N.png", S: "Basement_S.png", E: "Basement_E.png", W: "Basement_W.png" },
  Bathroom: { N: "Bathroom_N.png", S: "Bathroom_S.png", E: "Bathroom_E.png", W: "Bathroom_W.png" },
  Garage: { N: "Garage_N.png", S: "Garage_S.png", E: "Garage_E.png", W: "Garage_W.png" },
  KidsBedroom: { N: "KidsBedroom_N.png", S: "KidsBedroom_S.png", E: "KidsBedroom_E.png", W: "KidsBedroom_W.png" },
  MasterBedroom: { N: "MasterBedroom_N.png", S: "MasterBedroom_S.png", E: "MasterBedroom_E.png", W: "MasterBedroom_W.png" }
};

export const mapConnections = {
  Van: ["Foyer"],
  Foyer: ["Van", "LivingRoom", "Kitchen", "Bathroom"],
  LivingRoom: ["Foyer", "DiningRoom", "Garage", "KidsBedroom", "MasterBedroom"],
  Kitchen: ["Foyer", "DiningRoom", "Basement"],
  DiningRoom: ["Kitchen", "LivingRoom"],
  Basement: ["Kitchen"],
  Garage: ["LivingRoom"],
  Bathroom: ["Foyer"],
  KidsBedroom: ["LivingRoom"],
  MasterBedroom: ["LivingRoom"]
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
