import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import * as THREE from 'three';

export function createPlayer(camera, domElement) {
  const controls = new PointerLockControls(camera, domElement);
  const keys = { forward: false, backward: false, left: false, right: false };
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const speed = 3.2;
  const eyeHeight = 1.65;

  function onKeyDown(event) { setKey(event.code, true); }
  function onKeyUp(event) { setKey(event.code, false); }
  function setKey(code, value) {
    if (code === 'KeyW' || code === 'ArrowUp') keys.forward = value;
    if (code === 'KeyS' || code === 'ArrowDown') keys.backward = value;
    if (code === 'KeyA' || code === 'ArrowLeft') keys.left = value;
    if (code === 'KeyD' || code === 'ArrowRight') keys.right = value;
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  function update(delta) {
    if (!controls.isLocked) return;
    direction.set(Number(keys.right) - Number(keys.left), 0, Number(keys.backward) - Number(keys.forward));
    if (direction.lengthSq() > 0) direction.normalize();
    velocity.x = direction.x * speed;
    velocity.z = direction.z * speed;
    controls.moveRight(velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    // Keep the visitor inside the study and at a fixed eye height.
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5.25, 5.25);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5.25, 5.25);
    camera.position.y = eyeHeight;
  }

  return {
    controls,
    update,
    lock: () => controls.lock(),
    unlock: () => controls.unlock(),
    dispose() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      controls.dispose();
    }
  };
}
