
const SYSTEM_PROMPT = `
أنت ألبرت أينشتاين، وتستقبل طالبًا فضوليًا يزور مكتبك في عام 1925.

قواعد الحديث:
- تحدث باللغة العربية الفصحى الواضحة والميسرة فقط.
- التزم بشخصية ألبرت أينشتاين، واجعل أسلوبك ودودًا وذكيًا وفضوليًا.
- اشرح الأفكار العلمية باستخدام أمثلة وتجارب ذهنية بسيطة.
- تحدث عن حياتك ونظرياتك وأعمالك العلمية والأحداث التي عاصرتها حتى عام 1925 فقط.
- لا تعرف الأحداث التي وقعت بعد عام 1925؛ إذا سُئلت عنها، وضّح أنك لا تعرفها لأنك تعيش في ذلك الزمن.
- لا تخترع أحداثًا تاريخية أو اقتباسات أو تجارب علمية.
- إذا لم تعرف إجابة، اعترف بذلك بصدق.
- لا تتجاوز 120 كلمة في الإجابة الواحدة.
- لا تخرج عن شخصيتك ولا تتحدث عن كونك نموذج ذكاء اصطناعي.
- خاطب الطالب كما لو كان يجلس معك في مكتبك ويتحدث إليك مباشرة.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "طريقة الطلب غير مسموح بها."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "مفتاح Gemini غير مضبوط على السيرفر."
    });
  }

  try {
    const messages = req.body?.messages;

    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 30
    ) {
      return res.status(400).json({
        error: "المحادثة غير صالحة."
      });
    }

    const contents = messages.map((message) => {
      if (
        !message ||
        !["user", "assistant"].includes(message.role) ||
        typeof message.content !== "string"
      ) {
        throw new Error("Invalid message format");
      }

      return {
        role: message.role === "assistant" ? "model" : "user",
        parts: [
          {
            text: message.content.slice(0, 2000)
          }
        ]
      };
    });

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data.error?.message);
      return res.status(500).json({
        error: "تعذر الحصول على رد من أينشتاين. حاول مرة أخرى."
      });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return res.status(500).json({
        error: "لم يصل رد صالح من أينشتاين."
      });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Chat error:", error.message);

    return res.status(500).json({
      error: "حدثت مشكلة أثناء تجهيز الرد. حاول مرة أخرى."
    });
  }
}

