/*****************************************************
 * === PHASMA-PHONEY v2.9 — STATE.JS (FINAL MASTER) ===
 *****************************************************/

// === LOADOUT ITEMS ===
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

// === GHOST PROFILES (25 ghosts) ===
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

// === ROOM VISUALS ===
export const roomVisuals = {
  Van: { N: "img/Van_N.png" },
  Foyer: { N: "img/Foyer_N.png" },
  LivingRoom: { N: "img/LivingRoom_N.png" },
  Kitchen: { N: "img/Kitchen_N.png" },
  DiningRoom: { N: "img/DiningRoom_N.png" },
  Basement: { N: "img/Basement_N.png" },
  Bathroom: { N: "img/Bathroom_N.png" },
  KidsBedroom: { N: "img/KidsBedroom_N.png" },
  MasterBedroom: { N: "img/MasterBedroom_N.png" },
  Garage: { N: "img/Garage_N.png" }
};

// === CORE GAME STATE ===
export const game = {
  ghost: null, ghostRoom: null,
  playerRoom: "Van", playerDirection: "N",
  inventory: [], confirmedLoadout: [], vanStock: [...allLoadoutItems],
  selectedEvidence: new Set(),
  currentTurn: 0, sanity: 100,
  weather: null, mimicForm: null, nextMimicShift: 0,
  cameraActive: false, cameraPlacements: [],
  huntCooldown: 0, smudgeActive: 0,
  placedCrucifix: {}, roomItems: {}, usedCursedItems: {},
  nearbyItems: []
};

export let gameSettings = {
  muteSounds: false, narratorVoice: false,
  mobileMode: false, autosave: true, preloadDependencies: false
};

// === UTILITIES ===
export function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function resetGame() {
  game.ghost = null; game.ghostRoom = null;
  game.playerRoom = "Van"; game.playerDirection = "N";
  game.inventory = []; game.confirmedLoadout = [];
  game.vanStock = [...allLoadoutItems];
  game.selectedEvidence.clear();
  game.currentTurn = 0; game.sanity = 100;
  game.weather = null; game.mimicForm = null;
  game.nextMimicShift = 0; game.cameraActive = false;
  game.cameraPlacements = []; game.huntCooldown = 0;
  game.smudgeActive = 0; game.placedCrucifix = {};
  game.roomItems = {}; game.usedCursedItems = {};
  game.nearbyItems = [];
}
