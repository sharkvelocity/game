/*****************************************************
 * === PHASMA-PHONEY v2.9 — AUDIO MANAGER (UPDATED WITH NOTEBOOK) ===
 * Handles optional audio playback, skipping any
 * missing or failed-to-load files to prevent 404 errors.
 *****************************************************/

import { gameSettings } from "./state.js";

/* === AUDIO LIBRARY === */
export const audioFiles = {
  ambient: [
    "audio/ambient_wind_creaks.ogg",
    "audio/ambient_fog_whisper.ogg",
    "audio/ambient_rain_loop.ogg",
    "audio/ambient_dread_low.ogg"
  ],
  ghost: [
    "audio/ghost_whisper1.ogg",
    "audio/ghost_whisper2.ogg",
    "audio/ghost_breath.ogg",
    "audio/revenant_growl.ogg",
    "audio/banshee_scream.ogg",
    "audio/succubus_murmur1.ogg"
  ],
  events: [
    "audio/floor_creak1.ogg",
    "audio/floor_creak2.ogg",
    "audio/polter_throw1.ogg",
    "audio/polter_throw2.ogg",
    "audio/wall_knock1.ogg",
    "audio/wall_knock2.ogg",
    "audio/emf_surge1.ogg",
    "audio/spiritbox_phrase1.ogg",
    "audio/freezing_breath1.ogg",
    "audio/ghost_writing_scratch.ogg",
    "audio/orb_soft_drift1.ogg",
    "audio/smudge_ignite.ogg",
    "audio/smudge_sizzle.ogg",
    "audio/crucifix_burn.ogg",
    "audio/hunt_start_rumble.ogg",
    "audio/candle_out.ogg",
    "audio/heartbeat_fast.ogg",
    "audio/flicker_pop.ogg",
    "audio/player_death_choke.ogg",
    "audio/mare_light_pop.ogg",
    "audio/footsteps_fast.ogg",
    "audio/van_door.ogg",
    "audio/monitor_boot.ogg",
    "audio/success_chime.ogg",
    "audio/fail_distort.ogg",
    "audio/game_over_hit.ogg"
  ],
  notebook: [ /* ✅ NEW: Notebook sounds */
    "audio/notebook_rustle_open.ogg",
    "audio/notebook_rustle_close.ogg"
  ]
};

let loadedAudio = {};

/***********************
 === PRELOAD AUDIO ===
************************/
export function preloadAllAudio() {
  Object.keys(audioFiles).forEach(category => {
    audioFiles[category].forEach(file => {
      const audio = new Audio();
      audio.src = file;
      audio.preload = "auto";

      audio.addEventListener("canplaythrough", () => {
        loadedAudio[file] = audio;
        console.log(`✅ Audio loaded: ${file}`);
      });

      audio.addEventListener("error", () => {
        console.warn(`⚠️ Skipping missing audio: ${file}`);
      });
    });
  });
}

/***********************
 === PLAY AUDIO (RESPECT SETTINGS) ===
************************/
/**
 * Plays an audio file if it’s loaded and safe.
 * Respects mute toggle from gameSettings.
 * @param {string} file - The file path to play.
 * @param {boolean} loop - Whether the sound should loop.
 */
export function playAudio(file, loop = false) {
  if (gameSettings.muteSounds) return; /* ✅ Mute toggle */
  if (!loadedAudio[file]) {
    console.warn(`⚠️ Audio not available: ${file}`);
    return;
  }
  const audio = loadedAudio[file].cloneNode(true);
  audio.loop = loop;
  audio.play().catch(() => {
    console.warn(`⚠️ Could not play audio: ${file}`);
  });
}

/***********************
 === STOP ALL AUDIO ===
************************/
export function stopAllSounds() {
  Object.values(loadedAudio).forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
}

/***********************
 === NOTEBOOK RUSTLE SOUNDS (NEW) ===
************************/
/**
 * Plays notebook rustle sounds for open/close.
 * @param {"open"|"close"} action
 */
export function playNotebookSound(action) {
  if (gameSettings.muteSounds) return; /* ✅ Respects mute */
  const file = action === "open"
    ? "audio/notebook_rustle_open.ogg"
    : "audio/notebook_rustle_close.ogg";
  playAudio(file);
}
