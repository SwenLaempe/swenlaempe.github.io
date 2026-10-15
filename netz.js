// Personenseite „Meine Linie“ — Netz aus Montag. Folge 04/05 (g05-linien, g07-meine-linie), ergänzt um Plattformökonomie und Digital Twins auf Konnektivität.
// Linien und die Zugehörigkeit der Haltestellen folgen der Megatrend-Map des Zukunftsinstituts (am Original geprüft 13.10.2026).
// Lage, Reihenfolge, Höhen und Look sind eigen: kein Nachbau der Grafik.
// Deterministisch: Bild nur aus Zustand und Kamerapose, keine Zufallszahlen, keine Uhr.

const BG = 0x0a0a0e;
const C = {
  teal: 0x33c2b6, tealL: 0x8fe9de, tealD: 0x17938b, gold: 0xe8a94a, coral: 0xea6d5e,
  ring: 0xc9cad2, ringLo: 0x5a5b64, puck: 0x101116, hi: 0xe2e3e8,
};

// Planlage im Entwurfsraster (x Ost, z Süd); place() dreht das Netz hochkant für 9:16.
const place = ([x, z]) => [z * 0.62, (124 - x) * 1.08];

export const NET = {
  stations: {
    pf: { n: "Plattformökonomie", p: [1, 9], st: "gelebt" },
    dd: { n: "Differentiated Data", p: [8, 12], st: "gelebt" },
    tt: { n: "Trust Technology", p: [20, 18], st: "gelebt" },
    cy: { n: "Cybersecurity", p: [30, 24], st: "gelebt" },
    dt: { n: "Digital Twins", p: [33, 27], st: "gelebt" },
    ia: { n: "Intelligent Automation", p: [36, 32], st: "gelebt" },
    E: { n: "KI-Empowerment", p: [46, 42], st: "gelebt" },
    os: { n: "Open Source AI", p: [56, 44], st: "luecke" },
    L: { n: "Digital Literacy", p: [66, 52] },
    ra: { n: "Responsible AI", p: [78, 47], st: "gelebt" },
    be: { n: "Business Ecosystems", p: [90, 42], st: "aufbau" },
    epl: { n: "European Platform Lock-in", p: [100, 37], st: "luecke" },
    dk: { n: "Dezentrale KI", p: [110, 33], st: "luecke" },
    ef: { n: "Ethical Frameworks", p: [8, 0], st: "gelebt" },
    re: { n: "Resilienz", p: [12, 30], st: "luecke" },
    pr: { n: "Privacy", p: [4, 40], st: "gelebt" },
    gl: { n: "Generational Leadership", p: [44, 2], st: "aufbau" },
    al: { n: "AI Leadership", p: [44, 14], st: "gelebt" },
    wlb: { n: "Work-Life Blending", p: [45, 27], st: "gelebt" },
    ta: { n: "Technosoziale Arbeitswelt", p: [48, 56], st: "gelebt" },
    H: { n: "Human-to-Human Experience", p: [50, 72], st: "gelebt" }, // Swen 15.10.2026: 30 Jahre Führung, Neubau Offenburg
    pn: { n: "Post New Work Era", p: [48, 90] },
    ml: { n: "Microlearning", p: [100, 60], st: "gelebt" },
    kol: { n: "Kollaboration", p: [58, 63], st: "aufbau" },
    ll: { n: "Lifelong Learning", p: [36, 83], st: "gelebt" },
    ed: { n: "Edutainment", p: [24, 93], st: "gelebt" },
    sw: { n: "Selbstwirksamkeit", p: [6, 62] },
    di: { n: "Digitale Identität", p: [20, 66], st: "aufbau" },
    hc: { n: "Human Centricity", p: [34, 70] },
    lq: { n: "Lebensqualität", p: [62, 88] },
  },
  // Pfad: Haltestellen-ID, {t:[x,z]} Endpunkt mit Linienname, {w:[x,z]} Wegpunkt auf Linienhöhe.
  lines: [
    { id: "K", name: "Konnektivität", tone: 0x8a8c97, path: [{ t: [-6, 6] }, "pf", "dd", "tt", "cy", "dt", "ia", "E", "os", "L", "ra", "be", "epl", "dk", { t: [120, 30] }] },
    { id: "F", name: "Future of Work", tone: 0x6e707b, path: [{ t: [44, -12] }, "gl", "al", "wlb", "E", "ta", "H", "pn", { t: [46, 108] }] },
    { id: "W", name: "Wissenskultur", tone: 0x7c7e89, path: [{ t: [122, 62] }, "ml", "L", "kol", "H", "ll", "ed", { t: [10, 106] }] },
    { id: "I", name: "Identitätsdynamik", tone: 0x62646f, path: [{ t: [-10, 60] }, "sw", "di", "hc", "H", "lq", { t: [70, 106] }] },
    { id: "S", name: "Sicherheit", tone: 0x6a6c76, path: [{ t: [2, -12] }, "ef", "tt", "re", "pr", { t: [-10, 46] }] },
    { id: "GLO", name: "Globalisierung", bg: 5, path: [{ t: [76, -12] }, { w: [80, 4] }, { w: [94, 16] }, { w: [110, 12] }, { t: [124, 2] }] },
    { id: "URB", name: "Urbanisierung", bg: 6, path: [{ t: [60, -12] }, { w: [62, 8] }, { w: [70, 30] }, { w: [86, 58] }, { w: [96, 78] }, { t: [104, 112] }] },
    { id: "MOB", name: "Mobilität", bg: 4.5, path: [{ t: [124, 46] }, { w: [112, 52] }, { w: [106, 76] }, { w: [114, 94] }, { t: [124, 102] }] },
    { id: "OEK", name: "Ökointelligenz", bg: 5.5, path: [{ t: [90, 112] }, { w: [86, 98] }, { w: [92, 84] }, { w: [108, 82] }, { t: [124, 86] }] },
    { id: "GES", name: "Gesundheit", bg: 6, path: [{ t: [-12, 92] }, { w: [-4, 74] }, { w: [-8, 50] }, { w: [-4, 28] }, { t: [-12, 14] }] },
    { id: "DEM", name: "Demografischer Wandel", bg: 4, path: [{ t: [-12, 24] }, { w: [2, 50] }, { w: [16, 84] }, { w: [32, 100] }, { t: [30, 114] }] },
  ],
};

