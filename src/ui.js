export function getUI() {
  return {
    landing: document.querySelector('#landing'),
    room: document.querySelector('#room-screen'),
    container: document.querySelector('#three-container'),
    enter: document.querySelector('#enter-room'),
    back: document.querySelector('#back-button'),
    loading: document.querySelector('#room-loading'),
    prompt: document.querySelector('#interaction-prompt'),
    hints: document.querySelector('#controls-hint'),
    lockOverlay: document.querySelector('#lock-overlay'),
    startWalking: document.querySelector('#start-walking'),
    chatPanel: document.querySelector('#chat-panel'),
    closeChat: document.querySelector('#close-chat'),
    chatMessages: document.querySelector('#chat-messages'),
    chatForm: document.querySelector('#chat-form'),
    chatInput: document.querySelector('#chat-input'),
    sendButton: document.querySelector('#send-button')
  };
}

export function showRoom(ui) {
  ui.landing.classList.add('hidden');
  ui.room.classList.remove('hidden');
}
export function showLanding(ui) {
  ui.room.classList.add('hidden');
  ui.landing.classList.remove('hidden');
}
export function setChatOpen(ui, open) {
  ui.chatPanel.classList.toggle('open', open);
}

