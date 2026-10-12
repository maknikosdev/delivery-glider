import React, { useMemo, memo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Line, Circle, Ellipse, Polygon, G } from "react-native-svg";
import { SCREEN } from "../constants/gameConfig";
import { getEnvironment } from "../game/environments";

// Layered, fully decorative background. Τίποτα εδώ δεν διαβάζεται από το
// useGameLoop.js, άρα δεν επηρεάζει collisions/δυσκολία.
// Δέχεται `env` (id περιβάλλοντος από game/environments.js) — 5 θέματα.
// Οι αργές layers είναι memo'd με στρογγυλοποιημένο offset (απόδοση, όπως πριν).

function makeRng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildSkyline({ seed, buildingCount, minH, maxH, color, opacity, shape }) {
  const rnd = makeRng(seed);
  const arr = [];
  let x = 0;
  for (let i = 0; i < buildingCount; i++) {
    const w = 40 + rnd() * 50;
    const h = minH + rnd() * (maxH - minH);
    arr.push({ x, w, h, v: rnd() });
    x += w + 10 + rnd() * 20;
  }
  return { arr, totalWidth: x, color, opacity, shape: shape || "tower" };
}

function buildStars(seed, count, maxY) {
  const rnd = makeRng(seed);
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      x: rnd() * SCREEN.width * 2.2,
      y: rnd() * maxY,
      r: 0.6 + rnd() * 1.3,
      baseOpacity: 0.4 + rnd() * 0.45,
    });
  }
  return { arr, totalWidth: SCREEN.width * 2.2 };
}

function buildTraffic(seed, count, colors) {
  const rnd = makeRng(seed);
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      x: rnd() * SCREEN.width * 2.2,
      y: SCREEN.height * (0.08 + rnd() * 0.3),
      speed: 8 + rnd() * 14,
      color: colors[i % colors.length],
      size: 5 + rnd() * 3,
    });
  }
  return { arr, totalWidth: SCREEN.width * 2.2 };
}

function buildHoloAds(seed, count, colors) {
  const rnd = makeRng(seed);
  const arr = [];
  let x = 200;
  for (let i = 0; i < count; i++) {
    const w = 46 + rnd() * 26;
    const h = 30 + rnd() * 16;
    arr.push({ x, y: SCREEN.height * (0.18 + rnd() * 0.22), w, h, color: colors[i % colors.length] });
    x += 360 + rnd() * 280;
  }
  return { arr, totalWidth: x };
}

function buildDust(seed, count, colors) {
  const rnd = makeRng(seed);
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      x: rnd() * SCREEN.width,
      seedY: rnd(),
      speed: 10 + rnd() * 18,
      r: 1 + rnd() * 1.6,
      drift: (rnd() - 0.5) * 14,
      color: rnd() > 0.5 ? colors[0] : colors[1],
    });
  }
  return arr;
}

