// WINSLOW — "The medicine that put babies to sleep" — 9:16 720x1280 30fps, Hinglish VO.
// 8 scenes cut on sentence boundaries (see CUTS). The bottle is the antagonist; death is shown
// only as stillness, a stopped mobile, a dimming candle, and rows of candlelight.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, Easing, Audio, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Box, Cyl, Ball, CanvasPlane, Billboard, INK } from "../style/toon";
import { Look } from "../style/puppet";
import { Person, Lights, Desk, Sign, seg, lerp, clamp, V3, Grade } from "../style/kit";
import { Floor, WallDoor, SideWall, Glow, Plant, Shelf, Rug } from "../style/props";
import { Cam, Key, camAt, FaceGroup, HangLamp } from "../style/extra";
import { Captions } from "../Main";

const FPS = 30, LEAD = 6, TAIL = 8;
type Ctx = { t: number; f: number };
type Trans = "ghost" | "zoom" | "flash" | "whip";

/* ---------- cut list (seconds, from whisper sentence boundaries) ---------- */
const CUTS = [0, 12.12, 20.32, 30.78, 33.96, 39.54, 45.64, 48.9, 55.48, 61.83];
export const DURATION = 1855;

/* ---------- continuity looks ---------- */
const mother: Look = { skin: "#f2cbaa", body: "#5f6b45", outfit: "shirt", hair: "bob", hairColor: "#6a3a1e", shoe: "#3a2418" };
const pharmacist: Look = { skin: "#e8c3a0", body: "#efe9da", outfit: "shirt", hair: "grey", glasses: true, shoe: "#2a2018" };
const clerk: Look = { skin: "#e0b48c", body: "#3f5a6b", outfit: "shirt", hair: "short", hairColor: "#1b1b2a", hat: "#2b3350", shoe: "#1b1b2a" };
const gov: Look = { skin: "#f1d0b0", body: "#242433", outfit: "suit", tie: "#7a2a1e", hair: "swept", hairColor: "#c9c9d2", shoe: "#0b0d1a" };

/* ---------- scene wrapper (opacity / zoom / flash / whip) ---------- */
const Scene: React.FC<{ start: number; end: number; first?: boolean; trans?: Trans; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ start, end, first, trans = "ghost", bg, children }) => {
  const from = Math.round(start * FPS) - (first ? 0 : LEAD), dur = Math.round(end * FPS) - from + TAIL;
  return <Sequence from={from} durationInFrames={dur} layout="none"><Inner from={from} first={first} trans={trans} bg={bg} children={children} /></Sequence>;
};
const Inner: React.FC<{ from: number; first?: boolean; trans: Trans; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ from, first, trans, bg, children }) => {
  const f = useCurrentFrame(), t = (f + from) / FPS;
  const k = first ? 1 : clamp(f / (LEAD + 2)), ke = Easing.out(Easing.cubic)(k);
  const sc = !first && trans === "zoom" ? lerp(1.32, 1, ke) : 1;
  const tx = !first && trans === "whip" ? (1 - ke) * 620 : 0, blur = !first && trans === "whip" ? (1 - ke) * 12 : 0;
  return (
    <AbsoluteFill style={{ opacity: first || trans === "flash" || trans === "whip" ? 1 : k, transform: `translateX(${tx}px) scale(${sc})`, background: bg, filter: `saturate(1.12) contrast(1.05) brightness(1.0)${blur > 0.2 ? ` blur(${blur.toFixed(1)}px)` : ""}` }}>
      <ThreeCanvas width={720} height={1280} camera={{ fov: 60, position: [0, 2, 8], near: 0.1, far: 200 }} gl={{ antialias: true }}>
        <color attach="background" args={[bg]} />{children({ t, f })}
      </ThreeCanvas>
      {!first && trans === "flash" ? <AbsoluteFill style={{ background: "#fff", opacity: 1 - clamp(f / 7) }} /> : null}
    </AbsoluteFill>
  );
};

const yawTo = (cam: V3, p: V3) => Math.atan2(cam[0] - p[0], cam[2] - p[2]);
const toWorld = (p: V3, loc: V3, cam: V3): V3 => { const y = yawTo(cam, p); return [p[0] + loc[0] * Math.cos(y) + loc[2] * Math.sin(y), p[1] + loc[1], p[2] - loc[0] * Math.sin(y) + loc[2] * Math.cos(y)]; };
const K = (t0: number, ks: Key[]): Key[] => ks.map((k) => ({ ...k, t: k.t + t0 }));

/* ================= shared props ================= */

