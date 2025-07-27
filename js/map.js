/*****************************************************
 * === PHASMA-PHONEY v2.9 — MAP.JS (STUB FIXED) ===
 * Re-exports only what's needed for compass updates.
 *****************************************************/
import { updateCompassButtons as coreUpdateCompassButtons } from "./state.js"; 
// ✅ state.js now holds all map logic after unification

export function updateCompassButtons() {
  coreUpdateCompassButtons();
}
