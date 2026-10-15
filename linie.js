// Personenseite „Meine Linie“ (Swen 15.10.2026): animiertes 3D-Netz aus netz.js, gekoppelt an die Legende.
// Ablauf beim ersten Sichtbarwerden: Netz baut sich auf → Fahrt auf Konnektivität → Fahrt auf Future of Work →
// Kreuzung KI-Empowerment → gestrichelte Strecke zum Ziel AI Leadership → Ruhe (Kamera atmet).
// Haltestelle antippen (Karte oder Legende) → Kamera fliegt hin, Legende öffnet. Ohne Bewegung (prefers-reduced-motion): Endzustand sofort.
import * as THREE from "./vendor/three/three.module.min.js";
import { createNet } from "./netz.js";

const ss = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const mix = (a, b, x) => a.map((v, i) => v + (b[i] - v) * x);
const TEAL = 0x33c2b6, TEAL_L = 0x8fe9de;
const BREIT = matchMedia("(min-width: 900px)");

export function start({ figur, legende, daten, ruhig = false, standbild = false }) {
  const canvas = figur.querySelector("canvas");
  const marken = figur.querySelector(".marken");
  const info = figur.querySelector(".karte-info");
  const ganz = figur.querySelector(".ganz");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
  const net = createNet(THREE, canvas, { width: w, height: h, pixelRatio: dpr, viewShift: 0 });
  const S = net.S;

  // ---------- Daten ----------
  const halte = new Map();
  for (const l of daten.linien) for (const hd of l.halte) if (!hd.verweis) halte.set(hd.id, { ...hd, linie: l.id });
  const ROUTE_K = ["pf", "dd", "dt", "ia", "E"], ROUTE_F = ["H", "ta", "E"];

  // ---------- Türkise Strecken über den grauen Linien ----------
  const tube = (curve, r) => {
    const g = new THREE.TubeGeometry(curve, 360, r, 12, false);
    const m = new THREE.MeshStandardMaterial({ color: TEAL, emissive: TEAL, emissiveIntensity: 0.5, roughness: 0.45 });
    const mesh = new THREE.Mesh(g, m); g.setDrawRange(0, 0); net.scene.add(mesh);
    const schritt = 12 * 6;
    return { g, curve, set: (p) => g.setDrawRange(0, Math.floor((g.index.count / schritt) * Math.min(1, Math.max(0, p))) * schritt) };
  };
  const rK = tube(net.route([["K", "pf", "E"]]), 0.9);
  const rF = tube(net.route([["F", "pn", "E"]]), 0.9);
  const curveZ = net.route([["F", "E", "al"]]);
  const dots = [];
  const dotMat = new THREE.MeshStandardMaterial({ color: TEAL_L, emissive: TEAL, emissiveIntensity: 0.8 });
  for (let i = 1; i < 12; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 10), dotMat);
    curveZ.getPointAt(i / 12, m.position); m.position.y += 0.9; m.visible = false; net.scene.add(m); dots.push(m);
  }
  // zweiter Punkt für die Führungslinie (der erste ist der Punkt aus netz.js)
  const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 12), new THREE.MeshStandardMaterial({ color: TEAL, emissive: TEAL, emissiveIntensity: 0.9 }));
  p2.visible = false; net.scene.add(p2);

  // Lage jeder Haltestelle auf ihrer Strecke (0..1), für das Aufleuchten während der Fahrt
  const uAuf = (curve, id) => { let b = 0, d = Infinity; const smp = curve.getSpacedPoints(400); smp.forEach((p, i) => { const e = p.distanceToSquared(S[id].v); if (e < d) { d = e; b = i; } }); return b / 400; };
  const uK = Object.fromEntries(ROUTE_K.map((id) => [id, uAuf(rK.curve, id)]));
  const uF = Object.fromEntries(ROUTE_F.map((id) => [id, uAuf(rF.curve, id)]));

  // ---------- Kamera ----------
  // Übersicht: fast senkrecht über Swens Linien (x −8…68, z 78…141), bei hochkantem Bild weiter weg
  const UEBER = () => {
    const a = w / h, k = a >= 1 ? 1 : 0.95 / a;
    return { pos: [24, 118 * k, 110 + 42 * k], look: [24, 0, 109], fov: 38 };
  };
  // Nahansicht; am Handy liegt unten die Infokarte, deshalb rückt die Haltestelle dort ins obere Drittel
  const NAH = (id) => { const v = S[id].v, z = BREIT.matches ? 5 : 15; return { pos: [v.x + 4, 30, v.z + 34], look: [v.x, 0, v.z + z], fov: 36 }; };
  let pose = UEBER(), von = pose, nach = pose, flugT0 = 0, flugD = 0;
  const fliege = (ziel, sofort = false) => { von = aktuellePose(); nach = ziel; flugT0 = performance.now(); flugD = sofort || ruhig ? 0 : 1100; };
  const aktuellePose = () => ({ pos: [...pose.pos], look: [...pose.look], fov: pose.fov });

  // ---------- Beschriftungen ----------
  const knopf = {};
  const neu = (id, text, cls) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "marke-h " + cls + (text.length > 18 ? " lang" : "");
    b.textContent = text.replace(/-/g, "\u2011"); // geschützter Bindestrich: „Human‑to‑Human“ bricht nicht am Bindestrich
    b.dataset.halt = id; b.setAttribute("aria-controls", "halt-" + id);
    b.addEventListener("click", () => waehle(id, "karte")); marken.appendChild(b); knopf[id] = b; return b;
  };
  // Lage der Beschriftung neben dem Ring, damit sich Nachbarn auf der waagrechten Führungslinie nicht überdecken
  const LAGE = { al: "oben", E: "unten", ta: "oben", H: "rechts", dt: "links" };
  for (const [id, hd] of halte) neu(id, S[id].n, [hd.rolle || "", "lage-" + (LAGE[id] || "rechts")].join(" "));
  const extra = {};
  for (const hd of halte.values()) for (const id of hd.beruehrt || []) { const s = document.createElement("span"); s.className = "marke-h nebenan"; s.textContent = S[id].n; s.hidden = true; marken.appendChild(s); extra[id] = s; }
  const linienName = [["K", net.terminus("K", 0)], ["F", net.terminus("F", 0)]].map(([lid, v]) => {
    const s = document.createElement("span"); s.className = "marke-linie"; s.textContent = net.L[lid].name; marken.appendChild(s); return [s, v];
  });
  const setze = (el, v, y = 0.6) => {
    const p = net.project(v.clone().setY(y));
    const sicht = p.front && p.x > 2 && p.x < 97 && p.y > 3 && p.y < 97;
    el.style.visibility = sicht ? "visible" : "hidden";
    if (sicht) { el.style.left = p.x + "%"; el.style.top = p.y + "%"; }
  };
  const beschrifte = () => {
    for (const id in knopf) setze(knopf[id], S[id].v);
    for (const id in extra) setze(extra[id], S[id].v);
    for (const [s, v] of linienName) setze(s, v, 0);
  };

  // ---------- Auswahl ----------
  let gewaehlt = null, auto = false;
  const details = (id) => legende.querySelector(`details[data-halt="${id}"]`);
  const blitz = (id) => { const d = details(id); if (!d) return; d.classList.add("blitz"); setTimeout(() => d.classList.remove("blitz"), 1300); };
  function zeigeInfo(id) {
    if (BREIT.matches || !id) { info.hidden = true; return; }
    const hd = halte.get(id);
    info.textContent = "";
    const t = document.createElement("strong"); t.textContent = S[id].n; info.appendChild(t);
    const p = document.createElement("p"); p.textContent = hd.bei.split(/(?<=\.)\s/)[0]; info.appendChild(p);
    const a = document.createElement("a"); a.href = "#halt-" + id; a.textContent = "Mehr in der Legende"; info.appendChild(a);
    info.hidden = false;
  }
  function waehle(id, quelle) {
    if (intro.laeuft) beendeIntro();
    if (id === gewaehlt && quelle !== "legende") { zurueck(); return; }
    gewaehlt = id;
    for (const k in knopf) knopf[k].classList.toggle("an", k === id);
    for (const k in extra) extra[k].hidden = !(halte.get(id)?.beruehrt || []).includes(k);
    if (quelle !== "legende") {
      auto = true;
      legende.querySelectorAll("details[open]").forEach((d) => { if (d.dataset.halt !== id) d.open = false; });
      const d = details(id); if (d) { d.open = true; if (BREIT.matches) d.scrollIntoView({ block: "nearest", behavior: ruhig ? "auto" : "smooth" }); }
      auto = false;
    }
    zeigeInfo(id);
    ganz.hidden = false;
    fliege(NAH(id));
    weck();
  }
  function zurueck() {
    gewaehlt = null;
    for (const k in knopf) knopf[k].classList.remove("an");
    for (const k in extra) extra[k].hidden = true;
    auto = true; legende.querySelectorAll("details[open]").forEach((d) => (d.open = false)); auto = false;
    info.hidden = true; ganz.hidden = true;
    fliege(UEBER());
    weck();
  }
  legende.querySelectorAll("details[data-halt]").forEach((d) => d.addEventListener("toggle", () => {
    if (auto) return;
    if (d.open) { legende.querySelectorAll("details[open]").forEach((o) => { if (o !== d) o.open = false; }); waehle(d.dataset.halt, "legende"); }
    else if (gewaehlt === d.dataset.halt) zurueck();
  }));
  legende.querySelectorAll("button.verweis").forEach((b) => b.addEventListener("click", () => waehle(b.dataset.halt, "karte")));
  ganz.addEventListener("click", zurueck);

  // ---------- Einstieg ----------
  const T = { aufbau: 1.8, k: 4.6, f: 3.4, kreuz: 0.9, ziel: 1.8 };
  const intro = { laeuft: !(ruhig || standbild), t0: 0, blitze: new Set() };
  const ENDE = T.aufbau + T.k + T.f + T.kreuz + T.ziel;
  function beendeIntro() { intro.laeuft = false; }

  function zustand(t, jetzt) {
    // t: Sekunden seit Start der Einleitung (bei beendeter Einleitung: ENDE)
    const reveal = ss(t / T.aufbau);
    const pk = ss((t - T.aufbau) / T.k), pf = ss((t - T.aufbau - T.k) / T.f);
    const tz = t - T.aufbau - T.k - T.f - T.kreuz, pz = Math.min(1, Math.max(0, tz / T.ziel));
    rK.set(pk); rF.set(pf);
    const focus = [];
    for (const id of ROUTE_K) if (pk >= uK[id] - 0.01 && pk > 0) focus.push(id);
    for (const id of ROUTE_F) if (pf >= uF[id] - 0.01 && pf > 0 && !focus.includes(id)) focus.push(id);
    if (intro.laeuft) for (const id of focus) if (!intro.blitze.has(id)) { intro.blitze.add(id); blitz(id); }
    dots.forEach((m, i) => (m.visible = pz * dots.length > i));
    if (pz >= 1) focus.push("al");
    if (gewaehlt && !focus.includes(gewaehlt)) focus.push(gewaehlt);
    for (const id of halte.get(gewaehlt)?.beruehrt || []) focus.push(id);
    const lit = ["K", "F"];
    if ((halte.get(gewaehlt)?.beruehrt || []).length) lit.push("W");
    // Punkte: K-Punkt fährt bis zur Kreuzung, F-Punkt kommt von der anderen Seite; in Ruhe pendeln beide langsam
    let mePos = null;
    if (pk > 0) {
      const ruheK = t >= ENDE && !ruhig ? 0.92 + 0.08 * Math.cos(jetzt / 2600) : pk;
      mePos = rK.curve.getPointAt(Math.min(0.999, ruheK));
    }
    p2.visible = pf > 0;
    if (pf > 0) { const u = t >= ENDE && !ruhig ? 0.9 + 0.1 * Math.cos(jetzt / 3100 + 1.4) : pf; rF.curve.getPointAt(Math.min(0.999, u), p2.position); p2.position.y = 1.3; }
    // Ziel-Strecke pulst in Ruhe als Lauflicht Richtung AI Leadership
    if (pz >= 1 && !ruhig) dots.forEach((m, i) => { const k = (jetzt / 900 - i / dots.length) % 1; m.scale.setScalar(0.75 + 0.5 * Math.max(0, Math.sin(k * Math.PI * 2))); });
    const glow = 1 + 0.35 * Math.sin(jetzt / 420);
    net.setState({ lit, focus, dim: 0.62, reveal, mePos, focusGlow: ruhig ? 1 : glow });
  }

  // ---------- Schleife ----------
  let sichtbar = true, raf = 0, startT = 0;
  function bild(jetzt) {
    raf = 0;
    if (!startT) startT = jetzt;
    let t = intro.laeuft ? (jetzt - startT) / 1000 : ENDE;
    if (intro.laeuft && t >= ENDE) { intro.laeuft = false; t = ENDE; }
    // Kamera: Flug, dann Atmen
    const f = flugD ? ss((jetzt - flugT0) / flugD) : 1;
    pose = { pos: mix(von.pos, nach.pos, f), look: mix(von.look, nach.look, f), fov: von.fov + (nach.fov - von.fov) * f };
    const atem = ruhig ? 0 : 1;
    const p = [pose.pos[0] + atem * 4 * Math.sin(jetzt / 5200), pose.pos[1] + atem * 2.5 * Math.sin(jetzt / 4100), pose.pos[2]];
    zustand(t, jetzt);
    net.render({ pos: p, look: pose.look, fov: pose.fov });
    beschrifte();
    if (!figur.classList.contains("bereit")) figur.classList.add("bereit");
    if (sichtbar && !document.hidden && (!ruhig || f < 1 || intro.laeuft)) raf = requestAnimationFrame(bild);
  }
  function weck() { if (!raf) raf = requestAnimationFrame(bild); }

  new IntersectionObserver((e) => { sichtbar = e[0].isIntersecting; if (sichtbar) weck(); }, { threshold: 0.05 }).observe(figur);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) weck(); });
  new ResizeObserver(() => {
    const nw = Math.max(1, canvas.clientWidth), nh = Math.max(1, canvas.clientHeight);
    if (nw === w && nh === h) return;
    w = nw; h = nh;
    net.renderer.setSize(w, h, false);
    net.camera.aspect = w / h; net.camera.setViewOffset(w, h, 0, 0, w, h); net.camera.updateProjectionMatrix();
    if (!gewaehlt) { pose = UEBER(); von = nach = pose; }
    weck();
  }).observe(canvas);
  BREIT.addEventListener("change", () => zeigeInfo(gewaehlt));
  weck();
  return { waehle, zurueck };
}