export function createNet(THREE, canvas, { width = 1080, height = 1920, pixelRatio = 1, viewShift = 170 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  renderer.setClearColor(BG, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 70, 230);
  const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 800);
  camera.setViewOffset(width, height, 0, (viewShift / 1920) * height, width, height); // Bildmitte auf die Bühne (y ≈ 790)

  scene.add(new THREE.HemisphereLight(0xc4c6d0, 0x14151a, 2.0));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(-40, 90, 60);
  scene.add(sun);

  // Boden: feines Punktraster, nur Andeutung von Plan und Maßstab
  let groundMat;
  {
    const pts = [];
    for (let x = -20; x <= 90; x += 4) for (let z = -20; z <= 160; z += 4) pts.push(x, -0.6, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    groundMat = new THREE.PointsMaterial({ color: 0x24252c, size: 0.35, sizeAttenuation: true });
    scene.add(new THREE.Points(g, groundMat));
  }

  const V = (xz, y = 0) => { const [x, z] = place(xz); return new THREE.Vector3(x, y, z); };
  const S = {};
  for (const [id, s] of Object.entries(NET.stations)) S[id] = { id, ...s, v: V(s.p), lines: [] };

  // Linien
  const L = {};
  for (const line of NET.lines) {
    const y = line.bg || 0;
    const pts = [];
    const termini = [];
    line.path.forEach((e, i) => {
      if (typeof e === "string") { S[e].lines.push(line.id); pts.push(S[e].v.clone()); }
      else if (e.t) { const v = V(e.t, 0); pts.push(v); termini.push(v); }
      else pts.push(V(e.w, y));
    });
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const r = line.bg ? 0.5 : 0.78;
    const geo = new THREE.TubeGeometry(curve, pts.length * 40, r, 10, false);
    const mat = new THREE.MeshStandardMaterial({ color: line.tone || 0x3a3b43, roughness: 0.55, metalness: 0.15, emissive: 0x000000 });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    // Endpunkte: Ring auf dem Boden
    const ends = termini.map((v) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.32, 10, 40), new THREE.MeshStandardMaterial({ color: C.ringLo, roughness: 0.5 }));
      m.rotation.x = Math.PI / 2; m.position.copy(v); scene.add(m); return m;
    });
    // kleine Haltestellen der Hintergrundlinien (namenlos)
    const smalls = [];
    if (line.bg) for (let k = 1; k < pts.length - 1; k++) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.5, 20), new THREE.MeshStandardMaterial({ color: 0x2c2d34, roughness: 0.6 }));
      m.position.copy(pts[k]); scene.add(m); smalls.push(m);
    }
    L[line.id] = { ...line, curve, mesh, mat, ends, smalls, samples: curve.getSpacedPoints(1200) };
  }

  // Haltestellen: dunkler Puck mit hellem Ring, Umsteigeknoten größer
  for (const s of Object.values(S)) {
    const big = s.lines.length > 1;
    const R = big ? 2.0 : 1.25;
    s.puck = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.9, 32), new THREE.MeshStandardMaterial({ color: C.puck, roughness: 0.7 }));
    s.puck.position.copy(s.v);
    s.ringMat = new THREE.MeshStandardMaterial({ color: C.ring, roughness: 0.4, metalness: 0.1, emissive: 0x000000 });
    s.ring = new THREE.Mesh(new THREE.TorusGeometry(R, big ? 0.36 : 0.26, 12, 48), s.ringMat);
    s.ring.rotation.x = Math.PI / 2; s.ring.position.copy(s.v).setY(0.45);
    scene.add(s.puck, s.ring);
  }

  // Der Punkt: du
  const halo = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d"); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(143,233,222,0.55)"); g.addColorStop(0.18, "rgba(51,194,182,0.22)"); g.addColorStop(0.55, "rgba(51,194,182,0.06)"); g.addColorStop(1, "rgba(51,194,182,0)");
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const me = new THREE.Group();
  const meMat = new THREE.MeshStandardMaterial({ color: C.teal, emissive: C.teal, emissiveIntensity: 0.9 });
  me.add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16), meMat));
  const meHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, depthWrite: false, transparent: true }));
  meHalo.scale.set(4.5, 4.5, 1); me.add(meHalo);
  scene.add(me);

  // Züge für den Bruch: helle Kapseln, die auf den Linien weiterfahren
  const pulses = [];
  const pulseMat = new THREE.MeshStandardMaterial({ color: C.hi, emissive: C.hi, emissiveIntensity: 0.6 });
  for (let i = 0; i < 24; i++) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.75, 3.2, 6, 12), pulseMat); m.visible = false; scene.add(m); pulses.push(m); }

  const tmp = new THREE.Vector3();
  const col = (hex) => new THREE.Color(hex);

  // Parameter u (0..1) der Linie am nächsten Punkt zu einer Haltestelle
  function uAt(lineId, stationId) {
    const smp = L[lineId].samples, v = S[stationId].v;
    let best = 0, d = Infinity;
    for (let i = 0; i < smp.length; i++) { const e = smp[i].distanceToSquared(v); if (e < d) { d = e; best = i; } }
    return best / (smp.length - 1);
  }
  // Route über mehrere Linien: [[linie, von, bis], …] → dichte Kurve
  function route(legs) {
    const pts = [];
    for (const [lid, a, b] of legs) {
      const ua = uAt(lid, a), ub = uAt(lid, b), n = 160;
      for (let i = pts.length ? 1 : 0; i <= n; i++) pts.push(L[lid].curve.getPointAt(ua + ((ub - ua) * i) / n));
    }
    return new THREE.CatmullRomCurve3(pts, false, "centripetal");
  }

  // Zustand: welche Linien und Haltestellen leuchten
  // mode "film": route (Türkis), lit (hell), dim (0..1 für alles andere), focus (Haltestellen in Türkis)
  // mode "standort": Haltestellen nach Stand gefärbt, Linien neutral
  function setState({ mode = "film", route: routeLines = [], lit = [], focus = [], dim = 0, mePos = null, trains = [], reveal = 1, lineA = null, meScale = 1, focusGlow = 1 } = {}) {
    const bgc = col(BG);
    const la = (id) => reveal * (lineA ? (lineA[id] ?? 0) : 1);
    for (const l of Object.values(L)) {
      const base = col(l.tone || 0x2e2f36);
      let c = base, e = col(0x000000), ei = 0;
      if (mode === "film") {
        if (routeLines.includes(l.id)) { c = col(C.teal); e = col(C.teal); ei = 0.45; }
        else if (lit.includes(l.id)) { c = col(C.hi); e = col(C.hi); ei = 0.12; }
        else if (dim) c = base.clone().lerp(col(BG), 0.55 * dim);
      }
      const a = la(l.id);
      l.mat.color.copy(c).lerp(bgc, 1 - a); l.mat.emissive.copy(e); l.mat.emissiveIntensity = ei * a;
      for (const m of l.ends) m.material.color.copy(dim && mode === "film" && !routeLines.includes(l.id) && !lit.includes(l.id) ? col(0x2a2b31) : col(C.ringLo)).lerp(bgc, 1 - a);
      for (const m of l.smalls) m.material.color.copy(col(0x2c2d34)).lerp(bgc, 1 - a);
    }
    for (const s of Object.values(S)) {
      let c = col(C.ring), e = col(0x000000), ei = 0;
      if (mode === "standort") {
        const m = { gelebt: C.teal, aufbau: C.gold, luecke: C.coral }[s.st];
        if (m) { c = col(m); e = col(m); ei = 0.35; } else c = col(C.ringLo);
      } else if (focus.includes(s.id)) { c = col(C.teal); e = col(C.tealL); ei = 0.7; }
      else if (dim && !s.lines.some((x) => routeLines.includes(x) || lit.includes(x))) c = col(C.ring).lerp(col(BG), 0.6 * dim);
      const a = Math.max(...s.lines.map(la));
      s.ringMat.color.copy(c).lerp(bgc, 1 - a); s.ringMat.emissive.copy(e); s.ringMat.emissiveIntensity = ei * a * (focus.includes(s.id) ? focusGlow : 1);
      const scale = mode === "film" && focus.includes(s.id) ? 1.35 : 1;
      s.ring.scale.setScalar(scale); s.puck.scale.set(scale, 1, scale);
    }
    me.visible = !!mePos && meScale > 0.001;
    if (mePos) me.position.copy(mePos.isVector3 ? mePos : S[mePos].v).setY(1.3);
    me.scale.setScalar(Math.max(meScale, 0.001));
    groundMat.color.copy(col(0x24252c)).lerp(bgc, 1 - reveal);
    pulses.forEach((p, i) => {
      const t = trains[i];
      p.visible = !!t;
      if (!t) return;
      const curve = L[t[0]].curve, u = ((t[1] % 1) + 1) % 1;
      curve.getPointAt(u, p.position); p.position.y += 0.1;
      curve.getTangentAt(u, tmp); p.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tmp);
    });
  }

  function render({ pos, look, fov = 34, up = [0, 1, 0] }) {
    camera.position.set(...pos);
    camera.up.set(...up);
    camera.lookAt(...look);
    if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
  }

  // Bildschirmlage eines Punkts in Prozent der Bildbreite und -höhe (für Beschriftungen als HTML)
  function project(v) {
    tmp.copy(v).project(camera);
    return { x: (tmp.x * 0.5 + 0.5) * 100, y: (-tmp.y * 0.5 + 0.5) * 100, front: tmp.z < 1 };
  }
  const terminus = (lid, end = 0) => L[lid].ends[end].position;

  return { THREE, renderer, scene, camera, S, L, setState, render, project, route, uAt, terminus, place };
}