// Σχήμα κτιρίου ανά περιβάλλον: tower | mesa | spire | mushroom | pylon
function skylineElements(layer, offset, keyPrefix, accent, reps = 2) {
  const w = layer.totalWidth;
  const H = SCREEN.height;
  const out = [];
  for (let rep = 0; rep < reps; rep++) {
    for (let i = 0; i < layer.arr.length; i++) {
      const b = layer.arr[i];
      const x0 = offset + rep * w + b.x;
      const k = `${keyPrefix}-${rep}-${i}`;
      const fill = layer.color;
      const op = layer.opacity;
      switch (layer.shape) {
        case "mesa": {
          const top = H - b.h;
          const inset = b.w * 0.18;
          out.push(
            <Polygon
              key={k}
              points={`${x0},${H} ${x0 + inset},${top} ${x0 + b.w - inset},${top} ${x0 + b.w},${H}`}
              fill={fill}
              opacity={op}
            />
          );
          if (i % 3 === 0) {
            out.push(<Line key={`${k}-g`} x1={x0 + inset} y1={top} x2={x0 + b.w - inset} y2={top} stroke={accent} strokeWidth={1.5} opacity={0.3} />);
          }
          break;
        }
        case "spire": {
          const top = H - b.h;
          out.push(
            <Polygon
              key={k}
              points={`${x0},${H} ${x0 + b.w * (0.4 + b.v * 0.2)},${top} ${x0 + b.w * 1.1},${H}`}
              fill={fill}
              opacity={op}
            />
          );
          if (i % 2 === 0) {
            const px = x0 + b.w * (0.4 + b.v * 0.2);
            out.push(
              <Polygon
                key={`${k}-cap`}
                points={`${px},${top} ${px - b.w * 0.14},${top + b.h * 0.14} ${px + b.w * 0.14},${top + b.h * 0.14}`}
                fill="#ffffff"
                opacity={0.35 * op}
              />
            );
          }
          break;
        }
        case "mushroom": {
          const top = H - b.h;
          const stemW = b.w * 0.28;
          const cx = x0 + b.w / 2;
          out.push(<Rect key={k} x={cx - stemW / 2} y={top + b.w * 0.25} width={stemW} height={b.h - b.w * 0.25} fill={fill} opacity={op} />);
          out.push(<Ellipse key={`${k}-c`} cx={cx} cy={top + b.w * 0.25} rx={b.w * 0.62} ry={b.w * 0.34} fill={fill} opacity={op} />);
          if (i % 3 === 0) {
            out.push(<Circle key={`${k}-g`} cx={cx - b.w * 0.2} cy={top + b.w * 0.22} r={2.2} fill={accent} opacity={0.5} />);
            out.push(<Circle key={`${k}-g2`} cx={cx + b.w * 0.22} cy={top + b.w * 0.28} r={1.8} fill={accent} opacity={0.5} />);
          }
          break;
        }
        case "pylon": {
          const top = H - b.h;
          const pw = b.w * 0.32;
          const cx = x0 + b.w / 2;
          out.push(<Rect key={k} x={cx - pw / 2} y={top} width={pw} height={b.h} fill={fill} opacity={op} />);
          out.push(<Rect key={`${k}-b`} x={cx - b.w * 0.5} y={top} width={b.w} height={5} fill={fill} opacity={op} />);
          if (i % 2 === 0) {
            out.push(<Circle key={`${k}-l`} cx={cx} cy={top - 3} r={2.2} fill={accent} opacity={0.7} />);
          }
          break;
        }
        default: {
          out.push(<Rect key={k} x={x0} y={H - b.h} width={b.w} height={b.h} fill={fill} opacity={op} />);
          if (i % 3 === 0) {
            out.push(
              <Line
                key={`${k}-g`}
                x1={x0 + b.w * 0.3}
                y1={H - b.h + 6}
                x2={x0 + b.w * 0.3}
                y2={H}
                stroke={accent}
                strokeWidth={1.5}
                opacity={0.25}
              />
            );
          }
        }
      }
    }
  }
  return out;
}

const StarsLayer = memo(function StarsLayer({ stars, offset, color }) {
  return (
    <G>
      {[0, 1].map((rep) =>
        stars.arr.map((s, i) => (
          <Circle key={`star-${rep}-${i}`} cx={offset + rep * stars.totalWidth + s.x} cy={s.y} r={s.r} fill={color} opacity={s.baseOpacity} />
        ))
      )}
    </G>
  );
});

