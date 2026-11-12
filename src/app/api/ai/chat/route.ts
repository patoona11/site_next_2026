import { NextResponse } from "next/server";
import { bearerToken, safeSecretEqual } from "@/lib/server-secret";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function configuredApiKey() {
  return process.env.AI_API_KEY?.trim() || "";
}

function ollamaSettings() {
  return {
    baseUrl: (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, ""),
    model: process.env.OLLAMA_MODEL?.trim() || "qwen3.5:4b",
  };
}

function validMessages(value: unknown): value is ChatMessage[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 30) return false;
  let totalLength = 0;
  for (const message of value) {
    if (!message || typeof message !== "object") return false;
    const candidate = message as Partial<ChatMessage>;
    if (!candidate.role || !["system", "user", "assistant"].includes(candidate.role)) return false;
    if (typeof candidate.content !== "string" || !candidate.content.trim()) return false;
    totalLength += candidate.content.length;
  }
  return totalLength <= 20_000;
}

export async function POST(request: Request) {
  const apiKey = configuredApiKey();
  if (!apiKey) return NextResponse.json({ error: "AI_API_KEY is not configured" }, { status: 503 });
  if (!safeSecretEqual(bearerToken(request), apiKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { messages?: unknown };
  try {
    body = await request.json() as { messages?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!validMessages(body.messages)) {
    return NextResponse.json({ error: "messages must contain 1-30 valid chat messages (maximum 20,000 characters)" }, { status: 400 });
  }

  const { baseUrl, model } = ollamaSettings();
  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: body.messages, stream: false }),
      cache: "no-store",
      signal: AbortSignal.timeout(120_000),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("Ollama chat failed", response.status, payload);
      return NextResponse.json({ error: "Ollama request failed" }, { status: 502 });
    }
    return NextResponse.json({ model, message: payload?.message, done: payload?.done ?? true });
  } catch (error) {
    console.error("Ollama connection failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Cannot connect to local Ollama" }, { status: 502 });
  }
}
