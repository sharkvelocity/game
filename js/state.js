// === js/state.js ===

export const game = {
  ghost: null,
  ghostRoom: null,
  currentRoom: "van",
  inventory: [],
  sanity: 100,
  turn: 0,
  monitorBooted: false,
  weather: null
};

export const allRooms = [
  "bathroom", "bedroom", "diningRoom", "foyer", "garage", "hallway",
  "kidsRoom", "kitchen", "livingRoom", "masterBedroom", "storage", "utility", "basement"
];

export const allDirections = ["N", "S", "E", "W"];

export const ghostProfiles = [
  { name: "Spirit", evidence: ["EMF 5", "Spirit Box", "Ghost Writing"] },
  { name: "Wraith", evidence: ["EMF 5", "Spirit Box", "D.O.T.S Projector"] },
  { name: "Phantom", evidence: ["Spirit Box", "Fingerprints", "D.O.T.S Projector"] },
  { name: "Poltergeist", evidence: ["Spirit Box", "Fingerprints", "Ghost Writing"] },
  { name: "Banshee", evidence: ["Fingerprints", "Ghost Orb", "D.O.T.S Projector"] },
  { name: "Jinn", evidence: ["EMF 5", "Fingerprints", "Freezing Temps"] },
  { name: "Mare", evidence: ["Spirit Box", "Ghost Orb", "Ghost Writing"] },
  { name: "Revenant", evidence: ["Ghost Orb", "Ghost Writing", "Freezing Temps"] },
  { name: "Shade", evidence: ["EMF 5", "Ghost Writing", "Freezing Temps"] },
  { name: "Demon", evidence: ["Fingerprints", "Ghost Writing", "Freezing Temps"] },
  { name: "Yurei", evidence: ["Ghost Orb", "Freezing Temps", "D.O.T.S Projector"] },
  { name: "Oni", evidence: ["EMF 5", "Freezing Temps", "D.O.T.S Projector"] },
  { name: "Yokai", evidence: ["Spirit Box", "Ghost Orb", "D.O.T.S Projector"] },
  { name: "Hantu", evidence: ["Fingerprints", "Ghost Orb", "Freezing Temps"] },
  { name: "Goryo", evidence: ["EMF 5", "Fingerprints", "D.O.T.S Projector"] },
  { name: "Myling", evidence: ["EMF 5", "Fingerprints", "Ghost Writing"] },
  { name: "Onryo", evidence: ["Spirit Box", "Ghost Orb", "Freezing Temps"] },
  { name: "The Twins", evidence: ["EMF 5", "Spirit Box", "Freezing Temps"] },
  { name: "Raiju", evidence: ["EMF 5", "Ghost Orb", "D.O.T.S Projector"] },
  { name: "Obake", evidence: ["EMF 5", "Fingerprints", "Ghost Orb"] },
  { name: "The Mimic", evidence: ["Spirit Box", "Fingerprints", "Freezing Temps"] }, // Fake Orbs
  { name: "Moroi", evidence: ["Spirit Box", "Ghost Writing", "Freezing Temps"] },
  { name: "Deogen", evidence: ["Spirit Box", "Ghost Writing", "D.O.T.S Projector"] },
  { name: "Thaye", evidence: ["Ghost Orb", "Ghost Writing", "D.O.T.S Projector"] },
  { name: "Succubus", evidence: ["Spirit Box", "Ghost Orb", "Ghost Writing"] }
];

export const gameSettings = {
  difficulty: "normal",
  allowHints: true,
  enableVoice: true,
  showAmbientNarration: true
};

export function initGame() {
  assignRandomGhost();
  assignGhostRoom();
  game.currentRoom = "van";
  game.inventory = ["EMF Reader", "Camera", "Spirit Box"];
  game.sanity = 100;
  game.turn = 0;
  game.monitorBooted = false;
  game.weather = randomFromArray(["clear", "rain", "fog"]);
}

export function assignRandomGhost() {
  const choice = randomFromArray(ghostProfiles);
  game.ghost = choice;
}

export function assignGhostRoom() {
  const room = randomFromArray(allRooms);
  game.ghostRoom = room;
}

export function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function resetGame() {
  game.ghost = null;
  game.ghostRoom = null;
  game.currentRoom = "van";
  game.inventory = [];
  game.sanity = 100;
  game.turn = 0;
  game.monitorBooted = false;
  game.weather = null;
}
