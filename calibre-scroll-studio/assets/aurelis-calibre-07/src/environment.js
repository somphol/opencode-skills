import * as THREE from 'three';

/**
 * A tiny procedural photo studio, baked into a PMREM environment map.
 * No HDR file, no network request: four emissive panels produce the long,
 * soft highlights that make polished metal read as metal.
 */
export function createStudioEnvironment(renderer) {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x060607);

  const plane = new THREE.PlaneGeometry(1, 1);
  const panels = [];

  const panel = (color, intensity, width, height, position, rotation) => {
    const c = new THREE.Color(color).multiplyScalar(intensity);
    const material = new THREE.MeshBasicMaterial({
      color: c,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(plane, material);
    mesh.scale.set(width, height, 1);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    envScene.add(mesh);
    panels.push(mesh);
    return mesh;
  };

  // Overhead key — broad and slightly warm.
  panel(0xfff8ee, 3.6, 11, 7, [0, 6, 1], [Math.PI / 2, 0, 0]);
  // Tall warm strip on the left: the gold highlight.
  panel(0xffd7a0, 4.6, 3.2, 9, [-6, 0.5, 1], [0, Math.PI / 2, 0]);
  // Cool strip on the right: keeps the steel from reading yellow.
  panel(0xa9c8ff, 2.6, 2.4, 7.5, [6, 0, -0.5], [0, -Math.PI / 2, 0]);
  // Soft frontal fill so the dial is never flat black.
  panel(0xfff2e2, 1.1, 8, 4.5, [0, 0.4, 7], [0, Math.PI, 0]);
  // A dim backdrop bounce.
  panel(0x6f7a8a, 0.9, 10, 4, [0, -1, -7], [0, 0, 0]);
  // Narrow specular streak for that single hard glint on the bezel.
  panel(0xffffff, 5.0, 0.55, 5.5, [-3.4, 2.2, 4.2], [0, Math.PI * 0.7, 0]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const renderTarget = pmrem.fromScene(envScene, 0.035, 0.1, 100);
  pmrem.dispose();

  for (const mesh of panels) mesh.material.dispose();
  plane.dispose();
  envScene.clear();

  return renderTarget.texture;
}

export function createMaterials() {
  const physical = (params) =>
    new THREE.MeshPhysicalMaterial({
      metalness: 1,
      roughness: 0.2,
      envMapIntensity: 1.1,
      ...params,
    });

  return {
    gold: physical({
      color: 0xd2a45c,
      roughness: 0.16,
      envMapIntensity: 1.35,
    }),
    goldBrushed: physical({
      color: 0xbf9149,
      roughness: 0.38,
      envMapIntensity: 1.1,
    }),
    goldDeep: physical({
      color: 0x9d7534,
      roughness: 0.28,
      envMapIntensity: 1.05,
    }),
    steel: physical({
      color: 0xd6dce1,
      roughness: 0.19,
      envMapIntensity: 1.15,
    }),
    steelBrushed: physical({
      color: 0xb4bcc2,
      roughness: 0.4,
      envMapIntensity: 0.95,
    }),
    rhodium: physical({
      color: 0xc7cace,
      roughness: 0.3,
      envMapIntensity: 0.95,
    }),
    rhodiumDark: physical({
      color: 0x8f949a,
      roughness: 0.45,
      envMapIntensity: 0.8,
    }),
    blued: physical({
      color: 0x35589c,
      roughness: 0.2,
      metalness: 0.82,
      envMapIntensity: 1.6,
    }),
    ruby: new THREE.MeshPhysicalMaterial({
      color: 0x8e1226,
      metalness: 0.15,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.92,
      envMapIntensity: 1.8,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xdfe9f2,
      metalness: 0,
      roughness: 0.02,
      transparent: true,
      opacity: 0.17,
      clearcoat: 1,
      clearcoatRoughness: 0,
      envMapIntensity: 2.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    enamel: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.28,
      clearcoat: 0.85,
      clearcoatRoughness: 0.3,
      envMapIntensity: 0.5,
    }),
    dialDark: physical({
      color: 0x3b3934,
      roughness: 0.5,
      metalness: 0.6,
      envMapIntensity: 0.6,
    }),
    engraving: new THREE.MeshStandardMaterial({
      color: 0x565049,
      metalness: 0.8,
      roughness: 0.5,
      transparent: true,
      depthWrite: false,
    }),
  };
}