// Μεγάλα ουράνια στοιχεία (ήλιος / σεληνιακό / aurora / πλανήτης). Πολύ αργή κίνηση.
const ExtraLayer = memo(function ExtraLayer({ kind, offset }) {
  const W = SCREEN.width;
  const H = SCREEN.height;
  const wrap = (x) => ((((x % (W + 240)) + (W + 240)) % (W + 240)) - 120);
  if (kind === "sun") {
    const cx = wrap(W * 0.72 + offset);
    const cy = H * 0.3;
    return (
      <G>
        <Circle cx={cx} cy={cy} r={120} fill="#ff7a2f" opacity={0.08} />
        <Circle cx={cx} cy={cy} r={86} fill="#ff9a45" opacity={0.14} />
        <Circle cx={cx} cy={cy} r={56} fill="#ffd27a" opacity={0.85} />
      </G>
    );
  }
  if (kind === "moon") {
    const cx = wrap(W * 0.25 + offset);
    const cy = H * 0.22;
    return (
      <G>
        <Circle cx={cx} cy={cy} r={64} fill="#b8ff3d" opacity={0.08} />
        <Circle cx={cx} cy={cy} r={38} fill="#e9ffc2" opacity={0.85} />
        <Circle cx={cx + 12} cy={cy - 6} r={34} fill="#06210f" opacity={0.55} />
      </G>
    );
  }
  if (kind === "planet") {
    const cx = wrap(W * 0.7 + offset);
    const cy = H * 0.3;
    return (
      <G>
        <Circle cx={cx} cy={cy} r={70} fill="#3b2f9e" opacity={0.9} />
        <Circle cx={cx - 14} cy={cy - 12} r={58} fill="#5b4be0" opacity={0.55} />
        <Circle cx={cx + 22} cy={cy + 14} r={50} fill="#03030f" opacity={0.35} />
        <Ellipse cx={cx} cy={cy} rx={118} ry={22} fill="none" stroke="#ff5ce1" strokeWidth={3} opacity={0.5} />
        <Ellipse cx={cx} cy={cy} rx={134} ry={26} fill="none" stroke="#4cc9ff" strokeWidth={1.5} opacity={0.4} />
      </G>
    );
  }
  if (kind === "aurora") {
    const bands = [
      { y: H * 0.14, c: "#2cffb0", o: 0.13 },
      { y: H * 0.22, c: "#6fe3ff", o: 0.1 },
      { y: H * 0.3, c: "#b28cff", o: 0.08 },
    ];
    return (
      <G>
        {bands.map((b, bi) => {
          const pts = [];
          const steps = 10;
          for (let s = 0; s <= steps; s++) {
            const x = (W / steps) * s;
            pts.push(`${x},${b.y + Math.sin(s * 0.9 + bi * 1.7 + offset * 0.01) * 22}`);
          }
          for (let s = steps; s >= 0; s--) {
            const x = (W / steps) * s;
            pts.push(`${x},${b.y + 46 + Math.sin(s * 0.7 + bi * 2.1 + offset * 0.01) * 18}`);
          }
          return <Polygon key={`au-${bi}`} points={pts.join(" ")} fill={b.c} opacity={b.o} />;
        })}
      </G>
    );
  }
  return null;
});

const MegaLayer = memo(function MegaLayer({ layer, offset, accent }) {
  return <G>{skylineElements(layer, offset, "mega", accent, 2)}</G>;
});

const FarLayer = memo(function FarLayer({ layer, offset, accent }) {
  return <G>{skylineElements(layer, offset, "far", accent, 2)}</G>;
});

const HoloAdsLayer = memo(function HoloAdsLayer({ holoAds, offset, bg }) {
  return (
    <G>
      {[0, 1].map((rep) =>
        holoAds.arr.map((a, i) => {
          const x = offset + rep * holoAds.totalWidth + a.x;
          return (
            <React.Fragment key={`holo-${rep}-${i}`}>
              <Rect x={x} y={a.y} width={a.w} height={a.h} rx={3} fill={bg} opacity={0.5} stroke={a.color} strokeWidth={1} strokeOpacity={0.5} />
              <Line x1={x + 6} y1={a.y + a.h * 0.35} x2={x + a.w - 6} y2={a.y + a.h * 0.35} stroke={a.color} strokeWidth={1.2} opacity={0.6} />
              <Line x1={x + 6} y1={a.y + a.h * 0.65} x2={x + a.w - 16} y2={a.y + a.h * 0.65} stroke={a.color} strokeWidth={1.2} opacity={0.4} />
            </React.Fragment>
          );
        })
      )}
    </G>
  );
});

const ROUND_STEP = 3;
const round = (v) => Math.round(v / ROUND_STEP) * ROUND_STEP;

