/*****************************************************
 * === PHASMA-PHONEY v2.9 — AUDIO MANAGER (FINAL MASTER) ===
 * Preloads MP3s safely, plays/stops sounds, and handles loops.
 *****************************************************/
import { gameSettings } from "./state.js";

/* === AUDIO LIBRARY === */
export const audioFiles = {
  events: [
    "audio/doorCreak1.mp3",
    "audio/doorCreak2.mp3",
    "audio/doorSlam1.mp3",
    "audio/hunt_start_rumble.mp3",
    "audio/hunt_start_rumble_heartbeat.mp3",
    "audio/crucifix_burn.mp3",
    "audio/gameKilled.mp3",
    "audio/notebook_open.mp3"
  ]
};

const loadedAudio = {}; // cache

export function preloadAllAudio() {
  console.log("🎵 Preloading MP3 files...");
  Object.values(audioFiles).flat().forEach(file => {
    const audio = new Audio(file);
    audio.preload = "auto";
    audio.addEventListener("canplaythrough", () => loadedAudio[file] = audio);
    audio.addEventListener("error", () => console.warn(`⚠️ Skipping missing: ${file}`));
  });
}

export function playAudio(file, loop = false, volume = 1.0) {
  if (gameSettings.muteSounds || !loadedAudio[file]) return;
  try {
    const sound = loadedAudio[file].cloneNode(true);
    sound.loop = loop; sound.volume = volume;
    sound.play().catch(() => console.warn(`⚠️ Could not play: ${file}`));
    loadedAudio[`__playing_${file}`] = sound;
  } catch (e) { console.error(`❌ Playback error ${file}`, e); }
}

export function stopAllSounds() {
  Object.entries(loadedAudio).forEach(([key, audio]) => {
    if (key.startsWith("__playing_")) {
      try { audio.pause(); audio.currentTime = 0; } catch {}
      delete loadedAudio[key];
    }
  });
}

export function stopLoopAudio(file) {
  const playing = loadedAudio[`__playing_${file}`];
  if (playing) {
    try { playing.pause(); playing.currentTime = 0; } catch {}
    delete loadedAudio[`__playing_${file}`];
  }
}

export function playNotebookSound() {
  if (!gameSettings.muteSounds) playAudio("audio/notebook_open.mp3");
}
