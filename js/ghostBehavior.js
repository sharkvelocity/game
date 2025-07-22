/*****************************************************
 * === PHASMA-PHONEY v2.6 — GHOST BEHAVIOR TREE ===
 * Handles per-turn ghost decisions (Hunt, Defense,
 * Evidence, Room Change, Ambient) using behavior tables.
 *****************************************************/

import { game, randomFromArray, randomInt, allRooms } from "./state.js";
import { logToGame, renderHUD } from "./ui.js";
import { triggerAmbientEvents, triggerEvidenceEvents, checkForHunt, updateSanity } from "./events.js";
import { playSound } from "./audioManager.js";

// === GHOST BEHAVIOR TABLE ===
export const ghostBehaviorTable = {
  "Spirit":        {hunt:30, defense:50, evidence:60, roomChange:30, ambient:50},
  "Wraith":        {hunt:50, defense:30, evidence:40, roomChange:60, ambient:20},
  "Phantom":       {hunt:20, defense:70, evidence:50, roomChange:40, ambient:70},
  "Poltergeist":   {hunt:25, defense:40, evidence:70, roomChange:50, ambient:80},
  "Banshee":       {hunt:60, defense:40, evidence:30, roomChange:30, ambient:40},
  "Jinn":          {hunt:45, defense:30, evidence:55, roomChange:30, ambient:30},
  "Mare":          {hunt:35, defense:50, evidence:65, roomChange:20, ambient:70},
  "Revenant":      {hunt:70, defense:20, evidence:30, roomChange:10, ambient:10},
  "Shade":         {hunt:15, defense:80, evidence:70, roomChange:10, ambient:85},
  "Demon":         {hunt:80, defense:10, evidence:25, roomChange:30, ambient:20},
  "Yurei":         {hunt:40, defense:70, evidence:60, roomChange:20, ambient:50},
  "Oni":           {hunt:55, defense:30, evidence:50, roomChange:40, ambient:50},
  "Hantu":         {hunt:40, defense:30, evidence:80, roomChange:50, ambient:40},
  "Goryo":         {hunt:30, defense:30, evidence:70, roomChange:0,  ambient:50},
  "Myling":        {hunt:45, defense:40, evidence:70, roomChange:20, ambient:60},
  "Onryo":         {hunt:35, defense:40, evidence:60, roomChange:30, ambient:50},
  "The Twins":     {hunt:45, defense:30, evidence:50, roomChange:70, ambient:40},
  "Raiju":         {hunt:50, defense:20, evidence:75, roomChange:30, ambient:30},
  "Obake":         {hunt:40, defense:30, evidence:65, roomChange:20, ambient:50},
  "The Mimic":     {hunt:0,  defense:0,  evidence:0,  roomChange:0,  ambient:0}, // dynamic
  "Moroi":         {hunt:55, defense:30, evidence:60, roomChange:30, ambient:40},
  "Deogen":        {hunt:60, defense:30, evidence:40, roomChange:10, ambient:30},
  "Thaye":         {hunt:30, defense:40, evidence:70, roomChange:50, ambient:70}, // decays
  "Succubus":      {hunt:70, defense:20, evidence:40, roomChange:30, ambient:80}
};

// === ADVANCE TURN ===
export function advanceTurn() {
  game.currentTurn++;
  updateSanity();
  renderHUD();

  // Handle dynamic personalities before BT tick
  if (game.ghost === "The Mimic") handleMimicBehavior();
  if (game.ghost === "Thaye") decayThayeBehavior();

  // Tick BT Actions
  ghostTakeTurn(game.ghost);

  // Check for hunt after ghost action
  checkForHunt();
}

// === GHOST TURN DECISION TREE ===
export function ghostTakeTurn(ghostType) {
  const table = (ghostType === "The Mimic")
    ? ghostBehaviorTable[game.mimicForm]
    : ghostBehaviorTable[ghostType];

  // Priority order: Hunt > Defense > Evidence > RoomChange > Ambient
  if (roll(table.hunt)) {
    logToGame("The ghost grows aggressive...");
  }
  else if (roll(table.defense)) {
    // Defensive reactions are passive; handled in events during hunts
  }
  else if (roll(table.evidence)) {
    triggerEvidenceEvents();
  }
  else if (roll(table.roomChange)) {
    changeGhostRoom(ghostType);
  }
  else if (roll(table.ambient)) {
    triggerAmbientEvents();
  }
}

// === GHOST ROOM CHANGE ===
function changeGhostRoom(ghostType) {
  if (ghostType === "Goryo") return; // never moves
  if (ghostType === "Yurei" && game.smudgeActive > 0) return; // locked by smudge

  const rooms = allRooms.filter(r => r !== "Van");
  const newRoom = randomFromArray(rooms);
  if (newRoom === game.ghostRoom) return;

  game.ghostRoom = newRoom;
  playSound("ghost", "creaks");
  logToGame(`You sense the ghost's presence shift to the ${newRoom}.`);
}

// === MIMIC BEHAVIOR ===
function handleMimicBehavior() {
  if (!game.mimicForm || game.nextMimicShift <= 0) {
    const possible = Object.keys(ghostBehaviorTable).filter(g => g !== "The Mimic");
    game.mimicForm = randomFromArray(possible);
    game.nextMimicShift = randomInt(3, 6);
    logToGame(`The Mimic imitates ${game.mimicForm} behavior.`);
  }
  game.nextMimicShift--;
}

// === THAYE AGING ===
function decayThayeBehavior() {
  let t = ghostBehaviorTable["Thaye"];
  t.hunt = Math.max(10, t.hunt - 1);
  t.evidence = Math.max(30, t.evidence - 1);
  t.ambient = Math.min(90, t.ambient + 1);
}

// === UTILITY ===
function roll(percent) {
  return Math.random() * 100 < percent;
}
