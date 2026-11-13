import * as THREE from 'three';
import './style.css';
import { createWorld } from './scene.js';
import { createPlayer } from './player.js';
import { addEinstein } from './einstein.js';
import { createChat } from './chat.js';
import { getUI, showRoom, showLanding, setChatOpen } from './ui.js';

const ui = getUI();
let world = null;
let player = null;
let einstein = null;
let chat = null;
let animationFrame = 0;
let previousTime = 0;
let nearEinstein = false;
let onKeyDown = null;
const clock = new THREE.Clock();

const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 700;
if (isMobile) {
  ui.enter.addEventListener('click', (event) => {
    event.preventDefault();
    alert('الغرفة ثلاثية الأبعاد مصممة حالياً للكمبيوتر. افتح المشروع من جهاز Desktop أو Laptop للتجربة الكاملة.');
  });
} else {
  ui.enter.addEventListener('click', enterRoom);
}

ui.back.addEventListener('click', exitRoom);
ui.startWalking.addEventListener('click', () => player?.lock());
ui.closeChat.addEventListener('click', closeConversation);

chat = createChat({
  messagesElement: ui.chatMessages,
  form: ui.chatForm,
  input: ui.chatInput,
  sendButton: ui.sendButton,
  onOpenChange: (open) => setChatOpen(ui, open)
});

async function enterRoom() {
  showRoom(ui);
  ui.loading.classList.remove('hidden');
  ui.lockOverlay.classList.add('hidden');
  try {
    world = createWorld(ui.container);
    player = createPlayer(world.camera, world.renderer.domElement);
    einstein = await addEinstein(world.scene);
    ui.loading.classList.add('hidden');
    ui.lockOverlay.classList.remove('hidden');
    ui.hints.classList.remove('hidden');
    player.controls.addEventListener('lock', () => ui.lockOverlay.classList.add('hidden'));
    player.controls.addEventListener('unlock', () => {
      if (!ui.chatPanel.classList.contains('open')) ui.lockOverlay.classList.remove('hidden');
    });
    onKeyDown = (event) => {
      if (event.code === 'KeyE' && nearEinstein && !ui.chatPanel.classList.contains('open')) {
        event.preventDefault();
        openConversation();
      }
      if (event.code === 'Escape' && ui.chatPanel.classList.contains('open')) closeConversation();
    };
    window.addEventListener('keydown', onKeyDown);
    previousTime = performance.now();
    animate();
  } catch (error) {
    console.error(error);
    ui.loading.classList.add('hidden');
    alert('حصلت مشكلة وإحنا بنجهّز الغرفة. حدّث الصفحة وحاول تاني.');
    exitRoom();
  }
}

function animate() {
  animationFrame = requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  player?.update(delta);

  if (einstein && player) {
    const distance = new THREE.Vector2(world.camera.position.x - einstein.position.x, world.camera.position.z - einstein.position.z).length();
    nearEinstein = distance < 2.5;
    ui.prompt.classList.toggle('hidden', !nearEinstein || ui.chatPanel.classList.contains('open'));
  }
  if (world?.dust) world.dust.rotation.y += delta * 0.012;
  world?.renderer.render(world.scene, world.camera);
}

function openConversation() {
  player?.unlock();
  ui.lockOverlay.classList.add('hidden');
  ui.prompt.classList.add('hidden');
  chat.open();
}
function closeConversation() {
  chat.close();
  if (nearEinstein) ui.prompt.classList.remove('hidden');
  ui.lockOverlay.classList.remove('hidden');
}
function exitRoom() {
  cancelAnimationFrame(animationFrame);
  if (onKeyDown) window.removeEventListener('keydown', onKeyDown);
  onKeyDown = null;
  player?.dispose();
  world?.dispose();
  player = null; world = null; einstein = null;
  nearEinstein = false;
  ui.prompt.classList.add('hidden');
  ui.hints.classList.add('hidden');
  ui.loading.classList.add('hidden');
  ui.lockOverlay.classList.add('hidden');
  setChatOpen(ui, false);
  chat.reset();
  showLanding(ui);
}
