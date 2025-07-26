/*****************************************************
 * === PHASMA-PHONEY v2.9 — GHOST BEHAVIOR MODULE (FINAL FIXED) ===
 * Handles ghost-specific behaviors, mimic logic, and hunt patterns.
 * Exports ghostBehaviorTable for main game flow initialization.
 *****************************************************/
import { game, ghostProfiles } from "./state.js";
import { logToGame } from "./ui.js";
import { startHunt } from "./events.js";

/***********************
 === GHOST BEHAVIOR TABLE
************************/
export const ghostBehaviorTable = Object.entries(ghostProfiles).reduce((table, [name, data]) => {
  table[name] = {
    evidence: data.evidence,
    behavior: data.behavior,
  };
  return table;
}, {});

/***********************
 === GHOST BEHAVIOR LOGIC
************************/
export function handleGhostBehavior() {
  const ghost = game.ghost;
  if (!ghost || !ghostProfiles[ghost]) return;

  switch (ghost) {
    case "TheMimic":
      handleMimicBehavior();
      break;

    case "Yurei":
      if (game.smudgeActive > 0) {
        logToGame("The Yurei seems trapped in its room for now...");
      }
      break;

    default:
      // Generic behavior logging (optional for future expansions)
      break;
  }
}

/***********************
 === MIMIC BEHAVIOR
************************/
function handleMimicBehavior() {
  if (game.currentTurn >= game.nextMimicShift) {
    const otherGhosts = Object.keys(ghostProfiles).filter(g => g !== "TheMimic");
    game.mimicForm = otherGhosts[Math.floor(Math.random() * otherGhosts.length)];
    game.nextMimicShift = game.currentTurn + (3 + Math.floor(Math.random() * 4));
    logToGame(`The Mimic shifts... it now behaves like a ${game.mimicForm}.`);
  }
}

/***********************
 === HUNT TRIGGERS (BEHAVIOR BASED)
************************/
export function checkGhostAggression() {
  if (game.huntCooldown > 0) return; // respect cooldown

  const ghost = game.ghost;
  const sanity = game.sanity;
  let huntChance = 0;

  switch (ghost) {
    case "Demon": huntChance = sanity < 80 ? 0.3 : 0.1; break;
    case "Revenant": huntChance = sanity < 50 ? 0.2 : 0.05; break;
    case "Succubus": huntChance = sanity < 60 ? 0.25 : 0.1; break;
    default: huntChance = sanity < 40 ? 0.15 : 0.05;
  }

  if (Math.random() < huntChance) startHunt();
}
