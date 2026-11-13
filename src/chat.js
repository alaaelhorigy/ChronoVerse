const SYSTEM_GREETING = 'أهلاً بيك في مكتبي! سعيد إنك جيت تزورني. تحب نتكلم عن إيه؟';

export function createChat({ messagesElement, form, input, sendButton, onOpenChange }) {
  const history = [];
  let busy = false;

  function addMessage(text, role) {
    const bubble = document.createElement('div');
    bubble.className = `message ${role === 'user' ? 'user-message' : 'einstein-message'}`;
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    bubble.appendChild(paragraph);
    messagesElement.appendChild(bubble);
    messagesElement.scrollTop = messagesElement.scrollHeight;
  }

  function setTyping(show) {
    const existing = messagesElement.querySelector('.typing');
    if (existing) existing.remove();
    if (show) {
      const node = document.createElement('div');
      node.className = 'typing';
      node.textContent = 'أينشتاين بيفكّر...';
      messagesElement.appendChild(node);
      messagesElement.scrollTop = messagesElement.scrollHeight;
    }
  }

  async function send(text) {
    const clean = text.trim();
    if (!clean || busy) return;
    busy = true;
    input.disabled = true;
    sendButton.disabled = true;
    addMessage(clean, 'user');
    history.push({ role: 'user', content: clean });
    setTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'حصلت مشكلة في الاتصال.');
      const reply = typeof data.reply === 'string' && data.reply.trim()
        ? data.reply.trim()
        : 'معلش، مش قادر أرتّب أفكاري دلوقتي. جرّب تسألني تاني.';
      history.push({ role: 'assistant', content: reply });
      addMessage(reply, 'einstein');
    } catch (error) {
      // Keep failed user turns out of the conversation history so they can retry.
      history.pop();
      addMessage(`مش قادر أوصل للمساعد دلوقتي. ${error.message || 'اتأكد من الاتصال وحاول تاني.'}`, 'einstein');
    } finally {
      setTyping(false);
      busy = false;
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = '';
    send(value);
  });

  return {
    open() { onOpenChange?.(true); input.focus(); },
    close() { onOpenChange?.(false); },
    reset() {
      history.length = 0;
      messagesElement.replaceChildren();
      addMessage(SYSTEM_GREETING, 'einstein');
    }
  };
}

