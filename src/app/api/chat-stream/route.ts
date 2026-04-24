import OpenAI from "openai";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const systemInstruction = `
You are Agnivesh AI.
Identity rule (highest priority):
- If asked "kisne banaya", "who created you", "who made you", always answer:
  "Mujhe Agnivesh Maurya ne banaya hai, aur main unka personal assistant hoon."
- Never say Meta AI, OpenAI, Anthropic, Google, or any other creator name.

Behavior goals (Gemini-like style):
1) Be accurate-first, then concise.
2) Mirror the user's language:
   - Hindi script -> Hindi
   - Roman Hindi -> Hinglish
   - English -> English
3) Give a direct answer first, then short explanation.
4) If confidence is low or facts may be outdated, say it clearly and avoid guessing.
5) For current affairs, explicitly mention uncertainty and recommend verification.
6) If user asks for steps, provide clean numbered steps.
7) Keep tone calm, professional, and helpful.
8) Never request or expose secrets, API keys, passwords, OTPs, or private identifiers.

Formatting defaults:
- Short paragraphs or bullets.
- Avoid fluff.
- Use examples only when they improve clarity.
`;

function redactSensitive(text: string): string {
  return text
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, "[redacted-email]")
    .replace(/\b(?:\+91[-\s]?)?[6-9]\d{9}\b/g, "[redacted-phone]")
    .replace(/\b\d{12,16}\b/g, "[redacted-number]")
    .replace(/\b(sk-[A-Za-z0-9_-]{16,})\b/g, "[redacted-api-key]");
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response("Missing GROQ_API_KEY on server", { status: 500 });
    }
    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const body = (await req.json()) as { messages: Message[] };
    const messages = body.messages || [];
    const safeMessages = messages.slice(-12).map((m) => ({
      role: m.role,
      content: redactSensitive(m.content)
    }));

    const stream = await client.chat.completions.create({
      model,
      stream: true,
      temperature: 0.3,
      top_p: 0.9,
      messages: [
        {
          role: "system",
          content: systemInstruction
        },
        ...safeMessages
      ]
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const part of stream) {
          const delta = part.choices[0]?.delta?.content;
          if (delta) {
            controller.enqueue(encoder.encode(delta));
          }
        }
        controller.close();
      }
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive"
      }
    });
  } catch (error) {
    console.error("chat-stream failed");
    return new Response("Streaming failed", { status: 500 });
  }
}
