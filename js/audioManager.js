/*****************************************************
 * === PHASMA-PHONEY v2.6 — AUDIO MANAGER ===
 * Handles all audio playback (one-shots & loops).
 *****************************************************/

// === SOUND LIBRARY ===
export const soundLibrary = {
  ambient: {
    rain: ["ambient_rain_loop.ogg"],
    wind: ["ambient_wind_creaks.ogg"],
    dread: ["ambient_dread_low.ogg"],
    fog: ["ambient_fog_whisper.ogg"]
  },
  ghost: {
    whispers: ["ghost_whisper1.ogg", "ghost_whisper2.ogg"],
    breath: ["ghost_breath.ogg"],
    creaks: ["floor_creak1.ogg", "floor_creak2.ogg"],
    knocks: ["wall_knock1.ogg", "wall_knock2.ogg"],
    polterThrow: ["polter_throw1.ogg", "polter_throw2.ogg"],
    succubus: ["succubus_murmur1.ogg"]
  },
  evidence: {
    emf: ["emf_surge1.ogg"],
    spiritBox: ["spiritbox_phrase1.ogg"],
    writing: ["ghost_writing_scratch.ogg"],
    freezing: ["freezing_breath1.ogg"],
    orbs: ["orb_soft_drift1.ogg"]
  },
  defense: {
    smudge: ["smudge_ignite.ogg", "smudge_sizzle.ogg"],
    crucifix: ["crucifix_burn.ogg"],
    candle: ["candle_out.ogg"]
  },
  hunt: {
    start: ["hunt_start_rumble.ogg"],
    heartbeat: ["heartbeat_fast.ogg"],
    flicker: ["flicker_pop.ogg"],
    chase: ["footsteps_fast.ogg"],
    death: ["player_death_choke.ogg"],
    revenant: ["revenant_growl.ogg"],
    banshee: ["banshee_scream.ogg"],
    mare: ["mare_light_pop.ogg"]
  },
  ui: {
    van: ["van_door.ogg"],
    monitor: ["monitor_boot.ogg"],
    console: ["console_key1.ogg"],
    success: ["success_chime.ogg"],
    fail: ["fail_distort.ogg"],
    gameOver: ["game_over_hit.ogg"]
  }
};

const AUDIO_BASE_PATH = "audio/";
let activeLoops = {}; // Track active looped sounds

/*****************************************************
 * === PLAY SOUND ===
 * category: "hunt", "ghost", etc.
 * type: sound key
 * options: {loop, volume, randomize}
 *****************************************************/
export function playSound(category, type, options = {}) {
  const group = soundLibrary?.[category]?.[type];
  if (!group) return console.warn(`Sound not found: ${category}.${type}`);

  const file = group[Math.floor(Math.random() * group.length)];
  const audio = new Audio(`${AUDIO_BASE_PATH}${file}`);

  // Pitch & Volume Variation
  audio.playbackRate = options.randomize === false ? 1 : (0.9 + Math.random() * 0.2);
  audio.volume = options.volume ?? (0.6 + Math.random() * 0.4);

  // Loop Support
  audio.loop = !!options.loop;
  if (audio.loop) {
    stopSound(category, type);
    activeLoops[`${category}.${type}`] = audio;
  }

  audio.play().catch(e => console.warn("Audio blocked:", e));
}

/*****************************************************
 * === STOP SOUND ===
 * Stops specific looped sound
 *****************************************************/
export function stopSound(category, type) {
  const key = `${category}.${type}`;
  if (activeLoops[key]) {
    activeLoops[key].pause();
    activeLoops[key].currentTime = 0;
    delete activeLoops[key];
  }
}

/*****************************************************
 * === STOP ALL AUDIO ===
 *****************************************************/
export function stopAllSounds() {
  for (let key in activeLoops) {
    activeLoops[key].pause();
    activeLoops[key].currentTime = 0;
  }
  activeLoops = {};
}

/*****************************************************
 * === PRELOAD AUDIO ===
 * Loads all audio into cache for smoother playback
 *****************************************************/
export function preloadAllAudio() {
  for (let cat in soundLibrary) {
    for (let type in soundLibrary[cat]) {
      soundLibrary[cat][type].forEach(file => {
        const audio = new Audio(`${AUDIO_BASE_PATH}${file}`);
        audio.preload = "auto";
      });
    }
  }
}

// Call this at game start
preloadAllAudio();
