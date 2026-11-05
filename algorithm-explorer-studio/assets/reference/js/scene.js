/* Algorithm Explorer — Three.js stage.
 * One renderer, one camera, one orbit controller, fifteen scene builders.
 * Everything is procedural: no textures, models or assets to load.
 */
(function (root) {
  'use strict';

  const CAMS = {
    'two-pointers': { pos: [0, 6.5, 13], target: [0, 0.9, 0], fov: 42 },
    'sliding-window': { pos: [0, 6.5, 12], target: [0, 0.6, 0], fov: 44 },
    'fast-slow': { pos: [0, 8.5, 13], target: [0, 0.3, 0], fov: 44 },
    'merge-intervals': { pos: [0, 8.5, 15], target: [0, 0.6, 0], fov: 44 },
    'monotonic-stack': { pos: [1, 9.5, 16], target: [0, 1.8, 0], fov: 44 },
    'top-k': { pos: [0, 6.5, 16], target: [0, 0.8, 0], fov: 46 },
    'binary-search-answer': { pos: [0, 7.5, 14], target: [0, 0.2, 0], fov: 44 },
    'tree-dfs': { pos: [0, 6.6, 15.5], target: [0, 1.2, 0], fov: 44 },
    'tree-bfs': { pos: [0, 6.6, 15.5], target: [0, 1.2, 0], fov: 44 },
    'graph-traversal': { pos: [0, 10, 14], target: [0, 0, 0], fov: 46 },
    'backtracking': { pos: [0, 6.6, 15.5], target: [0, 0.2, 0], fov: 46 },
    'dynamic-programming': { pos: [0, 9.5, 16], target: [0, 0.5, 0], fov: 44 },
    'cyclic-sort': { pos: [0, 8.5, 13], target: [0, 0.2, 0], fov: 44 },
    'reverse-linked-list': { pos: [0, 5.5, 16], target: [0, 0.4, 0], fov: 44 },
    'union-find': { pos: [0, 8.5, 13], target: [0, 0.3, 0], fov: 44 }
  };

  let renderer = null, scene = null, camera = null, controls = null;
  let container = null, dynamicRoot = null, stars = null, accentLight = null;
  let updater = null, currentPattern = null, currentResult = null, currentFrame = null;
  let home = { pos: new (root.THREE ? root.THREE.Vector3 : Object)(0, 0, 0), target: null };
  let ready = false, raf = 0, lastTime = 0;
  const labelCache = new Map();
  const colorCache = new Map();

  const hex = (value) => (colorCache.has(value) ? colorCache.get(value) : (() => { const c = new THREE.Color(value); colorCache.set(value, c); return c; })());
  const coll = (v) => (Array.isArray(v) ? v.map(coll) : v);
  const isColor = (v) => v && typeof v === 'object' && v.isColor;

  function disposeObject(object) {
    if (!object) return;
    object.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of materials) {
          if (material.map && !labelCache.has(material.map.userData?.key)) material.map.dispose?.();
          if (material.map && material.map.userData?.key && !material.map.userData.shared) material.map.dispose?.();
          material.dispose?.();
        }
      }
    });
    if (object.parent) object.parent.remove(object);
  }

  function material(color, options = {}) {
    const mat = new THREE.MeshStandardMaterial({
      color: hex(color),
      emissive: hex(options.emissive || color),
      emissiveIntensity: options.emissiveIntensity == null ? 0.16 : options.emissiveIntensity,
      metalness: options.metalness == null ? 0.28 : options.metalness,
      roughness: options.roughness == null ? 0.42 : options.roughness,
      transparent: options.transparent || false,
      opacity: options.opacity == null ? 1 : options.opacity,
      side: options.side || THREE.FrontSide
    });
    if (options.wireframe) mat.wireframe = true;
    return mat;
  }

  function mesh(geometry, color, options = {}) {
    const m = new THREE.Mesh(geometry, material(color, options));
    m.castShadow = options.castShadow !== false;
    m.receiveShadow = options.receiveShadow !== false;
    return m;
  }

  function box(w, h, d, color, options = {}) {
    return mesh(new THREE.BoxGeometry(w, h, d), color, options);
  }

  function sphere(r, color, options = {}) {
    return mesh(new THREE.SphereGeometry(r, options.segments || 20, options.segments || 20), color, options);
  }

  function cylinder(rt, rb, h, color, options = {}) {
    return mesh(new THREE.CylinderGeometry(rt, rb, h, options.segments || 18), color, options);
  }

  function roundedBox(w, h, d, radius, color, options = {}) {
    const shape = new THREE.Shape();
    const x = -w / 2, y = -h / 2, r = Math.min(radius, w / 2, h / 2);
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 4 });
    geometry.center();
    return mesh(geometry, color, options);
  }

  function ring(radius, tube, color, options = {}) {
    return mesh(new THREE.TorusGeometry(radius, tube, 12, 48), color, options);
  }

  function label(text, options = {}) {
    const color = options.color || '#eaf6ff';
    const bg = options.bg || 'rgba(5, 13, 24, 0.84)';
    const border = options.border || color;
    const key = `${text}|${color}|${bg}|${border}|${options.size || 62}`;
    if (!labelCache.has(key)) {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 160;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = bg;
      ctx.strokeStyle = border;
      ctx.lineWidth = 6;
      const r = 32;
      ctx.beginPath();
      ctx.moveTo(15 + r, 15);
      ctx.lineTo(497 - r, 15); ctx.quadraticCurveTo(497, 15, 497, 15 + r);
      ctx.lineTo(497, 145 - r); ctx.quadraticCurveTo(497, 145, 497 - r, 145);
      ctx.lineTo(15 + r, 145); ctx.quadraticCurveTo(15, 145, 15, 145 - r);
      ctx.lineTo(15, 15 + r); ctx.quadraticCurveTo(15, 15, 15 + r, 15);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      let fontSize = options.size || 68;
      const font = (size) => `700 ${size}px "SF Pro Display", "Inter", "Segoe UI", sans-serif`;
      ctx.font = font(fontSize);
      while (ctx.measureText(text).width > 452 && fontSize > 24) {
        fontSize -= 2;
        ctx.font = font(fontSize);
      }
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 84);
      const texture = new THREE.CanvasTexture(canvas);
      texture.userData = { key, shared: true };
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      labelCache.set(key, texture);
    }
    const texture = labelCache.get(key);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false }));
    const readScale = (options.scale || 2.4) < 1.8 ? (options.scale || 2.4) * 1.22 : (options.scale || 2.4);
    sprite.scale.set(readScale, readScale * 0.3125, 1);
    sprite.renderOrder = 8;
    sprite.userData.setText = (value, opts = {}) => {
      const next = label(value, { ...options, ...opts });
      sprite.material.map = next.material.map;
      sprite.material.needsUpdate = true;
      next.material.dispose();
    };
    return sprite;
  }

  function setLabel(sprite, text, options) {
    if (sprite?.userData?.setText) sprite.userData.setText(text, options);
  }

  function tween(object, options = {}) {
    if (!object) return;
    const u = object.userData;
    u.tw = u.tw || {};
    if (options.position) u.tw.position = new THREE.Vector3(...options.position);
    if (options.scale != null) u.tw.scale = new THREE.Vector3(...(Array.isArray(options.scale) ? options.scale : [options.scale, options.scale, options.scale]));
    if (options.color) u.tw.color = hex(options.color);
    if (options.emissive) u.tw.emissive = hex(options.emissive);
    if (options.emissiveIntensity != null) u.tw.emissiveIntensity = options.emissiveIntensity;
    if (options.opacity != null) u.tw.opacity = options.opacity;
  }

  function applyTweens(object, dt) {
    const alpha = 1 - Math.exp(-dt * 11);
    object.traverse((child) => {
      const tw = child.userData && child.userData.tw;
      if (!tw) return;
      if (tw.position) child.position.lerp(tw.position, alpha);
      if (tw.scale) child.scale.lerp(tw.scale, alpha);
      const mat = child.material;
      if (mat) {
        if (tw.color && mat.color) mat.color.lerp(tw.color, alpha);
        if (tw.emissive && mat.emissive) mat.emissive.lerp(tw.emissive, alpha);
        if (tw.emissiveIntensity != null) mat.emissiveIntensity += (tw.emissiveIntensity - mat.emissiveIntensity) * alpha;
        if (tw.opacity != null) {
          mat.transparent = true;
          mat.opacity += (tw.opacity - mat.opacity) * alpha;
        }
      }
    });
  }

  function addPlatform(radius = 8, color = '#12233d') {
    const disc = cylinder(radius, radius, 0.22, color, { transparent: true, opacity: 0.6, metalness: 0.55, roughness: 0.62 });
    disc.position.y = -2.5;
    disc.receiveShadow = true;
    dynamicRoot.add(disc);
    const rim = ring(radius - 0.1, 0.035, currentPattern?.accent || '#57d7ff', { emissiveIntensity: 0.8, transparent: true, opacity: 0.65 });
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -2.37;
    dynamicRoot.add(rim);
    const grid = new THREE.GridHelper(radius * 2, 24, 0x244366, 0x12253d);
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    grid.position.y = -2.34;
    dynamicRoot.add(grid);
  }

  function addAxis(from, to, color) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const m = cylinder(0.025, 0.025, len, color, { transparent: true, opacity: 0.5, emissiveIntensity: 0.5 });
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    dynamicRoot.add(m);
    return m;
  }

  function beam(color, height = 3.1) {
    const group = new THREE.Group();
    const rod = cylinder(0.035, 0.035, height, color, { transparent: true, opacity: 0.85, emissiveIntensity: 1.2, metalness: 0.1, roughness: 0.2 });
    rod.position.y = height / 2 - 0.4;
    group.add(rod);
    const tip = sphere(0.11, color, { emissiveIntensity: 1.6 });
    tip.position.y = height - 0.4;
    group.add(tip);
    const base = ring(0.46, 0.035, color, { rotation: [Math.PI / 2, 0, 0], emissiveIntensity: 1.4, transparent: true, opacity: 0.8 });
    base.position.y = -0.38;
    group.add(base);
    group.userData.rod = rod;
    group.userData.tip = tip;
    group.userData.base = base;
    return group;
  }

  function makeArrow(color) {
    const group = new THREE.Group();
    const shaft = cylinder(0.035, 0.035, 1, color, { emissiveIntensity: 0.4 });
    const head = mesh(new THREE.ConeGeometry(0.13, 0.32, 12), color, { emissiveIntensity: 0.4 });
    group.add(shaft, head);
    group.userData.shaft = shaft;
    group.userData.head = head;
    return group;
  }

  const Y_AXIS = new THREE.Vector3(0, 1, 0);
  function placeArrow(group, from, to, color) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    if (len < 0.01) { group.visible = false; return; }
    group.visible = true;
    const q = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir.clone().normalize());
    const shaft = group.userData.shaft, head = group.userData.head;
    shaft.position.copy(a).add(b).multiplyScalar(0.5);
    shaft.scale.y = Math.max(0.001, len - 0.26);
    shaft.quaternion.copy(q);
    head.position.copy(b).addScaledVector(dir.clone().normalize(), -0.16);
    head.quaternion.copy(q);
    if (color) {
      tween(shaft, { color, emissive: color });
      tween(head, { color, emissive: color });
    }
  }

  function curveBetween(a, b, color, lift = 1.2, opacity = 0.8) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.y += lift;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, 0.035, 6, false),
      material(color, { transparent: true, opacity, emissiveIntensity: 0.5, metalness: 0.1, roughness: 0.6 })
    );
    return tube;
  }

  function layoutTree(tree, width = 12) {
    const positions = {};
    const byDepth = new Map();
    for (const node of tree.nodes) {
      if (!byDepth.has(node.depth)) byDepth.set(node.depth, []);
      byDepth.get(node.depth).push(node);
    }
    const maxDepth = Math.max(0, ...byDepth.keys());
    for (const [depth, nodes] of byDepth) {
      const spacing = width / Math.max(1, nodes.length);
      nodes.forEach((node, index) => {
        positions[node.id] = {
          x: (index - (nodes.length - 1) / 2) * spacing,
          y: 3.4 - depth * 1.65,
          z: 0
        };
      });
    }
    return { positions, maxDepth };
  }

  /* --------------------------------------------------------------- builders */
  function buildTwoPointers(result) {
    const nums = result.meta.nums;
    const n = nums.length;
    const spacing = Math.min(1.55, 13 / Math.max(1, n));
    const cubes = [];
    const labels = [];
    nums.forEach((value, i) => {
      const cube = roundedBox(Math.min(1.02, spacing * 0.76), 1.02, 1.02, 0.13, '#1b3557', { emissiveIntensity: 0.18, metalness: 0.45 });
      cube.position.set((i - (n - 1) / 2) * spacing, 0.1, 0);
      dynamicRoot.add(cube); cubes.push(cube);
      const sprite = label(String(value), { color: '#dff4ff', scale: Math.min(1.35, spacing * 0.7), size: 68 });
      sprite.position.set((i - (n - 1) / 2) * spacing, 1.1, 0.58);
      dynamicRoot.add(sprite); labels.push(sprite);
    });
    const lBeam = beam('#57d7ff'), rBeam = beam('#ffb86b');
    dynamicRoot.add(lBeam, rBeam);
    const lTag = label('L', { color: '#57d7ff', scale: 0.95, border: '#57d7ff' });
    const rTag = label('R', { color: '#ffb86b', scale: 0.95, border: '#ffb86b' });
    lTag.position.y = 3.1; rTag.position.y = 3.1;
    dynamicRoot.add(lTag, rTag);
    const sum = label('sum —', { color: '#eaf6ff', scale: 3.2, border: '#57d7ff' });
    sum.position.set(0, 4.05, 0);
    dynamicRoot.add(sum);
    addPlatform(Math.max(6, n * 0.85));
    addAxis([-7, -1.35, 0], [7, -1.35, 0], '#57d7ff');

    return (data) => {
      const lx = (data.l - (n - 1) / 2) * spacing;
      const rx = (data.r - (n - 1) / 2) * spacing;
      lBeam.visible = data.l <= data.r;
      rBeam.visible = data.l <= data.r;
      lBeam.position.x = lx; rBeam.position.x = rx;
      lTag.visible = rTag.visible = lBeam.visible;
      lTag.position.x = lx; rTag.position.x = rx;
      cubes.forEach((cube, i) => {
        const active = i === data.l || i === data.r;
        const found = data.found && data.found.includes(i);
        tween(cube, {
          position: [(i - (n - 1) / 2) * spacing, active ? 0.22 : 0.1, 0],
          color: found ? '#7af0c7' : active ? '#2d6ea8' : '#1b3557',
          emissive: found ? '#3dffb0' : active ? currentPattern.accent : '#0b1b30',
          emissiveIntensity: found ? 0.9 : active ? 0.5 : 0.1
        });
        tween(labels[i], { color: found ? '#bcffe8' : active ? '#ffffff' : '#8eb4cf' });
      });
      setLabel(sum, data.sum == null ? `target ${data.target}` : `sum ${data.sum}  ·  target ${data.target}`, { color: data.found ? '#7af0c7' : '#dff4ff', border: data.found ? '#7af0c7' : '#57d7ff' });
      if (data.direction === 'left') tween(lBeam.userData.tip, { scale: 1.5 });
      if (data.direction === 'right') tween(rBeam.userData.tip, { scale: 1.5 });
    };
  }

  function buildSlidingWindow(result) {
    const chars = result.meta.s;
    const n = chars.length;
    const spacing = Math.min(1.35, 13 / Math.max(1, n));
    const cubes = [], labels = [];
    chars.forEach((ch, i) => {
      const cube = roundedBox(spacing * 0.78, 0.95, 0.95, 0.1, '#183b46', { emissiveIntensity: 0.15, metalness: 0.4 });
      cube.position.set((i - (n - 1) / 2) * spacing, 0, 0);
      dynamicRoot.add(cube); cubes.push(cube);
      const sprite = label(ch, { color: '#d8fff5', scale: Math.min(1.1, spacing * 0.66), size: 74 });
      sprite.position.set(cube.position.x, 0.86, 0.54);
      dynamicRoot.add(sprite); labels.push(sprite);
    });
    const windowBox = box(1, 1.5, 1.5, '#7af0c7', { transparent: true, opacity: 0.15, emissiveIntensity: 0.4, metalness: 0.1, roughness: 0.1, side: THREE.DoubleSide });
    dynamicRoot.add(windowBox);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), new THREE.LineBasicMaterial({ color: '#7af0c7', transparent: true, opacity: 0.9 }));
    windowBox.add(edge);
    const bestBar = box(1, 0.08, 1, '#7af0c7', { emissiveIntensity: 1.1 });
    bestBar.position.y = -1.1;
    dynamicRoot.add(bestBar);
    const status = label('window —', { color: '#7af0c7', scale: 3.0, border: '#7af0c7' });
    status.position.set(0, 3.4, 0);
    dynamicRoot.add(status);
    addPlatform(Math.max(6, n * 0.8));
    addAxis([-7, -1.35, 0], [7, -1.35, 0], '#7af0c7');

    return (data) => {
      const visible = data.right >= data.left;
      windowBox.visible = visible;
      if (visible) {
        const width = (data.right - data.left + 1) * spacing * 0.94 + 0.25;
        const center = ((data.left + data.right) / 2 - (n - 1) / 2) * spacing;
        tween(windowBox, { position: [center, 0.02, 0], scale: [width / Math.max(0.01, 1), 1, 1] });
      }
      cubes.forEach((cube, i) => {
        const inWindow = i >= data.left && i <= data.right && visible;
        const inBest = i >= data.bestRange[0] && i <= data.bestRange[1] && data.bestRange[1] >= 0;
        tween(cube, {
          color: inWindow ? '#1c665b' : inBest ? '#225a4b' : '#183b46',
          emissive: inWindow ? '#7af0c7' : inBest ? '#2bbd86' : '#0a2528',
          emissiveIntensity: inWindow ? 0.65 : inBest ? 0.3 : 0.08
        });
      });
      if (data.bestRange[1] >= 0) {
        const w = (data.bestRange[1] - data.bestRange[0] + 1) * spacing * 0.94;
        bestBar.visible = true;
        tween(bestBar, { position: [((data.bestRange[0] + data.bestRange[1]) / 2 - (n - 1) / 2) * spacing, -1.06, 0], scale: [w, 1, 1], color: '#7af0c7', emissive: '#7af0c7' });
      }
      const text = data.window ? `"${data.window}"  ·  best ${data.best}` : `best ${data.best}`;
      setLabel(status, text);
    };
  }

  function buildFastSlow(result) {
    const n = result.meta.count;
    const radius = Math.min(4.6, 2.6 + n * 0.22);
    const positions = [];
    const nodes = [], labels = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 + Math.PI / 2;
      positions.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0]);
    }
    positions.forEach((pos, i) => {
      const node = sphere(0.34, '#213a5a', { emissiveIntensity: 0.2 });
      node.position.set(...pos);
      dynamicRoot.add(node); nodes.push(node);
      const sprite = label(String(i), { color: '#cfe8ff', scale: 1.12, size: 60 });
      sprite.position.set(pos[0], pos[1] + 0.68, 0.2);
      dynamicRoot.add(sprite); labels.push(sprite);
      const link = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...pos), new THREE.Vector3(...positions[(i + 1) % n])]), new THREE.LineBasicMaterial({ color: '#2a527a', transparent: true, opacity: 0.45 }));
      dynamicRoot.add(link);
    });
    const cycleLink = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...positions[n - 1]), new THREE.Vector3(...positions[result.meta.cycleAt >= 0 ? result.meta.cycleAt : 0])]), new THREE.LineDashedMaterial({ color: '#e0641a', dashSize: 0.25, gapSize: 0.18, transparent: true, opacity: 0.8 }));
    cycleLink.computeLineDistances();
    cycleLink.visible = result.meta.cycleAt >= 0;
    dynamicRoot.add(cycleLink);
    const slow = sphere(0.2, '#57d7ff', { emissive: '#57d7ff', emissiveIntensity: 1.1, metalness: 0.2 });
    const fast = sphere(0.24, '#ffb86b', { emissive: '#ffb86b', emissiveIntensity: 1.1, metalness: 0.2 });
    dynamicRoot.add(slow, fast);
    const status = label('slow 0 · fast 0', { color: '#ffd9ad', scale: 3.1, border: '#ffb86b' });
    status.position.set(0, radius + 1.7, 0);
    dynamicRoot.add(status);
    addPlatform(radius + 2.2, '#1c2438');

    return (data) => {
      const sp = positions[data.slow];
      const fp = positions[data.fast];
      tween(slow, { position: sp });
      tween(fast, { position: fp });
      nodes.forEach((node, i) => {
        const active = i === data.slow || i === data.fast;
        tween(node, { color: data.meet && active ? '#ffd166' : active ? '#2e5f92' : '#213a5a', emissive: active ? (data.meet ? '#ffd166' : '#57d7ff') : '#0e1d2e', emissiveIntensity: active ? 0.8 : 0.15, scale: i === data.slow || i === data.fast ? 1.18 : 1 });
      });
      setLabel(status, data.meet ? `meet at node ${data.slow}` : `slow ${data.slow} · fast ${data.fast} · ${data.steps} step${data.steps === 1 ? '' : 's'}`, { color: data.meet ? '#ffe9a8' : '#ffd9ad', border: data.meet ? '#ffd166' : '#ffb86b' });
    };
  }

  function buildMergeIntervals(result) {
    const intervals = result.meta.intervals;
    const min = Math.min(...intervals.map((iv) => iv[0]));
    const max = Math.max(...intervals.map((iv) => iv[1]));
    const span = Math.max(1, max - min);
    const scale = 12 / span;
    const xOf = (value) => (value - min) * scale - 6;
    const rowGap = Math.min(0.84, 5.2 / Math.max(1, intervals.length));
    const rows = [], rowLabels = [];
    intervals.forEach((iv, i) => {
      const width = Math.max(0.22, (iv[1] - iv[0]) * scale);
      const bar = roundedBox(width, 0.4, 0.58, 0.08, '#26365a', { emissiveIntensity: 0.15, metalness: 0.4 });
      bar.position.set(xOf((iv[0] + iv[1]) / 2), 0.2, (i - (intervals.length - 1) / 2) * rowGap);
      dynamicRoot.add(bar); rows.push(bar);
      const sprite = label(`[${iv[0]},${iv[1]}]`, { color: '#d9ccff', scale: Math.min(1.8, width + 0.9), size: 52 });
      sprite.position.set(xOf((iv[0] + iv[1]) / 2), 0.65, (i - (intervals.length - 1) / 2) * rowGap + 0.35);
      dynamicRoot.add(sprite); rowLabels.push(sprite);
    });
    const resultBars = [], resultLabels = [];
    intervals.forEach((_, i) => {
      const bar = roundedBox(0.3, 0.62, 0.9, 0.08, '#c7a6ff', { emissive: '#c7a6ff', emissiveIntensity: 0.7, metalness: 0.3 });
      bar.visible = false;
      bar.position.y = 2.4;
      dynamicRoot.add(bar); resultBars.push(bar);
      const sprite = label('', { color: '#e8ddff', scale: 2.0, border: '#c7a6ff' });
      sprite.visible = false; sprite.position.set(0, 3.05, 0);
      dynamicRoot.add(sprite); resultLabels.push(sprite);
    });
    const status = label('merge result', { color: '#e8ddff', scale: 3.0, border: '#c7a6ff' });
    status.position.set(0, 3.9, 0);
    dynamicRoot.add(status);
    addPlatform(8.5, '#231d3c');
    addAxis([-6.6, -1.3, 0], [6.6, -1.3, 0], '#c7a6ff');
    for (const [value, x] of [[min, -6], [max, 6]]) {
      const tick = label(String(value), { color: '#a991d8', scale: 1.1, size: 48 });
      tick.position.set(x, -1.8, 0.6);
      dynamicRoot.add(tick);
    }

    return (data) => {
      rows.forEach((bar, i) => {
        const active = data.active === i;
        tween(bar, { color: active ? '#6b53a8' : '#26365a', emissive: active ? '#c7a6ff' : '#161a32', emissiveIntensity: active ? 0.65 : 0.12, scale: [1, active ? 1.35 : 1, 1] });
      });
      resultBars.forEach((bar, i) => {
        const item = data.merged[i];
        bar.visible = Boolean(item);
        if (!item) { resultLabels[i].visible = false; return; }
        const width = Math.max(0.25, (item[1] - item[0]) * scale);
        tween(bar, { position: [xOf((item[0] + item[1]) / 2), 2.4, 0], scale: [width / 0.3, 1, 1] });
        resultLabels[i].visible = true;
        setLabel(resultLabels[i], `[${item[0]}, ${item[1]}]`);
        tween(resultLabels[i], { position: [xOf((item[0] + item[1]) / 2), 3.05, 0.25] });
      });
      setLabel(status, data.phase === 'done' ? `${data.merged.length} merged slabs` : `merging ${data.merged.length}…`);
    };
  }

  function buildMonotonicStack(result) {
    const temps = result.meta.temps;
    const maxTemp = Math.max(...temps, 1);
    const n = temps.length;
    const spacing = Math.min(1.1, 12 / Math.max(1, n));
    const heightOf = (t) => 0.5 + (t / maxTemp) * 4.2;
    const bars = [], labels = [], answerLabels = [];
    temps.forEach((temp, i) => {
      const h = heightOf(temp);
      const bar = roundedBox(spacing * 0.62, h, 0.62, 0.06, '#49304a', { emissiveIntensity: 0.15, metalness: 0.35 });
      bar.position.set((i - (n - 1) / 2) * spacing, -2.35 + h / 2, 0);
      bar.userData.base = [-2.35 + h / 2];
      dynamicRoot.add(bar); bars.push(bar);
      const sprite = label(String(temp), { color: '#ffd6de', scale: Math.min(1.05, spacing * 0.62), size: 54 });
      sprite.position.set((i - (n - 1) / 2) * spacing, -2.2 + h + 0.35, 0.15);
      dynamicRoot.add(sprite); labels.push(sprite);
      const ans = label('·', { color: '#ff8da1', scale: 0.8, size: 46 });
      ans.position.set((i - (n - 1) / 2) * spacing, -2.15 + h + 0.9, 0.15);
      dynamicRoot.add(ans); answerLabels.push(ans);
    });
    const stackBase = new THREE.Vector3(6.2, -2.5, 2.3);
    const pole = cylinder(0.06, 0.06, 10, '#6d3550', { transparent: true, opacity: 0.65 });
    pole.position.set(stackBase.x, 2.4, stackBase.z);
    dynamicRoot.add(pole);
    const stackNodes = [], stackLabels = [];
    temps.forEach((_, i) => {
      const cube = roundedBox(0.85, 0.52, 0.85, 0.08, '#ff8da1', { emissive: '#ff8da1', emissiveIntensity: 0.3 });
      cube.visible = false;
      dynamicRoot.add(cube); stackNodes.push(cube);
      const sprite = label('', { color: '#ffe4ea', scale: 1.15, size: 50 });
      sprite.visible = false;
      dynamicRoot.add(sprite); stackLabels.push(sprite);
    });
    const stackTitle = label('monotonic stack', { color: '#ff8da1', scale: 2.4, border: '#ff8da1' });
    stackTitle.position.set(6.2, 7.7, 2.3);
    dynamicRoot.add(stackTitle);
    const status = label('push indices', { color: '#ffe4ea', scale: 3.4, border: '#ff8da1' });
    status.position.set(0, 7.1, 0);
    dynamicRoot.add(status);
    addPlatform(9, '#2d1e2c');

    return (data) => {
      bars.forEach((bar, i) => {
        const active = i === data.i;
        const popped = i === data.popped;
        tween(bar, {
          color: popped ? '#c22f48' : active ? '#a63f62' : '#49304a',
          emissive: popped ? '#ff5577' : active ? '#ff8da1' : '#1e1320',
          emissiveIntensity: popped ? 1.1 : active ? 0.6 : 0.1,
          scale: [1, popped ? 1.08 : active ? 1.04 : 1, 1]
        });
        const resolved = data.answer[i] > 0;
        setLabel(answerLabels[i], resolved ? String(data.answer[i]) : '·', { color: resolved ? '#7af0c7' : '#ff8da1' });
        tween(labels[i], { color: active ? '#ffffff' : '#c9a0ad' });
      });
      stackNodes.forEach((node, i) => {
        const has = i < data.stack.length;
        node.visible = has;
        stackLabels[i].visible = has;
        if (!has) return;
        const y = -2.2 + i * 0.6;
        tween(node, { position: [stackBase.x, y, stackBase.z], scale: [1, 1, 1] });
        stackLabels[i].visible = true;
        setLabel(stackLabels[i], `${data.stack[i]} · ${temps[data.stack[i]]}°`);
        tween(stackLabels[i], { position: [stackBase.x, y + 0.05, stackBase.z + 0.5] });
      });
      const top = data.stack.length ? temps[data.stack[data.stack.length - 1]] : null;
      setLabel(status, data.popped != null ? `pop ${data.popped} · ${temps[data.popped]}°` : data.i >= 0 ? `day ${data.i} · ${temps[data.i]}° · top ${top == null ? '—' : top + '°'}` : 'push indices');
    };
  }

  function buildTopK(result) {
    const nums = result.meta.nums, k = result.meta.k;
    const arraySpacing = Math.min(1.0, 7 / Math.max(1, nums.length));
    const cubes = [], labels = [];
    nums.forEach((value, i) => {
      const cube = roundedBox(arraySpacing * 0.78, 0.72, 0.72, 0.08, '#453f21', { emissiveIntensity: 0.12 });
      cube.position.set(-7 + (i - (nums.length - 1) / 2) * arraySpacing, 0.2, 2.4);
      dynamicRoot.add(cube); cubes.push(cube);
      const sprite = label(String(value), { color: '#fff6b3', scale: Math.min(0.78, arraySpacing * 0.62), size: 50 });
      sprite.position.set(cube.position.x, 0.76, 2.86);
      dynamicRoot.add(sprite); labels.push(sprite);
    });
    const heapNodes = [], heapLabels = [];
    for (let i = 0; i < 14; i++) {
      const node = sphere(0.3, '#fff0a0', { emissiveIntensity: 0.3 });
      node.visible = false;
      dynamicRoot.add(node); heapNodes.push(node);
      const sprite = label('', { color: '#fff8ce', scale: 0.88, size: 50 });
      sprite.visible = false;
      dynamicRoot.add(sprite); heapLabels.push(sprite);
    }
    const edges = [];
    for (let i = 0; i < 14; i++) {
      const edge = cylinder(0.025, 0.025, 1, '#8c7b33', { transparent: true, opacity: 0.5 });
      edge.visible = false;
      dynamicRoot.add(edge); edges.push(edge);
    }
    const heapTitle = label(`min-heap · keep ${k}`, { color: '#ffe66b', scale: 2.7, border: '#ffe66b' });
    heapTitle.position.set(4.1, 5.0, 0);
    dynamicRoot.add(heapTitle);
    const status = label('push candidates', { color: '#fff6b3', scale: 3.3, border: '#ffe66b' });
    status.position.set(0, 6.25, 0);
    dynamicRoot.add(status);
    addPlatform(9, '#2a2716');

    const heapPos = (index, size) => {
      const depth = Math.floor(Math.log2(index + 1));
      const rowStart = Math.pow(2, depth) - 1;
      const count = Math.pow(2, depth);
      const position = index - rowStart;
      const width = Math.min(8, count * 1.4);
      return [4.1 + (position - (count - 1) / 2) * (width / count), 3.6 - depth * 1.35, 0];
    };

    return (data) => {
      cubes.forEach((cube, i) => {
        const active = data.i === i;
        tween(cube, { color: active ? '#8c7b33' : '#453f21', emissive: active ? '#ffe66b' : '#1d1a0b', emissiveIntensity: active ? 0.6 : 0.1, scale: [1, active ? 1.15 : 1, 1] });
      });
      heapNodes.forEach((node, i) => {
        const has = i < data.heap.length;
        node.visible = has; heapLabels[i].visible = has;
        if (!has) return;
        const pos = heapPos(i, data.heap.length);
        tween(node, { position: pos, scale: i === 0 ? 1.15 : 1, color: i === 0 ? '#ffe66b' : '#e1c95c', emissive: '#ffe66b', emissiveIntensity: i === 0 ? 0.85 : 0.3 });
        setLabel(heapLabels[i], String(data.heap[i]));
        tween(heapLabels[i], { position: [pos[0], pos[1] + 0.05, 0.5] });
      });
      edges.forEach((edge, i) => {
        const parent = Math.floor((i - 1) / 2);
        const has = i < data.heap.length && i > 0;
        edge.visible = has;
        if (!has) return;
        const a = heapPos(parent, data.heap.length), b = heapPos(i, data.heap.length);
        const dir = new THREE.Vector3(b[0] - a[0], b[1] - a[1], 0);
        const len = dir.length();
        edge.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0);
        edge.scale.set(1, len, 1);
        edge.quaternion.setFromUnitVectors(Y_AXIS, dir.normalize());
      });
      const pulse = data.swaps && data.swaps.length ? `swap ${data.swaps.map((pair) => pair.join('↔')).join(' ')}` : '';
      setLabel(status, data.action === 'pop' ? `evict ${data.removed} ${pulse}` : data.i >= 0 ? `push ${data.nums[data.i]} ${pulse}` : 'push candidates');
    };
  }

  function buildBinarySearchAnswer(result) {
    const piles = result.meta.piles, max = result.meta.max, h = result.meta.h;
    const ticks = Math.min(max, 24);
    const tickPositions = [];
    for (let i = 0; i < ticks; i++) {
      const value = ticks === max ? i + 1 : Math.round(1 + (i / Math.max(1, ticks - 1)) * (max - 1));
      tickPositions.push(value);
    }
    const scale = 12 / Math.max(1, max - 1);
    const xOf = (value) => (value - 1) * scale - 6;
    const tickMeshes = [];
    for (const value of [...new Set(tickPositions)]) {
      const tick = box(0.08, value === max ? 0.75 : 0.45, 0.08, '#8fe388', { transparent: true, opacity: 0.55, emissiveIntensity: 0.4 });
      tick.position.set(xOf(value), -0.6, 0);
      dynamicRoot.add(tick); tickMeshes.push(tick);
      if (value === 1 || value === max || value % Math.max(1, Math.ceil(max / 8)) === 0) {
        const sprite = label(String(value), { color: '#b9ffb1', scale: 0.95, size: 46 });
        sprite.position.set(xOf(value), -1.1, 0.3);
        dynamicRoot.add(sprite);
      }
    }
    const range = box(1, 0.28, 0.35, '#8fe388', { transparent: true, opacity: 0.28, emissiveIntensity: 0.5 });
    range.position.y = -0.6;
    dynamicRoot.add(range);
    const loBeam = beam('#8fe388', 2.4), hiBeam = beam('#ffb86b', 2.4), midBeam = beam('#ffffff', 3.3);
    dynamicRoot.add(loBeam, hiBeam, midBeam);
    const loTag = label('lo', { color: '#8fe388', scale: 0.9 }), hiTag = label('hi', { color: '#ffb86b', scale: 0.9 }), midTag = label('mid', { color: '#ffffff', scale: 0.9 });
    loTag.position.y = 2.2; hiTag.position.y = 2.2; midTag.position.y = 3.1;
    dynamicRoot.add(loTag, hiTag, midTag);
    const candidate = label('probing…', { color: '#d8ffd2', scale: 3.2, border: '#8fe388' });
    candidate.position.set(0, 5.0, 0);
    dynamicRoot.add(candidate);
    const pileText = label(`piles ${piles.join(', ')}  ·  budget ${h}h`, { color: '#b9ffb1', scale: 2.7, border: '#2b8a3e' });
    pileText.position.set(0, 5.9, 0);
    dynamicRoot.add(pileText);
    addPlatform(9, '#1d2d1e');

    return (data) => {
      const xLo = xOf(data.lo), xHi = xOf(data.hi);
      tween(range, { position: [(xLo + xHi) / 2, -0.6, 0], scale: [Math.max(0.08, (xHi - xLo) / 1), 1, 1] });
      loBeam.position.x = xLo; hiBeam.position.x = xHi;
      loTag.position.x = xLo; hiTag.position.x = xHi;
      const hasMid = data.mid != null;
      midBeam.visible = hasMid; midTag.visible = hasMid;
      if (hasMid) {
        midBeam.position.x = xOf(data.mid);
        midTag.position.x = xOf(data.mid);
      }
      setLabel(candidate, data.hours == null ? `range ${data.lo}…${data.hi}` : `speed ${data.mid} → ${data.hours}h ${data.feasible ? '✓ feasible' : '✗ too slow'}`, { color: data.feasible === false ? '#ffd6bd' : '#d8ffd2', border: data.feasible === false ? '#ffb86b' : '#8fe388' });
      tween(loBeam.userData.tip, { color: '#8fe388' });
    };
  }

  function treeScene(result, mode) {
    const tree = result.meta.tree;
    const { positions } = layoutTree(tree, 12);
    const nodes = [], labels = [], rings = [], edges = [];
    for (const node of tree.nodes) {
      const pos = positions[node.id];
      const sphereMesh = sphere(0.42, '#213f5c', { emissiveIntensity: 0.18 });
      sphereMesh.position.set(pos.x, pos.y, pos.z);
      dynamicRoot.add(sphereMesh); nodes[node.id] = sphereMesh;
      const sprite = label(String(node.val), { color: '#d8f3ff', scale: 1.55, size: 58 });
      sprite.position.set(pos.x, pos.y + 0.02, pos.z + 0.5);
      dynamicRoot.add(sprite); labels[node.id] = sprite;
      const halo = ring(0.6, 0.035, '#57d7ff', { transparent: true, opacity: 0, emissiveIntensity: 1.1 });
      halo.position.set(pos.x, pos.y, pos.z);
      dynamicRoot.add(halo); rings[node.id] = halo;
      for (const side of ['left', 'right']) {
        const child = node[side];
        if (child == null) continue;
        const cp = positions[child];
        const edge = cylinder(0.035, 0.035, 1, '#2a527a', { transparent: true, opacity: 0.6 });
        const dir = new THREE.Vector3(cp.x - pos.x, cp.y - pos.y, 0);
        edge.position.set((pos.x + cp.x) / 2, (pos.y + cp.y) / 2, 0);
        edge.scale.y = dir.length();
        edge.quaternion.setFromUnitVectors(Y_AXIS, dir.normalize());
        dynamicRoot.add(edge); edges.push({ edge, parent: node.id, child });
      }
    }
    const status = label('DFS', { color: '#bdeaff', scale: 3.2, border: '#6fd6ff' });
    status.position.set(0, 5.2, 0);
    dynamicRoot.add(status);
    const levelPlane = box(13, 0.06, 4, '#b5a0ff', { transparent: true, opacity: 0.13, emissiveIntensity: 0.5, side: THREE.DoubleSide });
    levelPlane.visible = false;
    dynamicRoot.add(levelPlane);
    addPlatform(9.5, mode === 'dfs' ? '#172b3d' : '#221d3c');

    return (data) => {
      const pathIds = data.pathIds || [];
      const pathSet = new Set(pathIds);
      const current = data.node;
      const level = current != null ? tree.nodes[current].depth : -1;
      nodes.forEach((node, id) => {
        const onPath = pathSet.has(id);
        const isCurrent = id === current;
        const found = data.out && data.out.some((row) => row.join(',') === pathIds.map((pid) => tree.nodes[pid].val).join(','));
        tween(node, {
          color: isCurrent ? '#2f7fb3' : found && onPath ? '#2c8a67' : onPath ? '#2b587d' : '#213f5c',
          emissive: isCurrent ? '#6fd6ff' : found && onPath ? '#7af0c7' : onPath ? '#3e7ead' : '#0e1d2e',
          emissiveIntensity: isCurrent ? 1.1 : onPath ? 0.5 : 0.12,
          scale: isCurrent ? 1.3 : 1
        });
        tween(rings[id], { opacity: isCurrent ? 0.9 : onPath ? 0.35 : 0, scale: isCurrent ? 1.25 : 1, color: found && onPath ? '#7af0c7' : '#6fd6ff', emissive: found && onPath ? '#7af0c7' : '#6fd6ff' });
      });
      for (const item of edges) {
        const active = pathSet.has(item.parent) && pathSet.has(item.child);
        tween(item.edge, { color: active ? '#6fd6ff' : '#2a527a', emissive: active ? '#2b77a8' : '#0b1724', opacity: active ? 0.95 : 0.45 });
      }
      if (mode === 'dfs') {
        setLabel(status, current != null ? `dfs ${tree.nodes[current].val} · remaining ${data.remaining}` : data.found != null ? `${data.found} path${data.found === 1 ? '' : 's'} found` : 'DFS');
      } else {
        levelPlane.visible = data.level >= 0;
        if (data.level >= 0) {
          tween(levelPlane, { position: [0, 3.4 - data.level * 1.65, 0], opacity: 0.2 });
          tween(levelPlane, { color: '#b5a0ff', emissive: '#b5a0ff' });
        }
        setLabel(status, data.level >= 0 ? `level ${data.level} · ${(data.row || []).join(', ')}` : 'BFS');
      }
    };
  }

  function buildTreeDFS(result) { return treeScene(result, 'dfs'); }
  function buildTreeBFS(result) { return treeScene(result, 'bfs'); }

  function buildGraph(result) {
    const { grid, rows, cols } = result.meta;
    const spacing = Math.min(1.25, 8.5 / Math.max(rows, cols, 1));
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const land = grid[r][c] === '1';
        const h = land ? 0.85 : 0.14;
        const cube = roundedBox(spacing * 0.84, h, spacing * 0.84, 0.05, land ? '#244a3a' : '#12384c', { transparent: !land, opacity: land ? 1 : 0.55, emissiveIntensity: land ? 0.15 : 0.28, metalness: 0.35 });
        const x = (c - (cols - 1) / 2) * spacing;
        const z = (r - (rows - 1) / 2) * spacing;
        cube.position.set(x, -1.7 + h / 2, z);
        cube.userData.baseY = -1.7 + h / 2;
        dynamicRoot.add(cube);
        cells.push({ r, c, cube, land, x, z });
      }
    }
    const ripple = ring(0.55, 0.035, '#7af0c7', { transparent: true, opacity: 1, emissiveIntensity: 1.4 });
    ripple.rotation.x = Math.PI / 2;
    ripple.visible = false;
    dynamicRoot.add(ripple);
    const status = label('scan the grid', { color: '#b6ffd5', scale: 3.1, border: '#79e6a8' });
    status.position.set(0, 4.6, 0);
    dynamicRoot.add(status);
    const palette = ['#79e6a8', '#57d7ff', '#ffb86b', '#c7a6ff', '#ff8da1', '#ffe66b'];
    addPlatform(8, '#142c28');

    return (data) => {
      const islandOf = data.islandOf || {};
      cells.forEach((cell) => {
        const visited = islandOf[`${cell.r},${cell.c}`];
        const isCurrent = data.current && data.current[0] === cell.r && data.current[1] === cell.c;
        const color = visited ? palette[(visited - 1) % palette.length] : cell.land ? '#244a3a' : '#12384c';
        tween(cell.cube, {
          color,
          emissive: isCurrent ? '#ffffff' : visited ? color : '#0a1f2e',
          emissiveIntensity: isCurrent ? 1.2 : visited ? 0.35 : cell.land ? 0.12 : 0.2,
          scale: isCurrent ? [1.08, 1.12, 1.08] : [1, 1, 1]
        });
      });
      if (data.current) {
        const cell = cells.find((item) => item.r === data.current[0] && item.c === data.current[1]);
        ripple.visible = true;
        tween(ripple, { position: [cell.x, -1.2, cell.z], scale: 1.4, opacity: 0.15, color: '#7af0c7', emissive: '#7af0c7' });
      } else ripple.visible = false;
      setLabel(status, data.phase === 'done' ? `${data.count} island${data.count === 1 ? '' : 's'} · ${rows}×${cols} grid` : `island #${data.island} · (${data.current ? data.current.join(', ') : '—'})`, { color: '#b6ffd5', border: '#79e6a8' });
    };
  }

  function buildBacktracking(result) {
    const nums = result.meta.nums, depth = result.meta.depth;
    const nodes = {}, labels = [], edges = [];
    const all = [];
    const width = 13;
    for (let d = 0; d <= depth; d++) {
      const count = Math.pow(2, d);
      for (let j = 0; j < count; j++) {
        const bits = d === 0 ? [] : j.toString(2).padStart(d, '0').split('').map(Number);
        const key = bits.join('');
        const x = (j - (count - 1) / 2) * (width / count);
        const y = 3.2 - d * 1.55;
        const node = sphere(d === depth ? 0.25 : 0.3, '#33233e', { emissiveIntensity: 0.15 });
        node.position.set(x, y, 0);
        dynamicRoot.add(node); nodes[key] = node;
        const subset = bits.map((bit, i) => (bit ? nums[i] : null)).filter((v) => v != null);
        const sprite = label(d === depth ? `[${subset.join(',')}]` : subset.length ? `[${subset.join(',')}]` : '∅', { color: d === depth ? '#ffd9f3' : '#d8c3d8', scale: d === depth ? 1.35 : 1.15, size: 48 });
        sprite.position.set(x, y + 0.62, 0.3);
        dynamicRoot.add(sprite); labels.push(sprite);
        if (d > 0) {
          const parentBits = bits.slice(0, -1).join('');
          const parent = nodes[parentBits];
          const edge = cylinder(0.025, 0.025, 1, '#5a3a5e', { transparent: true, opacity: 0.6 });
          const dir = new THREE.Vector3(x - parent.position.x, y - parent.position.y, 0);
          edge.position.set((x + parent.position.x) / 2, (y + parent.position.y) / 2, 0);
          edge.scale.y = dir.length();
          edge.quaternion.setFromUnitVectors(Y_AXIS, dir.normalize());
          dynamicRoot.add(edge); edges.push({ edge, key, parent: parentBits });
        }
        all.push(key);
      }
    }
    const status = label('choose → explore → un-choose', { color: '#ffd9f3', scale: 3.0, border: '#ff9de2' });
    status.position.set(0, 4.7, 0);
    dynamicRoot.add(status);
    addPlatform(9, '#2d1b30');

    return (data) => {
      const active = data.bits.join('');
      const abandoned = new Set(data.abandoned || []);
      nodes && Object.entries(nodes).forEach(([key, node]) => {
        const isActive = key === active;
        const isAncestor = key.length < active.length && active.startsWith(key);
        const isAbandoned = abandoned.has(key);
        tween(node, {
          color: isActive ? '#ffb6ec' : isAncestor ? '#7b4a7d' : isAbandoned ? '#3a1f24' : '#33233e',
          emissive: isActive ? '#ff9de2' : isAncestor ? '#b02a8a' : isAbandoned ? '#c22f48' : '#180f1c',
          emissiveIntensity: isActive ? 1.2 : isAncestor ? 0.4 : isAbandoned ? 0.16 : 0.08,
          scale: isActive ? 1.25 : 1
        });
        if (isAbandoned && !isAncestor && !isActive) {
          node.material.wireframe = true;
        } else {
          node.material.wireframe = false;
        }
      });
      for (const item of edges) {
        const activeEdge = active.startsWith(item.key) || item.key === active;
        const abandonedEdge = abandoned.has(item.key);
        tween(item.edge, { color: activeEdge ? '#ff9de2' : abandonedEdge ? '#8a2f45' : '#5a3a5e', opacity: activeEdge ? 0.95 : abandonedEdge ? 0.4 : 0.5, emissive: activeEdge ? '#b02a8a' : '#1e1420' });
      }
      const subset = data.path.length ? `[${data.path.join(', ')}]` : '∅';
      setLabel(status, data.action === 'done' ? `${data.out.length} subsets generated` : data.action === 'emit' ? `emit ${subset}` : data.action === 'backtrack' ? `undo → ${subset}` : `choose at depth ${data.index} · ${subset}`);
    };
  }

  function buildDynamicProgramming(result) {
    const coins = result.meta.coins, amount = result.meta.amount, INF = result.meta.inf;
    const cellW = Math.min(0.74, 10 / Math.max(1, amount + 1));
    const cellD = Math.min(0.86, 5.4 / Math.max(1, coins.length));
    const cells = [];
    for (let r = 0; r < coins.length; r++) {
      for (let c = 0; c <= amount; c++) {
        const cube = box(cellW * 0.82, 1, cellD * 0.82, '#173f3d', { transparent: true, opacity: 0.92, emissiveIntensity: 0.1, metalness: 0.38 });
        const x = (c - amount / 2) * cellW;
        const z = (r - (coins.length - 1) / 2) * cellD;
        cube.position.set(x, -1.9, z);
        cube.userData.baseX = x; cube.userData.baseZ = z;
        dynamicRoot.add(cube); cells.push({ r, c, cube, x, z });
      }
    }
    const depLines = [];
    for (let i = 0; i < 5; i++) {
      const line = cylinder(0.025, 0.025, 1, '#ffe66b', { transparent: true, opacity: 0.8, emissiveIntensity: 0.8 });
      line.visible = false;
      dynamicRoot.add(line); depLines.push(line);
    }
    const status = label('fill the DP grid', { color: '#b9fff4', scale: 3.3, border: '#66e0d0' });
    status.position.set(0, 3.9, 0);
    dynamicRoot.add(status);
    const coinLabels = coins.map((coin, r) => {
      const sprite = label(`${coin}¢`, { color: '#8ef0e3', scale: 0.9, size: 46 });
      sprite.position.set(-(amount / 2 + 0.75) * cellW, -1.9, (r - (coins.length - 1) / 2) * cellD);
      dynamicRoot.add(sprite);
      return sprite;
    });
    addPlatform(9, '#142b2c');

    return (data) => {
      const maxValue = Math.max(1, ...data.table.flat().filter((v) => v < INF));
      cells.forEach((cell) => {
        const value = data.table[cell.r][cell.c];
        const reachable = value < INF;
        const h = reachable ? 0.16 + (value / maxValue) * 2.8 : 0.1;
        const current = data.r === cell.r && data.c === cell.c;
        const dep = (data.deps || []).some((pair) => pair[0] === cell.r && pair[1] === cell.c);
        const hue = reachable ? Math.max(0.08, 1 - value / (maxValue + 1)) : 0;
        const color = reachable ? (current ? '#d9fff9' : dep ? '#ffe66b' : `hsl(${176 - hue * 18}, 62%, ${30 + hue * 22}%)`) : '#152a2e';
        tween(cell.cube, {
          position: [cell.x, -1.9 + h / 2, cell.z],
          scale: [1, h, 1],
          color,
          emissive: current ? '#66e0d0' : dep ? '#ffe66b' : '#0b2d2b',
          emissiveIntensity: current ? 1.1 : dep ? 0.7 : 0.08
        });
      });
      depLines.forEach((line, i) => {
        const dep = (data.deps || [])[i];
        line.visible = Boolean(dep) && data.r >= 0;
        if (!dep || data.r < 0) return;
        const a = cells.find((cell) => cell.r === dep[0] && cell.c === dep[1]);
        const b = cells.find((cell) => cell.r === data.r && cell.c === data.c);
        if (!a || !b) { line.visible = false; return; }
        const from = new THREE.Vector3(a.x, 0.2, a.z);
        const to = new THREE.Vector3(b.x, 0.7, b.z);
        const dir = to.clone().sub(from);
        line.position.copy(from).add(to).multiplyScalar(0.5);
        line.scale.set(1, dir.length(), 1);
        line.quaternion.setFromUnitVectors(Y_AXIS, dir.normalize());
      });
      const value = data.r >= 0 ? data.table[data.r][data.c] : null;
      setLabel(status, data.action === 'done' ? `answer ${data.table[data.r][data.c] >= INF ? '∞' : data.table[data.r][data.c]} coins` : data.r >= 0 ? `coin ${coins[data.r]} · amount ${data.c} · dp ${value >= INF ? '∞' : value}` : 'fill the DP grid');
    };
  }

  function buildCyclicSort(result) {
    const n = result.meta.n;
    const radius = Math.min(5.2, 2.8 + n * 0.24);
    const slots = [], tokens = [], labels = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 + Math.PI / 2;
      const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius;
      const slot = cylinder(0.52, 0.58, 0.2, '#3b3020', { transparent: true, opacity: 0.9, emissiveIntensity: 0.15 });
      slot.position.set(x, -1.15, z);
      dynamicRoot.add(slot); slots.push(slot);
      const token = cylinder(0.34, 0.4, 0.62, '#ffc46b', { emissive: '#ffc46b', emissiveIntensity: 0.25 });
      token.position.set(x, -0.75, z);
      dynamicRoot.add(token); tokens.push(token);
      const sprite = label('', { color: '#2a1c08', bg: 'rgba(255, 241, 205, 0.96)', border: '#ffc46b', scale: 0.78, size: 54 });
      sprite.position.set(x, -0.72, z + 0.02);
      dynamicRoot.add(sprite); labels.push(sprite);
      const indexTag = label(String(i), { color: '#d9b573', scale: 0.72, size: 42 });
      indexTag.position.set(x * 1.18, -1.55, z * 1.18);
      dynamicRoot.add(indexTag);
    }
    const track = ring(radius, 0.05, '#ffc46b', { transparent: true, opacity: 0.35 });
    track.rotation.x = Math.PI / 2;
    track.position.y = -1.28;
    dynamicRoot.add(track);
    const status = label('tokens on a track', { color: '#ffe1ad', scale: 3.1, border: '#ffc46b' });
    status.position.set(0, 3.45, 0);
    dynamicRoot.add(status);
    addPlatform(radius + 2.2, '#2c2416');

    const positions = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 + Math.PI / 2;
      positions.push([Math.cos(angle) * radius, -0.75, Math.sin(angle) * radius]);
    }
    return (data) => {
      tokens.forEach((token, i) => {
        const value = data.nums[i];
        const targetIndex = value < n ? value : i;
        const current = i === data.i;
        const hole = value >= n;
        tween(token, {
          position: positions[targetIndex],
          color: current ? '#ffe0a3' : hole ? '#4a3821' : '#ffc46b',
          emissive: current ? '#fff0cc' : '#ffc46b',
          emissiveIntensity: current ? 1.1 : 0.25,
          scale: current ? [1.12, 1.12, 1.12] : [1, 1, 1]
        });
        setLabel(labels[i], String(value));
        tween(labels[i], { position: [positions[targetIndex][0], positions[targetIndex][1] + 0.02, positions[targetIndex][2] + 0.02], color: hole ? '#8a6a3a' : '#2a1c08' });
      });
      const missing = data.missing;
      setLabel(status, missing == null ? data.swapped ? `swap ${data.swapped[0]} ↔ ${data.swapped[1]}` : `index ${data.i}` : `missing ${missing}`, { color: '#ffe1ad', border: '#ffc46b' });
    };
  }

  function buildReverseLinkedList(result) {
    const values = result.meta.values;
    const n = values.length;
    const spacing = Math.min(2.2, 12 / Math.max(1, n));
    const nodes = [], labels = [], halos = [];
    const xOf = (i) => (i - (n - 1) / 2) * spacing;
    values.forEach((value, i) => {
      const node = roundedBox(0.82, 0.82, 0.82, 0.16, '#243a63', { emissiveIntensity: 0.2, metalness: 0.45 });
      node.position.set(xOf(i), 0, 0);
      dynamicRoot.add(node); nodes.push(node);
      const sprite = label(String(value), { color: '#d8e6ff', scale: 1.1, size: 62 });
      sprite.position.set(xOf(i), 0, 0.52);
      dynamicRoot.add(sprite); labels.push(sprite);
      const halo = ring(0.58, 0.03, '#9ab8ff', { transparent: true, opacity: 0, emissiveIntensity: 1 });
      halo.position.set(xOf(i), 0, 0);
      dynamicRoot.add(halo); halos.push(halo);
    });
    const arrows = [];
    for (let i = 0; i < n; i++) {
      const arrow = makeArrow('#43618f');
      dynamicRoot.add(arrow); arrows.push(arrow);
    }
    const status = label('prev null · curr head', { color: '#d8e6ff', scale: 3.4, border: '#9ab8ff' });
    status.position.set(0, 3.05, 0);
    dynamicRoot.add(status);
    addPlatform(9, '#1a2440');

    return (data) => {
      nodes.forEach((node, i) => {
        const isCurr = i === data.curr, isPrev = i === data.prev, isNext = i === data.next;
        tween(node, {
          color: isCurr ? '#3b5e9e' : isPrev ? '#2e7d5f' : '#243a63',
          emissive: isCurr ? '#9ab8ff' : isPrev ? '#7af0c7' : '#0d1729',
          emissiveIntensity: isCurr ? 1 : isPrev ? 0.5 : 0.12,
          scale: isCurr ? 1.15 : 1
        });
        tween(halos[i], { opacity: isCurr ? 0.9 : isPrev ? 0.45 : 0, color: isCurr ? '#9ab8ff' : '#7af0c7', emissive: isCurr ? '#9ab8ff' : '#7af0c7' });
      });
      arrows.forEach((arrow, i) => {
        const target = data.links[i];
        if (target === -1) { arrow.visible = false; return; }
        const reversed = target < i;
        placeArrow(arrow, [xOf(i) + (reversed ? -0.46 : 0.46), 0.04, 0], [xOf(target) + (reversed ? 0.46 : -0.46), 0.04, 0], reversed ? '#7af0c7' : '#43618f');
      });
      setLabel(status, `prev ${data.prev === -1 ? 'null' : values[data.prev]} · curr ${data.curr === -1 ? 'null' : values[data.curr]} · next ${data.next === -1 ? 'null' : values[data.next]}`);
    };
  }

  function buildUnionFind(result) {
    const nodesIds = result.meta.nodes;
    const n = nodesIds.length;
    const radius = Math.min(4.8, 2.5 + n * 0.26);
    const pos = {}, nodeMeshes = [], labels = [], halos = [];
    nodesIds.forEach((id, i) => {
      const angle = (i / n) * Math.PI * 2 + Math.PI / 2;
      const p = [Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius];
      pos[id] = p;
      const node = sphere(0.42, '#3d2350', { emissiveIntensity: 0.2 });
      node.position.set(...p);
      dynamicRoot.add(node); nodeMeshes.push({ id, node });
      const sprite = label(String(id), { color: '#f4d9ff', scale: 1.0, size: 58 });
      sprite.position.set(p[0], p[1] + 0.78, p[2] + 0.1);
      dynamicRoot.add(sprite); labels.push(sprite);
      const halo = ring(0.6, 0.035, '#f0a6ff', { transparent: true, opacity: 0, emissiveIntensity: 1 });
      halo.position.set(p[0], p[1], p[2]);
      dynamicRoot.add(halo); halos.push(halo);
    });
    const edgeMeshes = result.meta.edges.map((edge) => {
      const meshEdge = curveBetween(pos[edge[0]], pos[edge[1]], '#5a3a6b', 1.3, 0.55);
      dynamicRoot.add(meshEdge);
      return meshEdge;
    });
    const status = label('union-find', { color: '#f4d9ff', scale: 3.2, border: '#f0a6ff' });
    status.position.set(0, 3.4, 0);
    dynamicRoot.add(status);
    addPlatform(radius + 2.2, '#261b30');
    const palette = ['#f0a6ff', '#57d7ff', '#7af0c7', '#ffb86b', '#ff8da1', '#ffe66b', '#b5a0ff'];

    return (data) => {
      const roots = {};
      nodeMeshes.forEach(({ id }, i) => {
        const root = data.parent[id] == null ? id : data.parent[id];
        roots[id] = root;
      });
      const rootSet = [...new Set(Object.values(roots))];
      nodeMeshes.forEach(({ id, node }, i) => {
        const root = roots[id];
        const color = palette[rootSet.indexOf(root) % palette.length];
        const active = data.edge && data.edge.includes(id);
        const isRoot = rootSet.includes(id) && data.edge == null;
        tween(node, { color: active ? '#ffffff' : color, emissive: active ? '#ffffff' : color, emissiveIntensity: active ? 1 : isRoot ? 0.45 : 0.2, scale: active ? 1.2 : 1 });
        tween(halos[i], { opacity: isRoot ? 0.55 : 0, color, emissive: color });
      });
      edgeMeshes.forEach((edge, i) => {
        const item = data.edges[i];
        const active = data.edge && data.edge[0] === item[0] && data.edge[1] === item[1];
        const cycle = data.cycleEdge && data.cycleEdge[0] === item[0] && data.cycleEdge[1] === item[1];
        tween(edge, { color: cycle ? '#ff5577' : active ? '#f0a6ff' : '#5a3a6b', emissive: cycle ? '#c22f48' : active ? '#9a35b8' : '#1c1224', opacity: cycle ? 0.95 : active ? 0.95 : 0.4 });
      });
      setLabel(status, data.cycleEdge ? `redundant (${data.cycleEdge.join(', ')})` : data.edge ? `edge (${data.edge.join(', ')}) → roots ${data.roots.join(', ')}` : data.action === 'done' ? 'all unions complete' : 'union-find');
    };
  }

  const BUILDERS = {
    'two-pointers': buildTwoPointers,
    'sliding-window': buildSlidingWindow,
    'fast-slow': buildFastSlow,
    'merge-intervals': buildMergeIntervals,
    'monotonic-stack': buildMonotonicStack,
    'top-k': buildTopK,
    'binary-search-answer': buildBinarySearchAnswer,
    'tree-dfs': buildTreeDFS,
    'tree-bfs': buildTreeBFS,
    'graph-traversal': buildGraph,
    'backtracking': buildBacktracking,
    'dynamic-programming': buildDynamicProgramming,
    'cyclic-sort': buildCyclicSort,
    'reverse-linked-list': buildReverseLinkedList,
    'union-find': buildUnionFind
  };

  function resize() {
    if (!renderer || !container) return;
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    if (camera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
    lastTime = now;
    if (!ready) return;
    if (controls) controls.update();
    if (dynamicRoot) applyTweens(dynamicRoot, dt);
    if (stars) stars.rotation.y += dt * 0.008;
    if (accentLight) accentLight.intensity = 1.1 + Math.sin(now * 0.0012) * 0.18;
    renderer.render(scene, camera);
  }

  function init(target) {
    container = target;
    if (!root.THREE) {
      container.innerHTML = '<div class="stage-error"><strong>WebGL is unavailable.</strong><br>Three.js did not load. The quiz and practice tabs still work.</div>';
      return false;
    }
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
      renderer.setSize(container.clientWidth, container.clientHeight, false);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.setAttribute('aria-label', 'Interactive 3D algorithm visualization');
      renderer.domElement.setAttribute('role', 'img');
      container.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050912, 0.015);
      camera = new THREE.PerspectiveCamera(44, container.clientWidth / Math.max(1, container.clientHeight), 0.1, 200);
      camera.position.set(0, 7, 14);

      scene.add(new THREE.HemisphereLight(0x9bc8ff, 0x101820, 0.75));
      const key = new THREE.DirectionalLight(0xffffff, 1.25);
      key.position.set(6, 12, 8);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 1; key.shadow.camera.far = 40;
      key.shadow.camera.left = -12; key.shadow.camera.right = 12;
      key.shadow.camera.top = 12; key.shadow.camera.bottom = -12;
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x5aa9ff, 0.65);
      rim.position.set(-8, 5, -9);
      scene.add(rim);
      accentLight = new THREE.PointLight(0x57d7ff, 1.1, 30);
      accentLight.position.set(0, 5, 4);
      scene.add(accentLight);

      const starGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(900);
      for (let i = 0; i < 300; i++) {
        const r = 18 + Math.random() * 28;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = r * Math.cos(phi) * 0.6 + 3;
        starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      }
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x7fb7ff, size: 0.075, transparent: true, opacity: 0.65, sizeAttenuation: true }));
      scene.add(stars);

      dynamicRoot = new THREE.Group();
      scene.add(dynamicRoot);

      if (THREE.OrbitControls) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.075;
        controls.minDistance = 4;
        controls.maxDistance = 34;
        controls.maxPolarAngle = Math.PI * 0.495;
        controls.target.set(0, 0.6, 0);
      }
      ready = true;
      resize();
      lastTime = performance.now();
      raf = requestAnimationFrame(loop);
      if (root.ResizeObserver) new ResizeObserver(resize).observe(container);
      root.addEventListener('resize', resize);
      return true;
    } catch (error) {
      ready = false;
      container.innerHTML = `<div class="stage-error"><strong>3D stage could not start.</strong><br>${String(error.message || error)}</div>`;
      return false;
    }
  }

  function setPattern(pattern, result) {
    if (!ready || !pattern || !result) return false;
    currentPattern = pattern;
    currentResult = result;
    if (dynamicRoot) disposeObject(dynamicRoot);
    dynamicRoot = new THREE.Group();
    scene.add(dynamicRoot);
    accentLight.color.set(pattern.accent);
    if (pattern.accent2) accentLight.color.lerp(hex(pattern.accent2), 0.25);
    const config = CAMS[pattern.id] || CAMS['two-pointers'];
    camera.fov = config.fov;
    camera.position.set(...config.pos);
    camera.updateProjectionMatrix();
    if (controls) { controls.target.set(...config.target); controls.update(); }
    home = { pos: new THREE.Vector3(...config.pos), target: new THREE.Vector3(...config.target) };
    updater = BUILDERS[pattern.id] ? BUILDERS[pattern.id](result) : null;
    if (updater && result.frames[0]) updater(result.frames[0].data, result.frames[0]);
    return true;
  }

  function showFrame(frame) {
    if (!ready || !frame || !updater) return;
    currentFrame = frame;
    updater(frame.data, frame);
  }

  function resetCamera() {
    if (!ready || !controls) return;
    camera.position.copy(home.pos);
    controls.target.copy(home.target);
    controls.update();
  }

  function setAutoRotate(value) {
    if (controls) controls.autoRotate = Boolean(value);
  }

  function screenshotData() {
    if (!ready) return null;
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/png');
  }

  root.AlgoScene = { init, setPattern, showFrame, resetCamera, setAutoRotate, resize, screenshotData, get ready() { return ready; }, get pattern() { return currentPattern?.id || null; }, get frame() { return currentFrame; } };
})(window);