// amber bottle, cream label, cork. Same proportions everywhere.
const Bottle: React.FC<{ p: V3; s?: number; label?: boolean; lx?: number; ly?: number }> = ({ p, s = 1, label = true, lx = 0.52, ly = 0.7 }) => (
  <group position={p} scale={s}>
    <Cyl p={[0, 0.62, 0]} rt={0.29} rb={0.33} h={1.24} color="#6a3c12" line={3} />
    <Cyl p={[0, 1.27, 0]} rt={0.14} rb={0.22} h={0.3} color="#6a3c12" line={2} />
    <Cyl p={[0, 1.46, 0]} rt={0.155} h={0.14} color="#c9a06a" line={2} />
    <Cyl p={[0, 1.56, 0]} rt={0.12} h={0.1} color="#b8834a" line={2} />
    {label ? <CanvasPlane p={[0, 0.62, 0.305]} s={[lx, ly]} px={[200, 270]} frame="#3a2410" draw={(c, W, H) => {
      c.fillStyle = "#efe2c4"; c.fillRect(0, 0, W, H);
      c.strokeStyle = "#2f4a2a"; c.lineWidth = 7; c.strokeRect(7, 7, W - 14, H - 14);
      c.fillStyle = "#2f4a2a"; c.textAlign = "center";
      c.font = "700 20px Georgia, serif"; c.fillText("MRS. WINSLOW'S", W / 2, 48);
      c.fillStyle = "#1c2a1c"; c.font = "900 40px Georgia, serif"; c.fillText("SOOTHING", W / 2, 104); c.fillText("SYRUP", W / 2, 146);
      c.strokeStyle = "#2f4a2a"; c.lineWidth = 3; c.beginPath(); c.moveTo(34, 168); c.lineTo(W - 34, 168); c.stroke();
      c.fillStyle = "#7a2a1e"; c.font = "900 34px Georgia, serif"; c.fillText("1849", W / 2, 212);
      c.fillStyle = "#2f4a2a"; c.font = "700 14px Georgia, serif"; c.fillText("PERFECTLY HARMLESS", W / 2, 246);
    }} /> : null}
  </group>
);

const Spoon: React.FC<{ p: V3; rot?: V3; s?: number; fill?: number }> = ({ p, rot = [0, 0, 0], s = 1, fill = 0 }) => (
  <group position={p} rotation={rot} scale={s}>
    <Cyl p={[0.33, 0, 0]} rt={0.022} h={0.6} color="#cfd6de" line={1} rot={[0, 0, Math.PI / 2]} />
    <Ball p={[-0.02, 0, 0]} r={0.095} color="#cfd6de" s={[1, 0.32, 0.7]} ink={0.012} />
    {fill > 0 ? <Ball p={[-0.02, 0.03, 0]} r={0.072 * fill} color="#2a1204" s={[1, 0.5, 0.78]} ink={0} /> : null}
  </group>
);

const Candle: React.FC<{ p: V3; dim?: number; h?: number; s?: number }> = ({ p, dim = 1, h = 0.55, s = 1 }) => (
  <group position={p} scale={s}>
    <Cyl p={[0, h / 2, 0]} rt={0.085} rb={0.095} h={h} color="#efe6cf" line={2} />
    <Ball p={[0, h + 0.07, 0]} r={0.07 * (0.35 + 0.65 * dim)} color="#ffcf5a" ink={0.012} />
    <Glow p={[0, h + 0.08, 0]} r={1.15 * (0.35 + 0.65 * dim)} color="rgba(255,190,80,1)" o={0.12 + 0.5 * dim} />
  </group>
);

const Crib: React.FC<{ p: V3; w?: number }> = ({ p, w = 3.0 }) => {
  const half = w / 2;
  return (<group position={p}>
    {[-half + 0.1, half - 0.1].map((x) => [-0.62, 0.62].map((z) => <Box key={`${x}${z}`} p={[x, 0.5, z]} s={[0.14, 1.0, 0.14]} color="#5a3a1e" line={3} />))}
    {[-0.66, 0.66].map((z) => <React.Fragment key={z}>
      <Box p={[0, 1.0, z]} s={[w, 0.1, 0.09]} color="#6b4423" line={2} />
      <Box p={[0, 1.44, z]} s={[w, 0.1, 0.09]} color="#7a4a2a" line={2} />
      {Array.from({ length: 9 }, (_, i) => <Box key={i} p={[-half + 0.3 + i * ((w - 0.6) / 8), 1.22, z]} s={[0.05, 0.38, 0.05]} color="#7a4a2a" line={1} />)}
    </React.Fragment>)}
    <Box p={[0, 0.62, 0]} s={[w - 0.1, 0.1, 1.2]} color="#4a2c18" line={2} />
    <Box p={[0, 1.05, 0]} s={[w - 0.24, 0.16, 1.1]} color="#b9c8ce" line={2} />
    <Box p={[0, 1.14, 0]} s={[w - 0.3, 0.05, 1.0]} color="#d8e2e6" line={1} />
    <Box p={[-half - 0.05, 1.15, 0]} s={[0.16, 1.5, 1.4]} color="#6b4423" line={3} />
    <Box p={[half + 0.05, 1.15, 0]} s={[0.16, 1.5, 1.4]} color="#6b4423" line={3} />
    <Ball p={[-half + 0.35, 1.24, 0]} r={0.14} color="#efe3c8" ink={0.012} />
  </group>);
};

