// Mid-run mini-objectives: roughly every 300 m a random challenge appears
// (limited to ~220 m to finish it). Completing it pays a small credit bonus.
export const OBJ = { everyMeters: [260, 340], firstAtMeters: [220, 320], windowMeters: 220, rewardMin: 50, rewardMax: 160 };

const O = (id, kind, target, en, el, extra = {}) => ({ id, kind, target, text: { en, el }, ...extra });
export const OBJECTIVES = [
  O("close3", "nearmiss", 3, "3 close calls", "3 παρ' ολίγον"),
  O("nodive2", "deliver", 2, "Deliver 2 packages without diving", "2 παραδόσεις χωρίς dive", { failOn: "dive" }),
  O("coins10", "coin", 10, "Collect 10 coins", "Μάζεψε 10 νομίσματα"),
  O("combo3", "combo", 3, "Reach combo x3", "Φτάσε combo x3", { valueMode: "max" }),
  O("deliver3", "deliver", 3, "Make 3 deliveries", "Κάνε 3 παραδόσεις"),
  O("power1", "powerup", 1, "Grab a power-up", "Πάρε ένα power-up"),
  O("nodive_coins", "coin", 6, "Collect 6 coins without diving", "6 νομίσματα χωρίς dive", { failOn: "dive" }),
];

const rr = (a, b, rnd = Math.random) => a + rnd() * (b - a);

export function initObjectives(world, rnd = Math.random) {
  world.objective = null;
  world.objectivesDone = 0;
  world.objectivesFailed = 0;
  world.nextObjectiveAtMeters = rr(OBJ.firstAtMeters[0], OBJ.firstAtMeters[1], rnd);
}

export function spawnObjective(world, ft, rnd = Math.random) {
  const def = OBJECTIVES[Math.floor(rnd() * OBJECTIVES.length)];
  const reward = Math.max(OBJ.rewardMin, Math.min(OBJ.rewardMax, Math.round(50 + world.score * 0.05)));
  world.objective = { ...def, progress: 0, reward, startMeters: world.score, endMeters: world.score + OBJ.windowMeters };
  if (ft) ft(`🎯 ${def.text.en}`, "banner");
}

function resolve(world, ok, ft, rnd) {
  const o = world.objective;
  if (!o) return;
  if (ok) {
    world.credits += o.reward;
    world.objectivesDone = (world.objectivesDone || 0) + 1;
    if (ft) ft(`🎯 OBJECTIVE ✓ +${o.reward}`, "score");
  } else {
    world.objectivesFailed = (world.objectivesFailed || 0) + 1;
    if (ft) ft("🎯 Objective failed", "near_miss");
  }
  world.objective = null;
  world.nextObjectiveAtMeters = world.score + rr(OBJ.everyMeters[0], OBJ.everyMeters[1], rnd);
}

// kind: nearmiss | deliver | coin | combo | powerup | dive
export function objectiveEvent(world, kind, value = 1, ft) {
  const o = world.objective;
  if (!o) return;
  if (kind === "dive") {
    if (o.failOn === "dive") resolve(world, false, ft);
    return;
  }
  if (o.kind !== kind) return;
  o.progress = o.valueMode === "max" ? Math.max(o.progress, value) : o.progress + value;
  if (o.progress >= o.target) resolve(world, true, ft);
}

// Call every frame: spawns the next objective / expires the current one.
export function tickObjectives(world, ft, enabled = true, rnd = Math.random) {
  if (!enabled || world.status !== "playing") return;
  const o = world.objective;
  if (o) {
    if (world.score >= o.endMeters) resolve(world, false, ft, rnd);
  } else if (world.score >= (world.nextObjectiveAtMeters || 0)) {
    spawnObjective(world, ft, rnd);
  }
}
