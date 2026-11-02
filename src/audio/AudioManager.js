import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

// SFX: short, procedurally generated sound effects (see /assets/audio/*.wav,
// produced by tools/gen_sfx.py) — no samples from the internet, so zero
// copyright concerns. Played for:
//   - thrust: holding to ascend
//   - deliver: successful package delivery
//   - pickup: drone refuel station
//   - crash: collision / game over
//   - click: UI buttons
//   - swipe: swipe-down dive
//
// MUSIC: two looping tracks, both user-supplied and confirmed royalty-free:
//   - assets/audio/music.mp3          -> every screen EXCEPT gameplay (menu, garage, game over...)
//   - assets/audio/gameplay_music.mp3 -> only while a run is being played
// setScene("menu" | "game") switches between them. Both are controlled by
// the SAME mute toggle as the SFX, just at a lower mixed volume so it never
// buries the gameplay cues.
//
// All audio is fully offline (bundled local files, zero network calls).
//
// Uses expo-audio's imperative createAudioPlayer() API (expo-av was removed
// from the SDK — see https://docs.expo.dev/versions/latest/sdk/audio/).
// Unlike expo-av, expo-audio does NOT auto-reset playback position when a
// clip finishes, so every SFX play() explicitly seeks to 0 first (music
// doesn't need this since `loop` handles its own restart).

const SOUND_FILES = {
  thrust: require("../../assets/audio/thrust.wav"),
  deliver: require("../../assets/audio/deliver.wav"),
  pickup: require("../../assets/audio/pickup.wav"),
  crash: require("../../assets/audio/crash.wav"),
  click: require("../../assets/audio/click.wav"),
  swipe: require("../../assets/audio/swipe.wav"),
};

const MUSIC_FILE = require("../../assets/audio/music.mp3");
const GAME_MUSIC_FILE = require("../../assets/audio/gameplay_music.mp3");
const MUSIC_VOLUME = 0.35; // kept under the SFX so deliver/crash/etc. still cut through

class AudioManagerClass {
  constructor() {
    this.players = {};
    this.musicPlayer = null;
    this.gamePlayer = null;
    this.scene = "menu"; // "menu" | "game"
    this.muted = false;
    this.ready = false;
    // simple cooldown map so rapid triggers (e.g. holding thrust) don't spam
    this.lastPlayed = {};
    this.cooldownMs = { thrust: 220, deliver: 0, pickup: 0, crash: 0, click: 80, swipe: 120 };
  }

  async init() {
    if (this.ready) return;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      });
    } catch (e) {
      // Non-fatal: audio mode config failing shouldn't block the game.
    }
    for (const [key, mod] of Object.entries(SOUND_FILES)) {
      try {
        this.players[key] = createAudioPlayer(mod);
      } catch (e) {
        // If a sound fails to load, the game must keep working silently.
        this.players[key] = null;
      }
    }
    try {
      this.musicPlayer = createAudioPlayer(MUSIC_FILE);
      this.musicPlayer.loop = true;
      this.musicPlayer.volume = this.muted ? 0 : MUSIC_VOLUME;
    } catch (e) {
      // If the music file fails to load, the game must keep working silently.
      this.musicPlayer = null;
    }
    try {
      this.gamePlayer = createAudioPlayer(GAME_MUSIC_FILE);
      this.gamePlayer.loop = true;
      this.gamePlayer.volume = this.muted ? 0 : MUSIC_VOLUME;
    } catch (e) {
      this.gamePlayer = null;
    }
    this.ready = true;
  }

  setMuted(muted) {
    this.muted = muted;
    for (const p of [this.musicPlayer, this.gamePlayer]) {
      if (!p) continue;
      try {
        p.volume = muted ? 0 : MUSIC_VOLUME;
      } catch (e) {
        // ignore
      }
    }
  }

  // Switches the background track: "game" plays gameplay_music.mp3 (restarted
  // for each run), anything else plays the regular music.mp3 (it continues
  // where it left off). Safe to call repeatedly with the same scene.
  setScene(scene) {
    const next = scene === "game" ? "game" : "menu";
    const changed = next !== this.scene;
    this.scene = next;
    if (!this.ready) return;
    try {
      if (next === "game") {
        if (this.musicPlayer) this.musicPlayer.pause();
        if (this.gamePlayer) {
          if (changed) this.gamePlayer.seekTo(0);
          this.gamePlayer.play();
        }
      } else {
        if (this.gamePlayer) this.gamePlayer.pause();
        if (this.musicPlayer) this.musicPlayer.play();
      }
    } catch (e) {
      // ignore playback errors
    }
  }

  // Starts (or resumes) the looping background track. Safe to call multiple
  // times — a player that's already playing just keeps playing. Call once
  // after init(), e.g. from GameProvider on app launch, so the track plays
  // continuously across Menu/Game/Garage/etc. rather than restarting per
  // screen.
  playMusic() {
    this.setScene(this.scene);
  }

  pauseMusic() {
    for (const p of [this.musicPlayer, this.gamePlayer]) {
      if (!p) continue;
      try {
        p.pause();
      } catch (e) {
        // ignore
      }
    }
  }

  play(key) {
    if (this.muted) return;
    const now = Date.now();
    const cd = this.cooldownMs[key] || 0;
    if (this.lastPlayed[key] && now - this.lastPlayed[key] < cd) return;
    this.lastPlayed[key] = now;
    const player = this.players[key];
    if (!player) return;
    try {
      // expo-audio doesn't auto-rewind after finishing, so reset every time.
      player.seekTo(0);
      player.play();
    } catch (e) {
      // ignore playback errors (e.g. player mid-teardown)
    }
  }

  async unloadAll() {
    for (const player of Object.values(this.players)) {
      try {
        if (player) player.release();
      } catch (e) {
        // ignore
      }
    }
    this.players = {};
    try {
      if (this.musicPlayer) this.musicPlayer.release();
    } catch (e) {
      // ignore
    }
    this.musicPlayer = null;
    try {
      if (this.gamePlayer) this.gamePlayer.release();
    } catch (e) {
      // ignore
    }
    this.gamePlayer = null;
    this.ready = false;
  }
}

const AudioManager = new AudioManagerClass();
export default AudioManager;
