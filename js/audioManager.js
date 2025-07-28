/*****************************************************
 * === PHASMA-PHONEY v2.9 — AUDIO MANAGER (MP3 FINAL) ===
 * Preloads, plays & safely stops audio with loop support.
 *****************************************************/
import { gameSettings } from "./state.js";

export const audioFiles = {
  ambient: [
    "audio/ambient_wind.mp3",
    "audio/ambient_house_creak.mp3",
    "audio/fireplace.mp3",
    "audio/wildDog.mp3"
  ],
  events: [
    "audio/doorCreak1.mp3",
    "audio/doorCreak2.mp3",
    "audio/doorCreak3.mp3",
    "audio/hunt_start_rumble.mp3",
    "audio/hunt_start_rumble_heartbeat.mp3",
    "audio/gameKilled.mp3",
    "audio/crucifix_burn.mp3",
    "audio/notebook_open.mp3"
  ]
};

const loadedAudio = {};
const loopedAudio = {};

/***********************
 === PRELOAD AUDIO ===
************************/
export function preloadAllAudio() {
  console.log("🎵 Preloading MP3 audio files...");
  Object.values(audioFiles).flat().forEach(file => {
    const audio = new Audio();
    audio.src = file;
    audio.preload = "auto";
    audio.addEventListener("canplaythrough", () => {
      loadedAudio[file] = audio;
      console.log(`✅ Loaded: ${file}`);
    });
    audio.addEventListener("error", () => console.warn(`⚠️ Missing audio: ${file}`));
  });
}

/***********************
 === PLAY AUDIO
************************/
export function playAudio(file, loop = false, volume = 1.0) {
  if (gameSettings.muteSounds) return;
  if (!loadedAudio[file]) {
    console.warn(`⚠️ Not preloaded: ${file}`);
    return;
  }
  try {
    const sound = loadedAudio[file].cloneNode(true);
    sound.loop = loop;
    sound.volume = volume;
    sound.play().catch(() => console.warn(`⚠️ Could not play: ${file}`));
    if (loop) loopedAudio[file] = sound;
  } catch (err) {
    console.error(`❌ Playback error: ${file}`, err);
  }
}

/***********************
 === STOP AUDIO
************************/
export function stopAllSounds() {
  Object.values(loopedAudio).forEach(a => {
    try { a.pause(); a.currentTime = 0; } catch {}
  });
  console.log("🔇 All sounds stopped.");
}

export function stopLoopAudio(file) {
  if (loopedAudio[file]) {
    try {
      loopedAudio[file].pause();
      loopedAudio[file].currentTime = 0;
      delete loopedAudio[file];
    } catch {}
  }
}

export function playNotebookSound() {
  if (!gameSettings.muteSounds) playAudio("audio/notebook_open.mp3");
}
