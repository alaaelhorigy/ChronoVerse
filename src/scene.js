import * as THREE from 'three';

export function createWorld(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x19150f);
  scene.fog = new THREE.Fog(0x19150f, 11, 29);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.65, 5.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.replaceChildren(renderer.domElement);

  // Warm, late-afternoon study lighting.
  scene.add(new THREE.HemisphereLight(0xc9d8e8, 0x382414, 1.3));
  const keyLight = new THREE.PointLight(0xffc77c, 95, 18, 2);
  keyLight.position.set(-3, 4.4, -2);
  keyLight.castShadow = true;
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0x8ca8c7, 22, 14);
  fillLight.position.set(4, 2.8, 3);
  scene.add(fillLight);

  const wood = new THREE.MeshStandardMaterial({ color: 0x604128, roughness: 0.78 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x38271d, roughness: 0.85 });
  const plaster = new THREE.MeshStandardMaterial({ color: 0x88745d, roughness: 0.95 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x4a3829, roughness: 0.9 });
  const chalk = new THREE.MeshStandardMaterial({ color: 0x1d302a, roughness: 1 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xb18a43, metalness: 0.68, roughness: 0.35 });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0; floor.receiveShadow = true; scene.add(floor);

  // Three enclosing walls leave the front open for the visitor.
  addBox(scene, [12, 4.5, 0.25], [0, 2.25, -6], plaster);
  addBox(scene, [0.25, 4.5, 12], [-6, 2.25, 0], plaster);
  addBox(scene, [0.25, 4.5, 12], [6, 2.25, 0], plaster);
  addBox(scene, [12, 0.18, 12], [0, 4.5, 0], darkWood);

  // Desk and chair.
  addBox(scene, [2.5, 0.16, 1.15], [0.3, 1.05, -1.4], wood);
  for (const x of [-0.75, 1.35]) for (const z of [-1.82, -0.98]) addBox(scene, [0.13, 1.0, 0.13], [x, 0.5, z], darkWood);
  addBox(scene, [0.9, 0.12, 0.9], [0.2, 0.58, 0.35], darkWood);
  addBox(scene, [0.9, 1.0, 0.12], [0.2, 1.05, 0.78], darkWood);

  // Bookshelf on the left wall with visible book spines.
  addBox(scene, [0.35, 2.8, 2.6], [-5.55, 1.45, -2.6], darkWood);
  for (const y of [0.5, 1.35, 2.2]) addBox(scene, [0.48, 0.09, 2.5], [-5.28, y, -2.6], wood);
  const bookColors = [0x7d3d2f, 0x344e4b, 0x9a7541, 0x41465d, 0x765c4a];
  for (let shelf = 0; shelf < 3; shelf++) {
    for (let i = 0; i < 8; i++) {
      const h = 0.42 + (i % 3) * 0.08;
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.18, h, 0.24), new THREE.MeshStandardMaterial({ color: bookColors[i % bookColors.length], roughness: 0.9 }));
      book.position.set(-5.02, 0.72 + shelf * 0.85 + h / 2, -3.55 + i * 0.28);
      book.castShadow = true; scene.add(book);
    }
  }

  // Chalkboard and simple equation marks.
  addBox(scene, [3.0, 1.65, 0.12], [2.4, 2.55, -5.78], darkWood);
  addBox(scene, [2.75, 1.42, 0.035], [2.4, 2.58, -5.69], chalk);
  addTextLikeLine(scene, [1.45, 2.95, -5.65], [1.4, 0.025, 0.02], 0xe8dfc7);
  addTextLikeLine(scene, [1.7, 2.55, -5.65], [0.9, 0.025, 0.02], 0xe8dfc7);
  addTextLikeLine(scene, [2.1, 2.15, -5.65], [1.5, 0.025, 0.02], 0xe8dfc7);

  // Window with blue glass and wooden frame.
  const glass = new THREE.MeshStandardMaterial({ color: 0x7896a8, emissive: 0x263c50, emissiveIntensity: 0.35, roughness: 0.25 });
  addBox(scene, [0.12, 1.9, 2.2], [5.78, 2.65, -2.4], darkWood);
  addBox(scene, [0.05, 1.55, 1.85], [5.69, 2.65, -2.4], glass);
  addBox(scene, [0.15, 0.08, 2.1], [5.62, 2.65, -2.4], wood);
  addBox(scene, [0.15, 1.8, 0.08], [5.62, 2.65, -2.4], wood);

  // Desk props: papers, books, a brass compass and a small globe.
  addBox(scene, [0.75, 0.025, 0.52], [0.15, 1.15, -1.4], new THREE.MeshStandardMaterial({ color: 0xd9cba9 }));
  addBox(scene, [0.42, 0.12, 0.32], [0.9, 1.2, -1.38], new THREE.MeshStandardMaterial({ color: 0x6d4933 }));
  const compass = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.07, 32), brass);
  compass.position.set(-0.65, 1.2, -1.4); compass.castShadow = true; scene.add(compass);
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 16), new THREE.MeshStandardMaterial({ color: 0x547b83, roughness: 0.7 }));
  globe.position.set(1.15, 1.55, -1.55); scene.add(globe);
  const globeStand = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.08, 0.22, 12), brass);
  globeStand.position.set(1.15, 1.28, -1.55); scene.add(globeStand);

  // Floating dust motes for atmosphere.
  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(260 * 3);
  for (let i = 0; i < 260; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 10;
    dustPositions[i * 3 + 1] = Math.random() * 3.8 + 0.2;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0xe8c98c, size: 0.025, transparent: true, opacity: 0.5 }));
  scene.add(dust);

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  return {
    scene, camera, renderer, dust,
    dispose() {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.replaceChildren();
    }
  };
}

function addBox(scene, size, position, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
  return mesh;
}
function addTextLikeLine(scene, position, size, color) {
  const line = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshBasicMaterial({ color }));
  line.position.set(...position); scene.add(line);
}