// baby seen as a swaddled bundle; `sleep` 0..1 closes the eyes, `cry` 0..1 opens the mouth
const Baby: React.FC<{ c: V3; h?: number; sleep?: number; cry?: number; breathe?: number }> = ({ c, h = 1.15, sleep = 0, cry = 0, breathe = 0 }) => (
  <group position={[c[0], c[1], c[2]]} scale={[1, 1 + breathe * 0.02, 1]}>
    <Billboard p={[0, -h * 0.483, 0]} h={h} draw={(g, W, H) => {
      g.clearRect(0, 0, W, H);
      const cy = H / 2, cx = W / 2;
      // blanket
      g.save(); g.translate(cx + 18, cy + 46); g.rotate(-0.05);
      g.fillStyle = "#efe3c8"; g.strokeStyle = INK; g.lineWidth = 10;
      g.beginPath(); g.ellipse(0, 0, 178, 108, 0, 0, 7); g.fill(); g.stroke();
      g.strokeStyle = "rgba(120,90,50,.45)"; g.lineWidth = 6;
      for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(-120 + i * 46, -70); g.quadraticCurveTo(-96 + i * 46, 0, -118 + i * 46, 76); g.stroke(); }
      g.restore();
      // head
      const hx = cx - 92, hy = cy - 22, hr = 66;
      g.fillStyle = "#f2cbaa"; g.strokeStyle = INK; g.lineWidth = 9;
      g.beginPath(); g.arc(hx, hy, hr, 0, 7); g.fill(); g.stroke();
      // tuft
      g.strokeStyle = "#6a3a1e"; g.lineWidth = 7; g.lineCap = "round";
      g.beginPath(); g.moveTo(hx - 14, hy - hr + 4); g.quadraticCurveTo(hx - 8, hy - hr - 22, hx + 10, hy - hr - 6); g.stroke();
      // face
      g.strokeStyle = INK; g.lineWidth = 5;
      const eye = (x: number) => { if (sleep > 0.5) { g.beginPath(); g.arc(x, hy + 2, 15, 0.15, Math.PI - 0.15); g.stroke(); } else { g.fillStyle = "#fff"; g.beginPath(); g.arc(x, hy, 12, 0, 7); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(x, hy + 1, 5, 0, 7); g.fill(); } };
      eye(hx - 22); eye(hx + 22);
      // cheeks
      g.fillStyle = "rgba(232,120,110,.35)"; g.beginPath(); g.arc(hx - 36, hy + 24, 13, 0, 7); g.fill(); g.beginPath(); g.arc(hx + 30, hy + 24, 13, 0, 7); g.fill();
      // mouth
      if (cry > 0.3) { g.fillStyle = "#5a1a1a"; g.beginPath(); g.ellipse(hx, hy + 40, 12, 16, 0, 0, 7); g.fill(); g.stroke(); }
      else { g.beginPath(); g.arc(hx, hy + 32, 13, 0.25, Math.PI - 0.25); g.stroke(); }
      // little hand on the blanket
      g.fillStyle = "#f2cbaa"; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.arc(cx + 86, cy + 6, 17, 0, 7); g.fill(); g.stroke();
    }} />
  </group>
);

const Mobile: React.FC<{ p: V3; spin: number; dim?: number }> = ({ p, spin, dim = 1 }) => (
  <group position={p}>
    <Cyl p={[0, 1.7, 0]} rt={0.018} h={3.4} color="#c9a06a" line={1} />
    <group position={[0, 0, 0]} rotation={[0, spin, 0]}>
      <Box p={[0, 0, 0]} s={[1.5, 0.045, 0.045]} color="#c9a06a" line={2} />
      <Box p={[0, 0, 0]} s={[0.045, 0.045, 1.5]} color="#c9a06a" line={2} />
      {[0, 1, 2, 3].map((i) => { const a = i * Math.PI / 2, x = Math.cos(a) * 0.72, z = Math.sin(a) * 0.72; return (
        <group key={i} position={[x, 0, z]}>
          <Cyl p={[0, -0.22, 0]} rt={0.008} h={0.44} color="#c9a06a" line={1} />
          {i % 2 === 0 ? <Ball p={[0, -0.5, 0]} r={0.11} color={i ? "#e5b43a" : "#7fb0d8"} ink={0.012} /> : <Box p={[0, -0.5, 0]} s={[0.18, 0.18, 0.05]} rot={[0, 0, 0.6]} color="#e5b43a" line={2} />}
        </group>); })}
    </group>
    <Glow p={[0, 0.2, 0]} r={2.2} color="rgba(255,220,150,1)" o={0.1 * dim} />
  </group>
);

