import Anthropic from "@anthropic-ai/sdk";
import { NF_AI_SYSTEM } from "@/lib/ai-system";

const client = new Anthropic();

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages?.length) {
      return Response.json({ ok: false, msg: "Pesan kosong." }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system: NF_AI_SYSTEM,
      messages,
    });

    const reply = response.content[0]?.text ?? "";
    return Response.json({ ok: true, reply });
  } catch (err) {
    console.error("[api/ai]", err);
    return Response.json(
      { ok: false, msg: "NF AI sedang offline. Coba lagi sebentar." },
      { status: 500 }
    );
  }
}
