// === js/audioManager.js ===



export function playNotebookSound() {
  audioCache.notebook?.play();
}

// Preloaded game audio assets
const audioFiles = {
  monitorBoot: new Audio("audio/monitor_boot.mp3"),
  notebook: new Audio("audio/notebook_open.mp3"),
  radio: new Audio("audio/Radio.mp3"),
  ambientCreak: new Audio("audio/ambient_house_creak.mp3"),
  ambientWind: new Audio("audio/ambient_wind.mp3"),
  crucifixBurn: new Audio("audio/crucifix_burn.mp3"),
  doorCreak1: new Audio("audio/doorCreak1.mp3"),
  doorCreak2: new Audio("audio/doorCreak2.mp3"),
  doorCreak3: new Audio("audio/doorCreak3.mp3"),
  doorSlam1: new Audio("audio/doorSlam1.mp3"),
  doorSlam2: new Audio("audio/doorSlam2.mp3"),
  fireplace: new Audio("audio/fireplace.mp3"),
  gameKilled: new Audio("audio/gameKilled.mp3"),
  huntStart: new Audio("audio/hunt_start_rumble.mp3"),
  huntHeartbeat: new Audio("audio/hunt_start_rumble_heartbeat.mp3"),
  musicBox: new Audio("audio/music_box_play.mp3"),
  spiritBoxStatic: new Audio("audio/spiritBoxStatic.mp3"),
  tarotFlip: new Audio("audio/tarot_card_flip.mp3"),
  wildDog: new Audio("audio/wildDog.mp3")
};

// Volume presets (adjust as needed)
audioFiles.monitorBoot.volume = 1.0;
audioFiles.notebook.volume = 0.6;
audioFiles.radio.volume = 0.8;
audioFiles.ambientCreak.volume = 0.4;
audioFiles.ambientWind.volume = 0.4;
audioFiles.huntStart.volume = 0.7;
audioFiles.huntHeartbeat.volume = 0.9;
audioFiles.fireplace.volume = 0.5;
audioFiles.spiritBoxStatic.volume = 0.8;
audioFiles.musicBox.volume = 0.8;

// Loop ambience
audioFiles.ambientCreak.loop = true;
audioFiles.ambientWind.loop = true;
audioFiles.fireplace.loop = true;

// === General-purpose playback ===
const audioCache = {};
export function preloadAllAudio() {
  for (const [key, src] of Object.entries(audioFiles)) {
    const audio = new Audio(src);
    audio.preload = "auto";
    audioCache[key] = audio;
  }
}
export function playGhostRadio() {
  audioCache.ghostRadio?.play();
}


function safePlay(audio) {
  try {
    audio.currentTime = 0;
    audio.play();
  } catch (e) {
    console.warn("Audio playback error:", e);
  }
}

// === Exported SFX functions ===

export function playNotebookSound() {
  safePlay(audioFiles.notebook);
}

export function tryPlayRadioEvent(inGhostRoom, isShade) {
  if (isShade && inGhostRoom) return;
  const chance = inGhostRoom ? 0.5 : 0.05;
  if (Math.random() < chance) {
    safePlay(audioFiles.radio);
  }
}

export function playMonitorBoot() {
  safePlay(audioFiles.monitorBoot);
}

export function playCrucifixBurn() {
  safePlay(audioFiles.crucifixBurn);
}

export function playHuntStart() {
  safePlay(audioFiles.huntStart);
}

export function playHuntHeartbeat() {
  safePlay(audioFiles.huntHeartbeat);
}

export function playGameKilled() {
  safePlay(audioFiles.gameKilled);
}

export function playSpiritBoxStatic() {
  safePlay(audioFiles.spiritBoxStatic);
}

export function playDoorCreakRandom() {
  const sounds = [audioFiles.doorCreak1, audioFiles.doorCreak2, audioFiles.doorCreak3];
  safePlay(sounds[Math.floor(Math.random() * sounds.length)]);
}

export function playDoorSlam() {
  const slam = Math.random() < 0.5 ? audioFiles.doorSlam1 : audioFiles.doorSlam2;
  safePlay(slam);
}

export function playWildDog() {
  safePlay(audioFiles.wildDog);
}

export function playTarotFlip() {
  safePlay(audioFiles.tarotFlip);
}

export function playMusicBox() {
  safePlay(audioFiles.musicBox);
}

export function playAmbientWind() {
  safePlay(audioFiles.ambientWind);
}

export function playAmbientCreak() {
  safePlay(audioFiles.ambientCreak);
}

export function playFireplace() {
  safePlay(audioFiles.fireplace);
}
