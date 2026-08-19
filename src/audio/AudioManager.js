import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

// NOTE: This game intentionally ships with NO background music, per product
// decision. Only short, procedurally generated sound effects (see
// /assets/audio/*.wav, produced by tools/gen_sfx.py) are played, for:
//   - thrust: holding to ascend
//   - deliver: successful package delivery
//   - pickup: drone refuel station
//   - crash: collision / game over
//   - click: UI buttons
//   - swipe: swipe-down dive
// All effects are fully offline (bundled local files, zero network calls).
//
// Uses expo-audio's imperative createAudioPlayer() API (expo-av was removed
// from the SDK — see https://docs.expo.dev/versions/latest/sdk/audio/).
// Unlike expo-av, expo-audio does NOT auto-reset playback position when a
// clip finishes, so every play() explicitly seeks to 0 first.

const SOUND_FILES = {
  thrust: require("../../assets/audio/thrust.wav"),
  deliver: require("../../assets/audio/deliver.wav"),
  pickup: require("../../assets/audio/pickup.wav"),
  crash: require("../../assets/audio/crash.wav"),
  click: require("../../assets/audio/click.wav"),
  swipe: require("../../assets/audio/swipe.wav"),
};

class AudioManagerClass {
  constructor() {
    this.players = {};
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
    this.ready = true;
  }

  setMuted(muted) {
    this.muted = muted;
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
    this.ready = false;
  }
}

const AudioManager = new AudioManagerClass();
export default AudioManager;
