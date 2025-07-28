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
  "Spirit": {
    evidence: ["EMF Reader", "Spirit Box", "Ghost Writing"],
    behavior: "Calm until provoked. Less aggressive when smudged."
  },
  "Wraith": {
    evidence: ["EMF Reader", "Spirit Box", "D.O.T.S Projector"],
    behavior: "Rarely touches ground. Cannot be tracked by footsteps."
  },
  "Phantom": {
    evidence: ["Spirit Box", "Fingerprints", "D.O.T.S Projector"],
    behavior: "Looking at it drops sanity faster. Disappears when photographed."
  },
  "Poltergeist": {
    evidence: ["Spirit Box", "Fingerprints", "Ghost Writing"],
    behavior: "Throws many objects at once. Very noisy."
  },
  "Banshee": {
    evidence: ["Fingerprints", "D.O.T.S Projector", "Ghost Orb"],
    behavior: "Focuses on one target. Fears Crucifix more than others."
  },
  "Jinn": {
    evidence: ["EMF Reader", "Fingerprints", "Freezing Temps"],
    behavior: "Moves fast if power is on. Turns off power to attack."
  },
  "Mare": {
    evidence: ["Spirit Box", "Ghost Orb", "Ghost Writing"],
    behavior: "Stronger in darkness. Turns lights off frequently."
  },
  "Revenant": {
    evidence: ["Ghost Orb", "Ghost Writing", "Freezing Temps"],
    behavior: "Very fast when hunting if you're not hidden."
  },
  "Shade": {
    evidence: ["EMF Reader", "Ghost Writing", "Freezing Temps"],
    behavior: "Shy and quiet. Less active with people around."
  },
  "Demon": {
    evidence: ["Fingerprints", "Ghost Writing", "Freezing Temps"],
    behavior: "Aggressive. Hunts early and often. Crucifix is more effective."
  },
  "Yurei": {
    evidence: ["D.O.T.S Projector", "Ghost Orb", "Freezing Temps"],
    behavior: "Drains sanity quickly. Smudge keeps it in place for 5 turns."
  },
  "Oni": {
    evidence: ["EMF Reader", "Freezing Temps", "D.O.T.S Projector"],
    behavior: "More active when players are nearby. Throws objects far."
  },
  "Hantu": {
    evidence: ["Ghost Orb", "Fingerprints", "Freezing Temps"],
    behavior: "Moves faster in cold rooms. No breath visible in warmer rooms."
  },
  "Goryo": {
    evidence: ["EMF Reader", "Fingerprints", "D.O.T.S Projector"],
    behavior: "Only shows on D.O.T.S through camera. Stays in ghost room."
  },
  "Myling": {
    evidence: ["EMF Reader", "Fingerprints", "Ghost Writing"],
    behavior: "Quieter when hunting. Produces more paranormal sounds."
  },
  "Onryo": {
    evidence: ["Spirit Box", "Ghost Orb", "Freezing Temps"],
    behavior: "Extinguishing flames can trigger hunts. Fears fire."
  },
  "The Twins": {
    evidence: ["EMF Reader", "Spirit Box", "Freezing Temps"],
    behavior: "Two entities. One may interact while the other is idle."
  },
  "Raiju": {
    evidence: ["EMF Reader", "Ghost Orb", "D.O.T.S Projector"],
    behavior: "Faster near electronics. Disrupts equipment during hunts."
  },
  "Obake": {
    evidence: ["EMF Reader", "Fingerprints", "Ghost Orb"],
    behavior: "Rarely leaves fingerprints. Can shapeshift while hunting."
  },
  "The Mimic": {
    evidence: ["Spirit Box", "Fingerprints", "Freezing Temps"],
    behavior: "Mimics random ghost behavior every 3–6 turns. Fake orbs appear on camera only."
  },
  "Moroi": {
    evidence: ["Spirit Box", "Ghost Writing", "Freezing Temps"],
    behavior: "Curses victims to lose sanity faster. Slower when smudged."
  },
  "Deogen": {
    evidence: ["Spirit Box", "Ghost Writing", "D.O.T.S Projector"],
    behavior: "Always knows your location. Very slow when near player."
  },
  "Thaye": {
    evidence: ["Ghost Orb", "Ghost Writing", "D.O.T.S Projector"],
    behavior: "Starts strong but weakens over time as investigation continues."
  },
  "Yokai": {
    evidence: ["Spirit Box", "Ghost Orb", "D.O.T.S Projector"],
    behavior: "Only hunts those nearby. Less active if players are quiet."
  },
  "Succubus": {
    evidence: ["Ghost Orb", "Fingerprints", "Spirit Box"],
    behavior: "Prefers luring with voice. May whisper or sing. Becomes violent if ignored."
  }
};


// === ROOM VISUALS (SAMPLE — extend fully) ===
export const roomVisuals = {
  Van:        { N: "img/Van_N.png" },
  Foyer:      { N: "img/Foyer_N.png" },
  LivingRoom: { N: "img/LivingRoom_N.png" },
  Kitchen:    { N: "img/Kitchen_N.png" },
  DiningRoom: { N: "img/DiningRoom_N.png" },
  Basement:   { N: "img/Basement_N.png" },
  Garage:     { N: "img/Garage_N.png" },
  Bathroom:   { N: "img/Bathroom_N.png" },
  MasterBedroom: { N: "img/MasterBedroom_N.png" },
  KidsRoom:   { N: "img/KidsRoom_N.png" },
  Utility:    { N: "img/Utility_N.png" },
  Office:     { N: "img/Office_N.png" }
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
export const allRooms = Object.keys(roomVisuals);

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
