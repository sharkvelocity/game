/*****************************************************
 * === PHASMA-PHONEY v2.9 — STATE MANAGEMENT ===
 * Handles core game data and shared constants.
 *****************************************************/

export const game = {
  ghost: null,
  ghostRoom: null,
  playerRoom: "Van",
  playerDirection: "N",
  inventory: [],
  vanStock: [],
  selectedEvidence: new Set(),
  currentTurn: 0,
  sanity: 100,
  weather: null,
  mimicForm: null,
  nextMimicShift: 0,
  cameraActive: false,
  huntCooldown: 0,
  smudgeActive: 0,
  placedCrucifix: {},
  roomItems: {},
  usedCursedItems: {}
};

export const allRooms = [
  "Van", "Foyer", "LivingRoom", "Kitchen",
  "DiningRoom", "Basement", "Bathroom",
  "Garage", "KidsBedroom", "MasterBedroom"
];

export const possibleWeather = ["Stormy", "Clear", "Foggy", "Blood Moon"];

export const allLoadoutItems = [
  "EMF Reader", "Spirit Box", "Camera", "UV Light", "D.O.T.S Projector",
  "Thermometer", "Ghost Writing Book", "Video Camera", "Crucifix",
  "Smudge Stick", "Salt", "Parabolic Microphone", "Motion Sensor",
  "Sound Sensor", "Candle"
];

export function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
