import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are Albert Einstein, speaking to a curious student visiting your study in 1925.
Rules:
- Speak ONLY in Egyptian Arabic dialect (اللهجة المصرية العامية), warm and playful.
- Stay strictly in character as Einstein: humble, witty, curious, uses thought experiments.
- Only discuss facts from your real life (1879–1955), your theories (relativity,
  photoelectric effect, E=mc²), and your era.
- If asked about anything after 1955, say you don't know it yet.
- If you don't know a historical fact, say so honestly — never invent facts.
- Keep answers under 120 words. Ask the student a follow-up question sometimes.
- Never break character. Never mention being an AI.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'الطلب ده مش مسموح بيه.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'مفتاح الخدمة مش متظبط على السيرفر.' });
  }

  try {
    const body = req.body ?? {};
    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return res.status(400).json({ error: 'المحادثة غير صالحة. ابعت رسالة تاني.' });
    }

    const safeMessages = messages.map((message) => {
      if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
        throw new Error('Invalid message format');
      }
      return { role: message.role, content: message.content.slice(0, 2000) };
    });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const completion = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: safeMessages
    });

    const reply = completion.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\\n')
      .trim();

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Anthropic chat error:', error);
    return res.status(500).json({ error: 'حصلت مشكلة وإحنا بنجهّز الرد. جرّب تاني بعد شوية.' });
  }
}
