// Unlockable gliders — matches design doc ("The Heavy Lifter", "The Swift", etc.)
//
// NOTE ON i18n: the `description` field below is kept as a Greek fallback
// (and inline documentation of what the glider does), but the UI does NOT
// read it directly — GarageScreen looks up t(`gliders.${g.id}`) instead, so
// the displayed text follows the EL/EN toggle. See src/i18n/translations.js.
//
// PRICES: every unlockCost below is already 2x the old value (slower economy;
// see game/economy.js for Skin Update costs which are derived from it).
//
// IMPORTANT: There is NO real-money purchase anywhere in this game. No
// payment SDK, no billing library, no network call. "unlockCost" below is
// spent using CREDITS earned purely by playing (successful deliveries +
// drone refuels during a run — see src/game/useGameLoop.js). It is exactly
// like an arcade high-score/coin system, not an in-app purchase.
import { NEW_GLIDERS } from "./newGliders";
import { NEW_GLIDERS_2 } from "./newGliders2";
import { NEW_GLIDERS_3 } from "./newGliders3";

const BASE_GLIDERS = [
  {
    id: "starter",
    name: "Rusty Starter",
    unlockCost: 0, // owned from the very first launch
    capacity: 5,
    weightFactorMult: 1.0,
    turnRate: 1.0,
    color: "#28e0ff",
    accentColor: "#ff2ea8",
    description: "Το φθαρμένο glider που σου έδωσε η Astra-Express την πρώτη μέρα.",
  },
  {
    id: "swift",
    name: "The Swift",
    unlockCost: 1000,
    capacity: 3,
    weightFactorMult: 0.7,
    turnRate: 1.35,
    color: "#3dffb0",
    accentColor: "#ffe14d",
    description: "Πολύ ελαφρύ και ευέλικτο, αλλά χωράει μόνο 3 δέματα.",
  },
  {
    id: "heavy_lifter",
    name: "The Heavy Lifter",
    unlockCost: 1500,
    capacity: 8,
    weightFactorMult: 1.1,
    turnRate: 0.75,
    color: "#ff9d2e",
    accentColor: "#ff2ea8",
    description: "Χωράει έως 8 δέματα, αλλά στρίβει αργά και βαραίνει περισσότερο.",
  },
  {
    id: "phantom",
    name: "Phantom Glider",
    unlockCost: 2400,
    capacity: 5,
    weightFactorMult: 0.85,
    turnRate: 1.15,
    color: "#c98bff",
    accentColor: "#28e0ff",
    description: "Ισορροπημένο, με βελτιωμένη απόκριση στους ελιγμούς.",
  },
  {
    id: "pulse_wave",
    name: "The Pulse-Wave",
    unlockCost: 1800,
    capacity: 5,
    weightFactorMult: 1.0,
    turnRate: 1.0,
    color: "#9dff4d",
    accentColor: "#ffe14d",
    description: "Κατασκευασμένο από ανακυκλωμένα εξαρτήματα σταθμών ενέργειας. Double tap για EMP Blast: καταστρέφει εμπόδια γύρω σου και τα μετατρέπει σε νομίσματα.",
    skill: {
      type: "active",
      id: "emp_blast",
      trigger: "double_tap",
      name: "EMP Blast",
    },
  },
  {
    id: "hologram",
    name: "Hologram Glider",
    unlockCost: 2000,
    capacity: 5,
    weightFactorMult: 1.0,
    turnRate: 1.05,
    color: "#7de8ff",
    accentColor: "#c98bff",
    description: "Χρησιμοποιείται από τους παράνομους hackers της πόλης. Swipe κάτω και κράτα για Decoy Drone: αφήνει ολόγραμμα που παρασύρει εχθρικά drones/ταξί.",
    skill: {
      type: "active",
      id: "decoy_drone",
      trigger: "swipe_down_hold",
      name: "Decoy Drone",
    },
  },
  {
    id: "anti_grav_heavy",
    name: "Anti-Grav Heavy",
    unlockCost: 2200,
    capacity: 5,
    weightFactorMult: 0.5, // Mass Reduction passive: -50% weight effect
    turnRate: 0.85,
    boostMult: 0.9, // -10% τελική ταχύτητα σε delivery/refuel boost
    color: "#ff6a4d",
    accentColor: "#ffcf4d",
    description: "Βιομηχανικό σκάφος βαρέων μεταφορών. Mass Reduction (passive): -50% επίδραση βάρους δεμάτων — πέφτει πολύ αργά ακόμα και με γεμάτο φορτίο. Μειονέκτημα: -10% τελική ταχύτητα boost.",
    skill: {
      type: "passive",
      id: "mass_reduction",
      name: "Mass Reduction",
    },
  },
  {
    id: "solar_wing",
    name: "Solar-Wing",
    unlockCost: 2600,
    capacity: 5,
    weightFactorMult: 1.0,
    turnRate: 1.1,
    magnetMult: 2.0, // Coin Magnet passive: διπλάσια εμβέλεια μαγνήτη
    color: "#ffe14d",
    accentColor: "#28e0ff",
    description: "Πανάλαφρο glider με φωτοβολταϊκά φτερά. Coin Magnet & Boost (passive): μαγνήτης διπλάσιας εμβέλειας για νομίσματα + δωρεάν mini-boost κάθε 10 νομίσματα στη σειρά.",
    skill: {
      type: "passive",
      id: "coin_magnet_boost",
      name: "Coin Magnet & Boost",
    },
  },
  {
    id: "storm_chaser",
    name: "Storm Chaser",
    unlockCost: 2800,
    capacity: 5,
    weightFactorMult: 1.0,
    turnRate: 1.05,
    color: "#ff5ec4",
    accentColor: "#28e0ff",
    description: "Φτιαγμένο για κυνήγι καταιγίδων στα ψηλά κτίρια. Double tap για Turbo Dash: έκρηξη ταχύτητας +50% και στιγμιαία ατρωσία για λίγο.",
    skill: {
      type: "active",
      id: "turbo_dash",
      trigger: "double_tap",
      name: "Turbo Dash",
    },
  },
  {
    id: "iron_courier",
    name: "Iron Courier",
    unlockCost: 2600,
    capacity: 6,
    weightFactorMult: 1.1,
    turnRate: 0.9,
    color: "#8a8f9e",
    accentColor: "#ff9d2e",
    description: "Ενισχυμένο σκελετό, φτιαγμένο να αντέχει χτυπήματα. Reinforced Hull (passive): ξεκινάς κάθε run με μία δωρεάν ασπίδα που απορροφά το πρώτο χτύπημα.",
    skill: {
      type: "passive",
      id: "reinforced_hull",
      name: "Reinforced Hull",
    },
  },
  {
    id: "nomad",
    name: "Nomad",
    unlockCost: 700,
    capacity: 4,
    weightFactorMult: 0.9,
    turnRate: 1.2,
    color: "#3dffb0",
    accentColor: "#7de8ff",
    description: "Ελαφρύ, φθηνό και ευέλικτο — ιδανικό δεύτερο glider για να ξεκινήσεις να συλλέγεις πόντους γρήγορα.",
  },
  {
    id: "riftwalker",
    name: "Riftwalker",
    unlockCost: 3000,
    capacity: 5,
    weightFactorMult: 1.0,
    turnRate: 1.1,
    color: "#7d5cff",
    accentColor: "#28e0ff",
    description: "Πειραματικό glider με ασταθή τεχνολογία φάσης. Double tap για Phase Shift: γίνεσαι άυλος για λίγο (περνάς μέσα από εμπόδια/drones χωρίς Wanted Level) και ρουφάει αυτόματα όλα τα κοντινά νομίσματα.",
    skill: {
      type: "active",
      id: "phase_shift",
      trigger: "double_tap",
      name: "Phase Shift",
    },
  },
  {
    id: "storm_breaker",
    name: "Storm Breaker",
    unlockCost: 2900,
    capacity: 5,
    weightFactorMult: 1.0,
    turnRate: 1.0,
    color: "#ffb347",
    accentColor: "#7d5cff",
    description: "Ενισχυμένο ενάντια στα ακραία καιρικά φαινόμενα της πόλης. Storm Immunity (passive): μισή διάβρωση από Acid Rain, χωρίς αντεστραμμένους χειρισμούς στο Solar Flare, παραμένει ορατό το HUD στο Blackout, +30% πόντοι όσο διαρκεί οποιοδήποτε καιρικό φαινόμενο.",
    skill: {
      type: "passive",
      id: "storm_immunity",
      name: "Storm Immunity",
    },
  },
  {
    id: "titan",
    name: "Titan",
    unlockCost: 3600,
    capacity: 8,
    weightFactorMult: 1.05,
    turnRate: 0.65,
    color: "#ff9d2e",
    accentColor: "#ff3b3b",
    description: "Χωρητικότητα 8 δεμάτων για μαζικές παραδόσεις — ανεβαίνει ακόμα και φορτωμένο, αλλά στρίβει πολύ αργά.",
  },
];

export const GLIDERS = [...BASE_GLIDERS, ...NEW_GLIDERS, ...NEW_GLIDERS_2, ...NEW_GLIDERS_3];

export function gliderById(id) {
  return GLIDERS.find((g) => g.id === id);
}
