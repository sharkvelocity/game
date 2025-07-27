/*****************************************************
 * === PHASMA-PHONEY v2.9 — AUDIO MANAGER (MP3 FINAL FIXED) ===
 * Uses uploaded MP3 files. Safe preload, skip logic,
 * and fully controlled looping & stopping.
 *****************************************************/

import { gameSettings } from "./state.js";

/* === AUDIO LIBRARY (MP3) === */
export const audioFiles = {
  ambient: [
    "audio/ambient_wind.mp3",
    "audio/ambient_house_creak.mp3",
    "audio/fireplace.mp3",
    "audio/wildDog.mp3"
  ],
  ghost: [
    "audio/spiritBoxStatic.mp3",
    "audio/music_box_play.mp3",
    "audio/Radio.mp3"
  ],
  events: [
    "audio/doorSlam1.mp3",
    "audio/doorSlam2.mp3",
    "audio/doorCreak1.mp3",
    "audio/doorCreak2.mp3",
    "audio/doorCreak3.mp3",
    "audio/hunt_start_rumble.mp3",
    "audio/hunt_start_rumble_heartbeat.mp3",
    "audio/gameKilled.mp3",
    "audio/notebook_open.mp3",
    "audio/tarot_card_flip.mp3"
  ]
};

const loadedAudio = {};          // ✅ Cache for preloaded files
const playingLoops = {};         // ✅ Track looping audio for safe stopping

/***********************
 === PRELOAD AUDIO ===
************************/
export function preloadAllAudio() {
  console.log("🎵 Preloading MP3 audio files...");
  Object.keys(audioFiles).forEach(category => {
    audioFiles[category].forEach(file => {
      const audio = new Audio();
      audio.src = file;
      audio.preload = "auto";

      audio.addEventListener("canplaythrough", () => {
        loadedAudio[file] = audio;
        console.log(`✅ Loaded: ${file}`);
      });

      audio.addEventListener("error", () => {
        console.warn(`⚠️ Skipping missing audio: ${file}`);
      });
    });
  });
}

/***********************
 === PLAY AUDIO (SAFE)
************************/
export function playAudio(file, loop = false, volume = 1.0) {
  if (gameSettings.muteSounds) return;

  if (!loadedAudio[file]) {
    console.warn(`⚠️ Audio not preloaded or unavailable: ${file}`);
    return;
  }

  try {
    const sound = loadedAudio[file].cloneNode(true);
    sound.loop = loop;
    sound.volume = volume;

    // ✅ Track loops for safe stopping
    if (loop) playingLoops[file] = sound;

    sound.play().catch(() => {
      console.warn(`⚠️ Could not play audio: ${file}`);
    });
  } catch (err) {
    console.error(`❌ Playback error [${file}]:`, err);
  }
}

/***********************
 === STOP ALL AUDIO ===
************************/
export function stopAllSounds() {
  Object.values(playingLoops).forEach(audio => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      console.warn("⚠️ Could not stop some looping audio.");
    }
  });
  playingLoops.length = 0;
  console.log("🔇 All looping sounds stopped.");
}

/***********************
 === STOP SPECIFIC LOOP ===
************************/
export function stopLoopAudio(file) {
  if (playingLoops[file]) {
    try {
      playingLoops[file].pause();
      playingLoops[file].currentTime = 0;
      delete playingLoops[file];
      console.log(`🔇 Stopped loop: ${file}`);
    } catch {
      console.warn(`⚠️ Failed to stop loop: ${file}`);
    }
  }
}

/***********************
 === NOTEBOOK OPEN SOUND ===
************************/
export function playNotebookSound() {
  if (gameSettings.muteSounds) return;
  playAudio("audio/notebook_open.mp3", false, 0.8);
}

/***********************
 === SAFE SOUND WRAPPER ===
************************/
export function safePlaySound(file) {
  try {
    playAudio(file);
  } catch (e) {
    console.warn(`⚠️ safePlaySound failed for: ${file}`, e);
  }
}
