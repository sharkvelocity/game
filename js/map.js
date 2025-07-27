/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAP & MOVEMENT (FINAL MASTER) ===
 * Includes mapConnections, roomVisuals, and compass-based
 * movement logic synced with HUD & background visuals.
 *****************************************************/
import { game } from "./state.js";
import { logToGame, renderHUD, updateBackground } from "./ui.js";
import { checkTurnEvents } from "./events.js";

/***********************
 === MAP CONNECTIONS ===
************************/
export const mapConnections = {
  Van: ["Foyer"],
  Foyer: ["Van", "Living Room", "Kitchen", "Bathroom", "Basement"],
  Living Room: ["Foyer", "Dining Room", "Garage", "Kids Bedroom"],
  Kitchen: ["Foyer", "Dining Room", "Garage"],
  Dining Room: ["Kitchen", "Living Room"],
  Garage: ["Living Room", "Kitchen"],
  Basement: ["Foyer"],
  Bathroom: ["Foyer", "Master Bedroom"],
  Kids Bedroom: ["Living Room", "Master Bedroom"],
  Master Bedroom: ["Bathroom", "Kids Bedroom"]
};

/***********************
 === ROOM VISUALS ===
************************/
export const roomVisuals = {
  Van: {
    N: "img/Van_N.png", S: "img/Van_S.png", E: "img/Van_E.png", W: "img/Van_W.png"
  },
  Foyer: {
    N: "img/Foyer_N.png", S: "img/Foyer_S.png", E: "img/Foyer_E.png", W: "img/Foyer_W.png"
  },
  Living Room: {
    N: "img/LivingRoom_N.png", S: "img/LivingRoom_S.png", E: "img/LivingRoom_E.png", W: "img/LivingRoom_W.png"
  },
  Kitchen: {
    N: "img/Kitchen_N.png", S: "img/Kitchen_S.png", E: "img/Kitchen_E.png", W: "img/Kitchen_W.png"
  },
  Dining Room: {
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
  Kids Bedroom: {
    N: "img/KidsBedroom_N.png", S: "img/KidsBedroom_S.png", E: "img/KidsBedroom_E.png", W: "img/KidsBedroom_W.png"
  },
  Master Bedroom: {
    N: "img/MasterBedroom_N.png", S: "img/MasterBedroom_S.png", E: "img/MasterBedroom_E.png", W: "img/MasterBedroom_W.png"
  }
};

/***********************
 === COMPASS DIRECTIONS ===
************************/
export const compassDirections = {
  Van: { N: "Foyer" },
  Foyer: { S: "Van", N: "Living Room", E: "Kitchen", W: "Bathroom" },
  Living Room: { S: "Foyer", E: "Dining Room", W: "Garage", N: "Kids Bedroom" },
  Kitchen: { W: "Foyer", E: "Dining Room", S: "Garage" },
  Dining Room: { W: "Kitchen", S: "Living Room" },
  Garage: { E: "Living Room", N: "Kitchen" },
  Basement: { N: "Foyer" },
  Bathroom: { E: "Foyer", N: "Master Bedroom" },
  Kids Bedroom: { S: "Living Room", E: "Master Bedroom" },
  Master Bedroom: { W: "Kids Bedroom", S: "Bathroom" }
};

/***********************
 === MOVE TO ROOM ===
************************/
export function moveToRoom(room) {
  if (game.playerRoom === room) {
    logToGame(`You are already in ${room}.`);
    return;
  }

  const available = mapConnections[game.playerRoom] || [];
  if (!available.includes(room)) {
    logToGame(`You cannot move directly to ${room} from here.`);
    return;
  }

  game.playerRoom = room;
  game.currentTurn++;

  if (room === "Van") {
    logToGame("You return to the van to regroup.");
  } else {
    logToGame(`You move to ${room}.`);
  }

  renderHUD();
  updateBackground();
  updateCompassButtons();
  checkTurnEvents();
}

/***********************
 === UPDATE COMPASS BUTTONS (AUTO) ===
************************/
export function updateCompassButtons() {
  const buttons = {
    N: document.getElementById("move-north"),
    S: document.getElementById("move-south"),
    E: document.getElementById("move-east"),
    W: document.getElementById("move-west")
  };

  const paths = compassDirections[game.playerRoom] || {};

  for (const dir in buttons) {
    if (!buttons[dir]) continue;
    const targetRoom = paths[dir];
    if (targetRoom) {
      buttons[dir].disabled = false;
      buttons[dir].textContent = `${dir} → ${targetRoom}`;
      buttons[dir].onclick = () => moveToRoom(targetRoom);
    } else {
      buttons[dir].disabled = true;
      buttons[dir].textContent = `${dir} (No Path)`;
      buttons[dir].onclick = null;
    }
  }
}