// nursery shell shared by S1 and S4
const Nursery: React.FC<{ warm?: number; candleDim: number; motherP?: V3; children?: React.ReactNode }> = ({ candleDim, motherP, children }) => (
  <>
    <Lights warm="#ffd9b0" />
    <Floor kind="plank" a="#6b4326" b="#5c3a20" unit={2.4} w={26} d={26} />
    <WallDoor z={-7} W={26} kind="wood" a="#7a4a2a" b="#6b3f22" base="#3a2414" door={{ x: 4.4, w: 2.2, h: 4.0 }} />
    <SideWall x={-9} kind="wood" a="#6b3f22" b="#5c361c" />
    <CanvasPlane p={[3.6, 4.3, -6.9]} s={[2.6, 3.4]} px={[320, 420]} frame="#3a2414" draw={(c, W, H) => {
      c.fillStyle = "#101a3a"; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(255,250,220,${0.35 + 0.5 * ((i * 37) % 10) / 10})`; c.beginPath(); c.arc((i * 97) % W, (i * 53) % H, 1.6 + (i % 3), 0, 7); c.fill(); }
      c.fillStyle = "#f5edc8"; c.beginPath(); c.arc(W * 0.66, H * 0.24, 44, 0, 7); c.fill();
      c.fillStyle = "#101a3a"; c.beginPath(); c.arc(W * 0.74, H * 0.21, 38, 0, 7); c.fill();
      c.strokeStyle = "#3a2414"; c.lineWidth = 12; c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, H); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.stroke();
      c.strokeStyle = "#3a2414"; c.lineWidth = 14; c.strokeRect(4, 4, W - 8, H - 8);
    }} />
    <Rug p={[-0.4, 0, -1.6]} s={[5.4, 4.0]} a="#7a3a30" b="#c9a06a" />
    <Crib p={[-0.7, 0, -2.3]} w={3.0} />
    <group position={[2.95, 0, -3.6]}>
      <Box p={[0, 0.45, 0]} s={[1.1, 0.9, 1.0]} color="#5a3a1e" line={3} />
      <Box p={[0, 0.92, 0]} s={[1.2, 0.08, 1.1]} color="#7a4a2a" line={2} />
      <Candle p={[0, 0.96, 0.1]} dim={candleDim} h={0.6} s={1.1} />
    </group>
    <CanvasPlane p={[-3.4, 3.2, -6.9]} s={[1.4, 1.1]} px={[220, 180]} frame="#c9a06a" draw={(c, W, H) => {
      c.fillStyle = "#8fb0c8"; c.fillRect(0, 0, W, H); c.fillStyle = "#c9a06a"; c.beginPath(); c.arc(W * 0.7, H * 0.3, H * 0.14, 0, 7); c.fill();
      c.fillStyle = "#3a6a4a"; c.beginPath(); c.moveTo(0, H); c.lineTo(W * 0.3, H * 0.45); c.lineTo(W * 0.55, H * 0.8); c.lineTo(W * 0.78, H * 0.6); c.lineTo(W, H); c.fill();
    }} />
    <Plant p={[-3.9, 0, -5.6]} s={1.1} pot="#8a5a32" />
    {motherP ? <Person p={motherP} h={3.3} look={mother} f={0} pose={{ mood: "worry" }} /> : null}
    {children}
  </>
);

/* ================= S1 — teaspoon, 0 – 12.12 ================= */
const K1 = K(CUTS[0], [
  { t: 0.0, pos: [1.55, 2.95, 3.3], look: [-0.62, 2.0, -2.6], fov: 62 },
  { t: 3.2, pos: [1.15, 2.9, 2.6], look: [-0.6, 1.95, -2.6], fov: 58 },
  { t: 6.4, pos: [0.8, 2.85, 2.05], look: [-0.62, 1.9, -2.6], fov: 54 },
  { t: 9.4, pos: [0.62, 2.8, 1.7], look: [-0.65, 2.05, -2.5], fov: 50 },
  { t: 12.6, pos: [0.55, 2.78, 1.5], look: [-0.67, 2.15, -2.45], fov: 48 },
]);
const S1 = ({ t, f }: Ctx) => {
  const u = t - CUTS[0];
  const mp: V3 = [-0.7, 0, -3.85];
  const quiet = seg(u, 5.0, 5.8);
  const slept = seg(u, 9.4, 10.6);
  const stand = seg(u, 7.0, 9.4, Easing.inOut(Easing.cubic));
  const spin = 2.8 * u * (1 - seg(u, 10.2, 11.9, Easing.out(Easing.cubic)));
  const candle = 1 - 0.72 * seg(u, 10.3, 12.4, Easing.inOut(Easing.sin));
  const armR: [number, number] = [lerp(-0.16, -0.13, stand), lerp(0.46, 0.5, stand)];
  // spoon: lifted out of the bottle (2.1 s), carried to the mouth, withdrawn
  const lift = seg(u, 2.0, 2.75, Easing.out(Easing.cubic));
  const feed = seg(u, 3.0, 4.4, Easing.inOut(Easing.cubic));
  const out = seg(u, 4.95, 5.7, Easing.in(Easing.cubic));
  const sx = lerp(lerp(lerp(-2.45, -2.3, lift), -1.3, feed), -2.5, out);
  const sy = lerp(lerp(lerp(0.95, 1.66, lift), 1.6, feed), 2.0, out);
  const sz = -1.42;
  const fill = seg(u, 2.15, 2.95);
  return (<> 
    <Cam t={t} keys={K1} />
    <Nursery candleDim={candle}>
      <Baby c={[-1.0, 1.5, -2.3]} h={1.7} sleep={slept} cry={1 - quiet} breathe={u > 5 ? 1 : 0.2} />
      <group position={[mp[0], 0, mp[2]]}>
        <Person p={[0, 0, 0]} h={3.3} look={mother} f={f} pose={{
          mood: u < 5.0 ? "worry" : u < 7.0 ? "smile" : slept > 0.4 ? "shock" : "deadpan",
          nerv: u < 5 ? 0.3 : 0, hunch: lerp(0.52, 0.16, stand), lookX: lerp(-0.55, -0.3, stand), tilt: -0.06,
          arms: u > 9.4 ? "chest" : undefined, armR: u < 7.0 ? armR : [-0.1, 0.5], armLK: 0.6, armL: [-0.24, 0.46],
        }} />
      </group>
      {u < 5.8 ? <Spoon p={[sx, sy, sz]} rot={[0.05, 0.06, 3.0]} s={1.5} fill={fill} /> : null}
      <Mobile p={[-0.7, 3.45, -2.3]} spin={spin} dim={candle} />
    </Nursery>
  </>);
};

/* ================= S2 — the advertisement, 12.12 – 20.32 ================= */
const K2 = K(CUTS[1], [
  { t: 0.0, pos: [3.6, 3.3, 5.6], look: [0.4, 3.9, -6.4], fov: 48 },
  { t: 2.6, pos: [2.4, 2.9, 4.4], look: [0.5, 3.2, -5.0], fov: 46 },
  { t: 5.2, pos: [1.5, 2.4, 3.0], look: [0.5, 2.1, -2.6], fov: 44 },
  { t: 7.4, pos: [0.9, 1.9, 1.1], look: [0.55, 1.6, -2.45], fov: 40 },
  { t: 8.2, pos: [0.4, 1.7, 0.3], look: [0.5, 1.4, -2.4], fov: 38 },
]);
const S2 = ({ t, f }: Ctx) => {
  const u = t - CUTS[1];
  return (
    <>
      <Cam t={t} keys={K2} />
      <Lights warm="#ffe8c0" />
      <Floor kind="plank" a="#4a3222" b="#402b1d" unit={2.2} w={26} d={26} />
      <WallDoor z={-6} W={26} kind="wood" a="#3a2414" b="#331e12" base="#1d1410" />
      <SideWall x={-8} kind="wood" a="#331e12" b="#2c1a10" />
      {/* pharmacy counter */}
      <Desk p={[0, 0, -1.9]} w={6} d={2.4} h={1.1} top="#5a3a1e" leg="#4a2c18" />
      {/* the bottle */}
      <Bottle p={[0, 1.1, -1.75]} s={1.25} />
      {/* morphine & alcohol jars */}
      <group position={[-1.8, 1.62, -1.36]} rotation={[0, 0.25, 0]}>
        <Ball p={[0, 0, 0]} r={0.13} color="#f2cbaa" ink={0.012} />
        {[-0.075, -0.025, 0.025, 0.075].map((dy) => <Cyl key={dy} p={[0.12, dy, 0.01]} rt={0.032} h={0.26} color="#f2cbaa" line={1} rot={[0, 0, Math.PI / 2]} />)}
        <Cyl p={[0.03, -0.13, 0.02]} rt={0.036} h={0.2} color="#f2cbaa" line={1} rot={[0.25, 0, 0.95]} />
      </group>
      <Sign p={[-3.1, 3.3, -5.5]} s={[2.0, 0.9]} text="TEETHING" bg="#efe2c4" fg="#7a2a1e" size={64} frame="#3a2410" />
      <Sign p={[3.1, 3.3, -5.5]} s={[2.0, 0.9]} text="COLIC" bg="#efe2c4" fg="#7a2a1e" size={64} frame="#3a2410" />
      {/* pharmacist */}
      <group position={[1.85, 0, -4.0]}>
        <Person p={[0, 0, 0]} h={3.3} look={pharmacist} f={f} pose={{ mood: "smile", arms: u < 3.6 ? "point" : "hold", armRK: 0.8, armR: [0.24, 0.72], lookX: lerp(-0.9, 0.2, seg(u, 3.2, 4.2)), hunch: 0.08 }} />
      </group>
      {/* label close-up inside bottle */}
      <CanvasPlane p={[1.3, 1.2, 1.0]} rot={[0, -0.36, 0]} s={[1.9, 1.2]} px={[420, 270]} frame="#2a1406" draw={(c, W, H) => {
        c.fillStyle = "#efe2c4"; c.fillRect(0, 0, W, H);
        c.strokeStyle = "#2f4a2a"; c.lineWidth = 5; c.strokeRect(5, 5, W - 10, H - 10);
        c.fillStyle = "#2f4a2a"; c.textAlign = "center";
        c.font = "700 18px Georgia, serif"; c.fillText("MORPHINE", W / 2, 42);
        c.font = "700 18px Georgia, serif"; c.fillText("ALCOHOL", W / 2, 76);
        c.fillStyle = "#7a2a1e"; c.font = "900 28px Georgia, serif"; c.fillText("65 mg / fl oz", W / 2, 120);
        c.fillStyle = "#1c2a1c"; c.font = "700 16px Georgia, serif"; c.fillText("PERFECTLY HARMLESS", W / 2, 154);
      }} />
      <HangLamp p={[-2.8, 4.2, -2.8]} h={2.4} color="#ffd68a" />
    </>
  );
};

/* ================= S3 — factory of sleep, 20.32 – 30.78 ================= */
const K3 = K(CUTS[2], [
  { t: 0.0, pos: [0.3, 2.9, 10.2], look: [0.0, 2.1, -0.6], fov: 58 },
  { t: 5.0, pos: [0.2, 2.6, 9.0], look: [0.0, 2.1, -0.6], fov: 55 },
  { t: 10.6, pos: [0.0, 2.35, 7.8], look: [0.0, 2.05, -0.6], fov: 52 },
]);
const S3 = ({ t, f }: Ctx) => {
  const u = t - CUTS[2];
  const convey = u * 1.8;
  return (
    <>
      <Cam t={t} keys={K3} />
      <Lights warm="#2a2a3a" />
      <Floor kind="concrete" a="#1a1a2a" b="#141422" unit={3} w={30} d={60} />
      {/* conveyor */}
      <Box p={[0, 0.15, -20 + convey % 6]} s={[4, 0.3, 120]} color="#14141a" line={2} />
      <Box p={[-2.2, 0.45, -20 + convey % 6]} s={[0.3, 0.6, 120]} color="#2a2a3a" line={1} />
      <Box p={[2.2, 0.45, -20 + convey % 6]} s={[0.3, 0.6, 120]} color="#2a2a3a" line={1} />
      {/* bottles on conveyor */}
      {Array.from({ length: 40 }, (_, i) => {
        const z = -18 + (i * 3 + convey) % 120 - 60;
        if (z > -65 && z < 5) {
          return (
            <group key={i} position={[0, 0.6, z]}>
              <Bottle p={[0, 0, 0]} s={0.7} label={false} />
              {u > 3 + i * 0.1 ? <CanvasPlane p={[0, 0.6, 0.35]} s={[0.35, 0.45]} px={[100, 130]} draw={(c, W, H) => { c.fillStyle = "#fff0"; }} /> : null}
            </group>
          );
        }
        return null;
      })}
      {/* blank labels fluttering */}
      {Array.from({ length: 12 }, (_, i) => {
        const phase = u * 1.2 + i * 0.5;
        const z = -10 + Math.sin(phase) * 8;
        const x = -3 + Math.cos(phase * 0.7) * 2.5;
        return (
          <CanvasPlane key={i} p={[x, 2.2 + Math.sin(phase * 1.3) * 0.8, z]} s={[0.8, 0.6]} px={[160, 120]} rot={[Math.sin(phase) * 0.3, 0, Math.cos(phase) * 0.3]} draw={(c, W, H) => { c.fillStyle = "#fff8"; c.fillRect(0, 0, W, H); c.strokeStyle = "#8888"; c.lineWidth = 2; c.strokeRect(2, 2, W - 4, H - 4); }} />
        );
      })}
      {/* 1.5M crates */}
      <CanvasPlane p={[-10, 3, -30]} s={[6, 4]} px={[600, 400]} frame="#2a2a3a" draw={(c, W, H) => {
        c.fillStyle = "#2a2a3a"; c.fillRect(0, 0, W, H);
        c.fillStyle = "#7a2a1e"; c.font = "900 80px Georgia, serif"; c.textAlign = "center"; c.fillText("1.5 MILLION", W / 2, H / 2);
        c.fillStyle = "#555"; c.font = "700 28px Georgia, serif"; c.fillText("BOTTLES / YEAR", W / 2, H / 2 + 100);
      }} />
      <HangLamp p={[0, 5.5, -25]} h={3.5} color="#ffd68a" />
      <HangLamp p={[0, 5.5, -5]} h={3.5} color="#ffd68a" />
    </>
  );
};

/* ================= S4 — the law, 30.78 – 33.96 ================= */
const K4 = K(CUTS[3], [
  { t: 0.0, pos: [0.75, 4.3, 2.7], look: [-0.35, 1.4, -2.4], fov: 46 },
  { t: 3.0, pos: [0.5, 4.0, 2.0], look: [-0.45, 1.36, -2.4], fov: 44 },
]);
const S4 = ({ t, f }: Ctx) => {
  const u = t - CUTS[3];
  const stamp = seg(u, 1.2, 2.0, Easing.out(Easing.back()));
  const ink = seg(u, 1.5, 2.5, Easing.out(Easing.cubic));
  return (
    <>
      <Cam t={t} keys={K4} />
      <Lights warm="#ffd080" />
      <Floor kind="plank" a="#2a1a10" b="#1a1008" unit={2} w={26} d={26} />
      {/* label being stamped */}
      <CanvasPlane p={[0, 1.2, -1.5]} s={[1.8, 1.2]} px={[360, 240]} frame="#2a1a10" draw={(c, W, H) => {
        c.fillStyle = "#efe2c4"; c.fillRect(0, 0, W, H);
        c.strokeStyle = "#2f4a2a"; c.lineWidth = 5; c.strokeRect(5, 5, W - 10, H - 10);
        c.fillStyle = "#2f4a2a"; c.textAlign = "center";
        c.font = "700 24px Georgia, serif"; c.fillText("MORPHINE", W / 2, 52);
        c.font = "900 48px Georgia, serif"; c.fillText("65 mg", W / 2, 116);
        if (ink > 0.3) {
          c.fillStyle = `rgba(122,42,30,${ink})`; c.font = "900 120px Georgia, serif"; c.textAlign = "center";
          c.save(); c.translate(W / 2, H / 2); c.rotate(-0.15); c.fillText("1906", 0, 30); c.restore();
        }
      }} />
      {/* stamp */}
      <group position={[0, 2.5 + (1 - stamp) * 1.5, -1.5]} rotation={[-0.1, 0, 0]}>
        <Cyl p={[0, 0, 0]} rt={0.3} h={0.4} color="#3a2a1a" line={3} />
        <Cyl p={[0, 0.2, 0]} rt={0.28} h={0.1} color="#7a2a1e" line={2} />
      </group>
    </>
  );
};

/* ================= S5 — labels & candles, 33.96 – 39.54 ================= */
const K5 = K(CUTS[4], [
  { t: 0.0, pos: [0.85, 2.2, 2.5], look: [0.0, 1.55, -1.75], fov: 42 },
  { t: 3.2, pos: [1.25, 2.4, 3.4], look: [-0.1, 1.9, -2.6], fov: 44 },
  { t: 6.1, pos: [1.9, 2.7, 4.5], look: [-0.3, 2.5, -4.0], fov: 46 },
]);
const S5 = ({ t, f }: Ctx) => {
  const u = t - CUTS[4];
  return (
    <>
      <Cam t={t} keys={K5} />
      <Lights warm="#1a1a2a" />
      <Floor kind="concrete" a="#14141a" b="#0e0e14" unit={3} w={30} d={60} />
      {/* candle rows */}
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 12 }, (_, col) => {
          const z = -25 + col * 4;
          const x = -11 + row * 5;
          const dim = 1 - seg(u, row * 0.8, 3 + row * 0.8, Easing.in(Easing.cubic));
          return <Candle key={`${row}-${col}`} p={[x, 0.3, z]} dim={dim} h={0.4} s={0.7} />;
        })
      )}
      {/* Hazaaron text */}
      <CanvasPlane p={[0, 3.5, -5]} s={[4, 1.5]} px={[800, 300]} draw={(c, W, H) => {
        c.fillStyle = "#0e0e14"; c.fillRect(0, 0, W, H);
        c.fillStyle = "#ffcf5a"; c.font = "900 72px Georgia, serif"; c.textAlign = "center";
        c.fillText("हज़ारों", W / 2, H / 2 - 40);
        c.fillStyle = "#fff8"; c.font = "700 48px Georgia, serif";
        c.fillText("mothers lost their babies", W / 2, H / 2 + 50);
      }} />
    </>
  );
};

/* ================= S6 — 1906 act, 39.54 – 45.64 ================= */
const K6 = K(CUTS[5], [
  { t: 0.0, pos: [0.85, 2.2, 2.5], look: [0.0, 1.55, -1.75], fov: 42 },
  { t: 3.2, pos: [1.25, 2.4, 3.4], look: [-0.1, 1.9, -2.6], fov: 44 },
  { t: 6.1, pos: [1.9, 2.7, 4.5], look: [-0.3, 2.5, -4.0], fov: 46 },
]);
const MEM0 = CUTS[5] + 6.1;
const K6b = K(MEM0, [
  { t: 0.0, pos: [-2.2, 1.15, 3.2], look: [0.2, 0.55, -3.2], fov: 52 },
  { t: 3.2, pos: [-0.6, 2.5, 4.6], look: [0.0, 0.2, -4.4], fov: 54 },
]);
const S6 = ({ t, f }: Ctx) => {
  const u = t - CUTS[5];
  const mem = t >= MEM0;
  const apply = seg(u, 0.5, 3.0, Easing.out(Easing.cubic));
  const gone = seg(u, 4.0, 6.1, Easing.in(Easing.cubic));
  return (
    <>
      {mem ? <Cam t={t} keys={K6b} /> : <Cam t={t} keys={K6} />}
      <Lights warm="#ffd080" />
      <Floor kind="wood" a="#4a3222" b="#402b1d" unit={2.2} w={26} d={26} />
      <WallDoor z={-4.4} W={26} kind="wood" a="#33251c" b="#2c2018" base="#1d1410" />
      <Desk p={[0, 0, -1.9]} w={6} d={2.4} h={1.1} top="#5a3a1e" leg="#4a2c18" />
      <Bottle p={[0, 1.1, -1.75]} s={1.25} />
      {/* new, honest label */}
      <CanvasPlane p={[0, 1.72, -1.2 + 0.462 * apply]} s={[0.9 * apply + 0.001, 1.2]} px={[240, 320]} frame="#3a2410" draw={(c, W, H) => {
        c.fillStyle = "#f2e8cf"; c.fillRect(0, 0, W, H); c.strokeStyle = "#7a2a1e"; c.lineWidth = 7; c.strokeRect(7, 7, W - 14, H - 14);
        c.fillStyle = "#7a2a1e"; c.textAlign = "center";
        c.font = "900 28px Georgia, serif"; c.fillText("CONTAINS", W / 2, 52);
        c.font = "900 48px Georgia, serif"; c.fillText("MORPHINE", W / 2, 116);
        c.fillStyle = "#1c2a1c"; c.font = "700 20px Georgia, serif"; c.fillText("65 mg / fl oz", W / 2, 172);
        c.fillStyle = "#5a1a1a"; c.font = "900 24px Georgia, serif"; c.fillText("NOT FOR INFANTS", W / 2, 220);
      }} />
      {/* other medicines */}
      {[-2.6, -1.5, 1.5, 2.6].map((x, i) => <Bottle key={x} p={[x, 1.23, -1.9]} s={0.95} />)}
      {[-2.8, -1.9, 0.4, 1.2, 2.4].map((x, i) => <Cyl key={x} p={[x, 2.55, -1.9]} rt={0.17} h={0.6} color={["#cfd6de", "#d8b45a", "#c9d6c0"][i % 3]} line={2} />)}
      {/* the bottle stays */}
      <group position={[0, 1.23, -1.55]}>
        <Bottle p={[0, 0, 0]} s={1.15} />
        <Glow p={[0, 0.7, 0.1]} r={1.5} color="rgba(255,200,120,1)" o={0.2} />
      </group>
      {/* the morphine jar leaves */}
      <group position={[lerp(0.9, 0.9, gone), lerp(2.55, 4.3, gone), -1.9 + 0.9 * gone]}>
        <Cyl p={[0, 0, 0]} rt={0.19} h={0.62} color="#dfe8ee" line={2} />
        <CanvasPlane p={[0, 0.02, 0.2]} s={[0.42, 0.3]} px={[160, 120]} draw={(c, W, H) => { c.fillStyle = "#f2e8cf"; c.fillRect(0, 0, W, H); c.fillStyle = "#7a2a1e"; c.font = "900 26px Georgia, serif"; c.textAlign = "center"; c.fillText("MORPH.", W / 2, 52); c.fillText("65mg", W / 2, 84); }} />
      </group>
      {/* gloved hand */}
      <group position={[0.15, lerp(4.2, 3.8, gone), -1.9 + 0.9 * gone]} rotation={[-0.3, 0, 0]}>
        <Cyl p={[0, 0, 0]} rt={0.15} h={0.8} color="#e8dcc8" line={2} />
        <Cyl p={[0.12, 0, 0.4]} rt={0.08} h={0.4} color="#e8dcc8" line={2} rot={[0.8, 0, 0]} />
      </group>
      <HangLamp p={[-2, 4.5, -3]} h={2.8} color="#ffd68a" />
    </>
  );
};

/* ================= S7 — shelf, 45.64 – 48.9 ================= */
const K7 = K(CUTS[6], [
  { t: 0.0, pos: [0.85, 2.2, 2.5], look: [0.0, 1.55, -1.75], fov: 42 },
  { t: 3.2, pos: [1.25, 2.4, 3.4], look: [-0.1, 1.9, -2.6], fov: 44 },
]);
const S7 = ({ t, f }: Ctx) => {
  const u = t - CUTS[6];
  const reach = seg(u, 0.5, 2.0, Easing.inOut(Easing.cubic));
  const withdraw = seg(u, 2.5, 3.26, Easing.in(Easing.cubic));
  const handZ = lerp(-3.5, -1.8, reach) + lerp(-1.8, -3.5, withdraw);
  return (
    <>
      <Cam t={t} keys={K7} />
      <Lights warm="#ffd080" />
      <Floor kind="wood" a="#4a3222" b="#402b1d" unit={2.2} w={26} d={26} />
      <WallDoor z={-4.4} W={26} kind="wood" a="#33251c" b="#2c2018" base="#1d1410" />
      {/* shelves */}
      <Shelf p={[-3, 1.2, -2.5]} w={5.5} d={1.2} h={0.3} color="#4a2c18" />
      <Shelf p={[-3, 2.4, -2.5]} w={5.5} d={1.2} h={0.3} color="#4a2c18" />
      <Shelf p={[-3, 3.6, -2.5]} w={5.5} d={1.2} h={0.3} color="#4a2c18" />
      {/* bottles on shelf */}
      <Bottle p={[-2.2, 1.5, -2.5]} s={0.9} />
      <Bottle p={[0.2, 1.5, -2.5]} s={0.9} label={false} />
      <Bottle p={[2.2, 1.5, -2.5]} s={0.9} />
      {/* our bottle - center, lower shelf */}
      <group position={[0, 1.5, -2.5]}>
        <Bottle p={[0, 0, 0]} s={1.1} />
        <Glow p={[0, 0.7, 0.1]} r={1.2} color="rgba(255,200,120,1)" o={0.15} />
      </group>
      {/* mother's hand reaches */}
      <group position={[lerp(-1.5, 0, reach), 0, handZ]}>
        <Person p={[0, 0, 0]} h={3.3} look={mother} f={f} pose={{ mood: "worry", hunch: 0.3, armR: [lerp(0.4, -0.2, reach), 0.6], armRK: 1, armLK: 0.2 }} />
      </group>
    </>
  );
};

/* ================= S8 — silent killer, 48.9 – 61.83 ================= */
const K8 = K(CUTS[7], [
  { t: 0.0, pos: [0.0, 1.8, 4.5], look: [0.0, 1.5, -1.5], fov: 48 },
  { t: 3.0, pos: [0.0, 1.6, 3.2], look: [0.0, 1.5, -1.5], fov: 44 },
  { t: 6.58, pos: [0.0, 1.3, 1.8], look: [0.0, 1.5, -1.5], fov: 38 },
]);
const S8 = ({ t, f }: Ctx) => {
  const u = t - CUTS[7];
  const dim = 1 - seg(u, 3.0, 6.58, Easing.in(Easing.cubic));
  return (
    <>
      <Cam t={t} keys={K8} />
      <Lights warm="#1a120a" />
      <Floor kind="wood" a="#1a1008" b="#0e0a06" unit={2} w={26} d={26} />
      <WallDoor z={-4} W={26} kind="wood" a="#140e06" b="#0e0a06" base="#060402" />
      {/* final shelf with the bottle */}
      <Shelf p={[-1.5, 1.5, -2]} w={3} d={1} h={0.25} color="#1a120a" />
      <group position={[0, 1.65, -2]}>
        <Bottle p={[0, 0, 0]} s={1.3} />
        <Glow p={[0, 0.7, 0.1]} r={1.5} color="rgba(255,200,120,1)" o={0.2 * dim} />
      </group>
      <CanvasPlane p={[0, 2.8, -1.8]} s={[2, 0.6]} px={[400, 120]} draw={(c, W, H) => {
        c.fillStyle = "#0a0806"; c.fillRect(0, 0, W, H);
        c.fillStyle = `rgba(255,200,120,${0.6 * dim})`; c.font = "700 48px Georgia, serif"; c.textAlign = "center";
        c.fillText("SILENT KILLER", W / 2, H / 2 + 16);
      }} />
    </>
  );
};

/* ================= MAIN COMPOSITION ================= */
export const Winslow: React.FC = () => (
  <>
    <Audio src={staticFile("mix.wav")} />
    <Scene start={CUTS[0]} end={CUTS[1]} first bg="#1a120a">{c => <S1 {...c} />}</Scene>
    <Scene start={CUTS[1]} end={CUTS[2]} bg="#1a120a" trans="zoom">{c => <S2 {...c} />}</Scene>
    <Scene start={CUTS[2]} end={CUTS[3]} bg="#0e0e14">{c => <S3 {...c} />}</Scene>
    <Scene start={CUTS[3]} end={CUTS[4]} bg="#0a0806" trans="flash">{c => <S4 {...c} />}</Scene>
    <Scene start={CUTS[4]} end={CUTS[5]} bg="#0e0e14">{c => <S5 {...c} />}</Scene>
    <Scene start={CUTS[5]} end={CUTS[6]} bg="#0a0806">{c => <S6 {...c} />}</Scene>
    <Scene start={CUTS[6]} end={CUTS[7]} bg="#0a0806">{c => <S7 {...c} />}</Scene>
    <Scene start={CUTS[7]} end={CUTS[8]} bg="#05060c" trans="whip">{c => <S8 {...c} />}</Scene>
    <Grade t={0} shaft={false} tint="rgba(255,150,70,.07)" />
    <AbsoluteFill style={{ background: "#05060c", opacity: 0.5 * seg(0, 59.4, 61.7), pointerEvents: "none" }} />
    <Captions />
  </>
);