/*****************************************************
 * === PHASMA-PHONEY v2.9 — GHOST BEHAVIOR MODULE ===
 * Contains ghost profiles, special behavior logic,
 * and The Mimic's mimicry system.
 *****************************************************/

import { game, randomFromArray } from "./state.js";
import { logToGame } from "./ui.js";

/* === GHOST PROFILES (25 Total, with Succubus) === */
export const ghostProfiles = {
  Spirit: {
    evidence: ["EMF Reader", "Spirit Box", "Ghost Writing"],
    behavior: "Standard activity; calmer with smudge."
  },
  Wraith: {
    evidence: ["EMF Reader", "Spirit Box", "D.O.T.S Projector"],
    behavior: "Rarely touches ground; teleporting behavior."
  },
  Phantom: {
    evidence: ["Spirit Box", "Fingerprints", "D.O.T.S Projector"],
    behavior: "Long visual contact drops sanity faster."
  },
  Poltergeist: {
    evidence: ["Spirit Box", "Fingerprints", "Ghost Writing"],
    behavior: "Throws multiple objects at once."
  },
  Banshee: {
    evidence: ["Fingerprints", "Orbs", "D.O.T.S Projector"],
    behavior: "Focuses on one target."
  },
  Jinn: {
    evidence: ["EMF Reader", "Fingerprints", "Freezing Temps"],
    behavior: "Moves quickly when power is on."
  },
  Mare: {
    evidence: ["Spirit Box", "Ghost Writing", "Orbs"],
    behavior: "Prefers darkness; active in dark rooms."
  },
  Revenant: {
    evidence: ["Ghost Writing", "Orbs", "Freezing Temps"],
    behavior: "Very fast during hunts if target seen."
  },
  Shade: {
    evidence: ["EMF Reader", "Ghost Writing", "Freezing Temps"],
    behavior: "Shy; less active with multiple people."
  },
  Demon: {
    evidence: ["Fingerprints", "Ghost Writing", "Freezing Temps"],
    behavior: "Aggressive; hunts more often."
  },
  Yurei: {
    evidence: ["Orbs", "Freezing Temps", "D.O.T.S Projector"],
    behavior: "Strong sanity drain; trapped by smudge."
  },
  Oni: {
    evidence: ["EMF Reader", "Freezing Temps", "D.O.T.S Projector"],
    behavior: "Very active when visible."
  },
  Yokai: {
    evidence: ["Spirit Box", "Orbs", "D.O.T.S Projector"],
    behavior: "Talkative; attracted to voices."
  },
  Hantu: {
    evidence: ["Fingerprints", "Orbs", "Freezing Temps"],
    behavior: "Faster in cold rooms."
  },
  Goryo: {
    evidence: ["EMF Reader", "Fingerprints", "D.O.T.S Projector"],
    behavior: "Seen only through camera; rarely changes rooms."
  },
  Myling: {
    evidence: ["EMF Reader", "Fingerprints", "Ghost Writing"],
    behavior: "Quieter footsteps; active on sound equipment."
  },
  Onryo: {
    evidence: ["Spirit Box", "Orbs", "Freezing Temps"],
    behavior: "Hunts after extinguishing flames; avoids lit candles."
  },
  TheTwins: {
    evidence: ["EMF Reader", "Spirit Box", "Freezing Temps"],
    behavior: "Alternates activity between rooms."
  },
  Raiju: {
    evidence: ["EMF Reader", "Orbs", "D.O.T.S Projector"],
    behavior: "Faster near electronic equipment."
  },
  Obake: {
    evidence: ["EMF Reader", "Fingerprints", "Orbs"],
    behavior: "Rare ghostly fingerprint changes."
  },
  TheMimic: {
    evidence: ["Spirit Box", "Fingerprints", "Freezing Temps"],
    behavior: "Mimics other ghosts; fake orbs appear on camera only."
  },
  Moroi: {
    evidence: ["Spirit Box", "Ghost Writing", "Freezing Temps"],
    behavior: "Curses sanity when responding on Spirit Box."
  },
  Deogen: {
    evidence: ["Spirit Box", "Ghost Writing", "D.O.T.S Projector"],
    behavior: "Always knows player’s location but very slow close."
  },
  Thaye: {
    evidence: ["Ghost Writing", "Orbs", "D.O.T.S Projector"],
    behavior: "Very active early, weaker over time."
  },
  Succubus: {
    evidence: ["Spirit Box", "Ghost Writing", "Fingerprints"],
    behavior: "Drains sanity faster if alone; active at night."
  }
};

/* === ASSIGN MIMIC FORM === */
export function assignMimicForm() {
  const candidates = Object.keys(ghostProfiles).filter(g => g !== "TheMimic");
  game.mimicForm = randomFromArray(candidates);
  game.nextMimicShift = game.currentTurn + 3 + Math.floor(Math.random() * 4);
  logToGame(`The Mimic now imitates ${game.mimicForm}.`);
}

/* === GHOST BEHAVIOR LOGIC (Turn-Based Triggers) === */
export function triggerGhostBehavior() {
  const ghost = (game.ghost === "TheMimic" ? game.mimicForm : game.ghost);
  if (!ghost) return;

  switch (ghost) {
    case "Poltergeist":
      if (Math.random() < 0.3) {
        logToGame("📦 Objects clatter violently around you!");
      }
      break;

    case "Banshee":
      if (Math.random() < 0.2) {
        logToGame("🔊 A wailing cry echoes faintly in the distance...");
      }
      break;

    case "Mare":
      if (Math.random() < 0.2 && game.playerRoom !== "Van") {
        logToGame("💡 Lights flicker as darkness surrounds you.");
      }
      break;

    case "Succubus":
      if (Math.random() < 0.3 && game.playerRoom !== "Van") {
        logToGame("💋 You feel your energy draining as if something watches you...");
        game.sanity -= 2;
      }
      break;

    case "Onryo":
      if (game.roomItems[game.playerRoom]?.includes("Candle") && Math.random() < 0.4) {
        game.roomItems[game.playerRoom] =
          game.roomItems[game.playerRoom].filter(x => x !== "Candle");
        logToGame("🕯️ A candle suddenly extinguishes!");
      }
      break;
  }
}
