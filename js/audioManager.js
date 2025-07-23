/*****************************************************
 * === PHASMA-PHONEY v2.9 — AUDIO MANAGEMENT ===
 * Preloads and plays ambient & ghost sounds.
 *****************************************************/
let audioCache = {};

export function preloadAllAudio() {
  const sounds = [
    "ambient_wind_creaks.ogg", "ambient_fog_whisper.ogg",
    "ambient_rain_loop.ogg", "ghost_whisper1.ogg", "ghost_whisper2.ogg",
    "ambient_dread_low.ogg", "floor_creak1.ogg", "floor_creak2.ogg",
    "polter_throw1.ogg", "polter_throw2.ogg", "succubus_murmur1.ogg",
    "emf_surge1.ogg", "spiritbox_phrase1.ogg", "freezing_breath1.ogg",
    "ghost_writing_scratch.ogg", "smudge_ignite.ogg", "orb_soft_drift1.ogg",
    "crucifix_burn.ogg", "smudge_sizzle.ogg", "hunt_start_rumble.ogg",
    "candle_out.ogg", "heartbeat_fast.ogg", "flicker_pop.ogg",
    "player_death_choke.ogg", "banshee_scream.ogg", "revenant_growl.ogg",
    "mare_light_pop.ogg", "footsteps_fast.ogg", "van_door.ogg",
    "monitor_boot.ogg", "success_chime.ogg", "fail_distort.ogg",
    "game_over_hit.ogg"
  ];

  sounds.forEach(file => {
    const a = new Audio(`audio/${file}`);
    a.load();
    audioCache[file] = a;
  });
}

export function playSound(file, loop = false) {
  if (!audioCache[file]) {
    console.warn(`Missing sound: ${file}`);
    return;
  }
  audioCache[file].loop = loop;
  audioCache[file].currentTime = 0;
  audioCache[file].play().catch(() => {});
}

export function stopAllSounds() {
  Object.values(audioCache).forEach(a => {
    a.pause();
    a.currentTime = 0;
  });
}
