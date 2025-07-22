/*****************************************************
 * === PHASMA-PHONEY v2.6 — STATE & CONSTANTS ===
 * Defines global game state and utility functions.
 *****************************************************/

// === GAME CONSTANTS ===
export const investigationItems = [
  "EMF Reader", "Spirit Box", "Camera", "UV Light", "D.O.T.S Projector",
  "Thermometer", "Ghost Writing Book", "Video Camera", "Crucifix",
  "Smudge Stick", "Salt", "Parabolic Microphone", "Motion Sensor", "Sound Sensor"
];

export const cursedItems = [
  "Ouija Board", "Tarot Cards", "Music Box",
  "Voodoo Doll", "Haunted Mirror", "Summoning Circle", "Monkey Paw"
];

export const possibleWeather = ["Stormy", "Rain", "Clear", "Foggy"];

// === GLOBAL GAME STATE OBJECT ===
export const game = {
  ghost: null,
  ghostRoom: null,
  playerRoom: "Van",
  inventory: [],
  vanStock: [...investigationItems],
  roomItems: {},
  selectedEvidence: new Set(),
  currentTurn: 0,
  sanity: 100,
  mimicForm: null,
  nextMimicShift: 0,
  huntCooldown: 0,
  smudgeActive: 0,
  weather: null,
  cameraActive: false,
  placedCrucifix: {},
  monitorBooted: false,
  placedCameras: {},
  usedCursedItems: {},
  titleShown: false
};

// === ROOM VISUALS (Directional Images) ===
export const roomVisuals = {
  Van: {N:"Van_N.png",S:"Van_S.png",E:"Van_E.png",W:"Van_W.png"},
  Foyer:{N:"Foyer_N.png",S:"Foyer_S.png",E:"Foyer_E.png",W:"Foyer_W.png"},
  "Living Room":{N:"LivingRoom_N.png",S:"LivingRoom_S.png",E:"LivingRoom_E.png",W:"LivingRoom_W.png"},
  Kitchen:{N:"Kitchen_N.png",S:"Kitchen_S.png",E:"Kitchen_E.png",W:"Kitchen_W.png"},
  "Dining Room":{N:"DiningRoom_N.png",S:"DiningRoom_S.png",E:"DiningRoom_E.png",W:"DiningRoom_W.png"},
  Garage:{N:"Garage_N.png",S:"Garage_S.png",E:"Garage_E.png",W:"Garage_W.png"},
  Basement:{N:"Basement_N.png",S:"Basement_S.png",E:"Basement_S.png",W:"Basement_W.png"},
  Bathroom:{N:"Bathroom_N.png",S:"Bathroom_S.png",E:"Bathroom_E.png",W:"Bathroom_W.png"},
  "Kids Bedroom":{N:"KidsBedroom_N.png",S:"KidsBedroom_S.png",E:"KidsBedroom_E.png",W:"KidsBedroom_W.png"},
  "Master Bedroom":{N:"MasterBedroom_N.png",S:"MasterBedroom_S.png",E:"MasterBedroom_E.png",W:"MasterBedroom_W.png"}
};

export const mapConnections = {
  Van:["Foyer"],
  Foyer:["Van","Living Room","Kitchen","Bathroom"],
  "Living Room":["Foyer","Dining Room","Garage","Kids Bedroom","Master Bedroom"],
  Kitchen:["Foyer","Dining Room"],
  "Dining Room":["Living Room","Kitchen","Basement"],
  Garage:["Living Room"],
  Basement:["Dining Room"],
  Bathroom:["Foyer"],
  "Kids Bedroom":["Living Room"],
  "Master Bedroom":["Living Room"]
};

export const allRooms = Object.keys(roomVisuals);

// === CURSED ITEM DATA ===
export const cursedItemDescriptions = {
  "Ouija Board":"A wooden spirit board; ask the ghost questions but risk sanity and hunts.",
  "Tarot Cards":"A mysterious deck; draw cards with unpredictable effects.",
  "Music Box":"A delicate haunted melody that draws the ghost closer.",
  "Voodoo Doll":"Poking it forces ghost interaction, draining sanity.",
  "Haunted Mirror":"Shows glimpses of the ghost room; staring too long cracks it.",
  "Summoning Circle":"Lighting it forces the ghost to appear; it will hunt after.",
  "Monkey Paw":"Granting twisted wishes; increases ghost aggression severely."
};

export const cursedItemSanityCost = {
  "Ouija Board": 10,
  "Tarot Cards": 5,
  "Music Box": 8,
  "Voodoo Doll": 6,
  "Haunted Mirror": 15,
  "Summoning Circle": 20,
  "Monkey Paw": 25
};

// === UTILITIES ===
export function randomFromArray(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Placeholder; real logToGame handled in ui.js but imported here for consistency
export function logToGame(text){
  console.warn("logToGame called before UI initialized:", text);
}