export default function ParallaxBackground({ cameraX, env = "neon_city" }) {
  const now = Date.now();
  const E = getEnvironment(env);

  const stars = useMemo(() => buildStars(5, E.star.count, SCREEN.height * 0.62), [E]);
  const megastructure = useMemo(() => buildSkyline({ seed: 99, buildingCount: 5, minH: 560, maxH: 980, ...E.mega }), [E]);
  const far = useMemo(() => buildSkyline({ seed: 7, buildingCount: 16, minH: 120, maxH: 300, ...E.far }), [E]);
  const mid = useMemo(() => buildSkyline({ seed: 42, buildingCount: 14, minH: 180, maxH: 460, ...E.mid }), [E]);
  const near = useMemo(() => buildSkyline({ seed: 13, buildingCount: 10, minH: 220, maxH: 620, ...E.near }), [E]);
  const traffic = useMemo(() => buildTraffic(23, 4, E.traffic), [E]);
  const holoAds = useMemo(() => buildHoloAds(31, 3, E.holo), [E]);
  const dust = useMemo(() => buildDust(17, 10, E.dust), [E]);

  const starOffset = round(-((cameraX * 0.015) % stars.totalWidth));
  const megaOffset = round(-((cameraX * 0.04) % megastructure.totalWidth));
  const farOffset = round(-((cameraX * 0.08) % far.totalWidth));
  const holoOffset = round(-((cameraX * 0.22) % holoAds.totalWidth));
  const extraOffset = Math.round(-(cameraX * 0.01) / 6) * 6;

  const midOffset = -((cameraX * 0.22) % mid.totalWidth);
  const nearOffset = -((cameraX * 0.45) % near.totalWidth);
  const trafficOffset = -((cameraX * 0.12) % traffic.totalWidth);

  const SL_PERIOD = 14000;
  const SL_ACTIVE = 3500;
  const slPhase = now % SL_PERIOD;
  const slActive = slPhase < SL_ACTIVE;
  const slT = slPhase / SL_ACTIVE;
  const slFade = slActive ? Math.sin(Math.PI * Math.min(1, slT)) : 0;
  const slAngle = -35 + slT * 70;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: E.bg }]} />

      {E.fogs.map((f, i) => (
        <View key={`fog-${i}`} style={[styles.fogBand, { top: SCREEN.height * f.top, height: f.height, backgroundColor: f.color, opacity: f.opacity }]} />
      ))}

      <Svg width={SCREEN.width} height={SCREEN.height} style={StyleSheet.absoluteFill}>
        <StarsLayer stars={stars} offset={starOffset} color={E.star.color} />
        {E.extra ? <ExtraLayer kind={E.extra} offset={extraOffset} /> : null}
        <MegaLayer layer={megastructure} offset={megaOffset} accent={E.accent} />

        {[0, 1].map((rep) =>
          traffic.arr.map((t, i) => {
            const driftX = (now * t.speed) / 1000;
            const x = ((trafficOffset + rep * traffic.totalWidth + t.x + driftX) % (traffic.totalWidth * 2)) - traffic.totalWidth;
            return (
              <React.Fragment key={`traf-${rep}-${i}`}>
                <Line x1={x - 16} y1={t.y} x2={x - 4} y2={t.y} stroke={t.color} strokeWidth={1.4} opacity={0.35} />
                <Circle cx={x} cy={t.y} r={t.size * 0.5} fill={t.color} opacity={0.75} />
              </React.Fragment>
            );
          })
        )}

        <FarLayer layer={far} offset={farOffset} accent={E.accent} />
        <HoloAdsLayer holoAds={holoAds} offset={holoOffset} bg={E.holoBg} />

        {skylineElements(mid, midOffset, "mid", E.accent, 2)}
        {skylineElements(near, nearOffset, "near", E.accent, 2)}

        {slFade > 0.02 && (
          <Polygon
            points={`${SCREEN.width * 0.5},${SCREEN.height} ${SCREEN.width * 0.5 - 60},${-SCREEN.height} ${SCREEN.width * 0.5 + 60},${-SCREEN.height}`}
            fill={E.search}
            opacity={0.05 * slFade}
            transform={`rotate(${slAngle}, ${SCREEN.width * 0.5}, ${SCREEN.height})`}
          />
        )}

        {dust.map((d, i) => {
          const loopY = ((now / 1000) * d.speed + d.seedY * SCREEN.height) % (SCREEN.height + 40);
          const x = d.x + Math.sin(now / 1400 + i) * d.drift - cameraX * 0.05;
          const wrappedX = ((x % SCREEN.width) + SCREEN.width) % SCREEN.width;
          return <Circle key={`dust-${i}`} cx={wrappedX} cy={loopY - 20} r={d.r} fill={d.color} opacity={0.22} />;
        })}
      </Svg>

      <View style={[styles.horizonGlow, { backgroundColor: E.horizon }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  horizonGlow: { position: "absolute", left: 0, right: 0, bottom: 0, height: 3, opacity: 0.5 },
  fogBand: { position: "absolute", left: 0, right: 0 },
});
