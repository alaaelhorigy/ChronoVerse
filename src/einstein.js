import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Public Three.js sample humanoid used as a temporary avatar.
// Replace this URL with a licensed Einstein GLB model when one is available.
const MODEL_URL = 'https://threejs.org/examples/models/gltf/Soldier.glb';

export async function addEinstein(scene) {
  const group = new THREE.Group();
  group.position.set(-1.35, 0, -3.0);
  group.name = 'Einstein';
  scene.add(group);

  try {
    const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
    const model = gltf.scene;
    model.scale.setScalar(1.05);
    model.rotation.y = Math.PI;
    model.position.y = 0;
    model.traverse((node) => {
      if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; }
    });
    group.add(model);
    // The sample model is a stand-in, not a historically accurate Einstein likeness.
  } catch (error) {
    console.warn('Could not load the sample humanoid; using procedural placeholder.', error);
    addFallbackHumanoid(group);
  }

  // A subtle marker makes the interaction target easy to locate.
  const marker = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 32),
    new THREE.MeshBasicMaterial({ color: 0xc7a15b, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 0.025;
  group.add(marker);

  return group;
}

function addFallbackHumanoid(group) {
  const coat = new THREE.MeshStandardMaterial({ color: 0x514c48, roughness: 0.9 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xc69c78, roughness: 0.9 });
  const hair = new THREE.MeshStandardMaterial({ color: 0xb9b4a9, roughness: 1 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.7, 4, 8), coat);
  body.position.y = 1.05; body.castShadow = true; group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 10), skin);
  head.position.y = 1.72; head.castShadow = true; group.add(head);
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.27, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), hair);
  hairCap.position.y = 1.82; group.add(hairCap);
  for (const x of [-0.19, 0.19]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.75, 8), coat);
    leg.position.set(x, 0.38, 0); group.add(leg);
  }
}

