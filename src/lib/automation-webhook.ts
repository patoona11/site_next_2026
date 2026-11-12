import "server-only";

import { createHmac } from "node:crypto";
import type { ContentPost } from "@/lib/cms-types";

export type ContentWebhookEvent = "content.created" | "content.updated" | "content.deleted";

export async function sendContentWebhook(event: ContentWebhookEvent, post: ContentPost | { id: string }) {
  const url = process.env.AUTOMATION_WEBHOOK_URL?.trim();
  if (!url) return;

  const body = JSON.stringify({ event, occurredAt: new Date().toISOString(), data: post });
  const secret = process.env.AUTOMATION_WEBHOOK_SECRET?.trim();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "itech2026-webhook/1.0",
  };
  if (secret) headers["X-Itech-Signature"] = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) console.error("Automation webhook failed", response.status);
  } catch (error) {
    // Publishing content must remain successful even when an automation service is offline.
    console.error("Automation webhook connection failed", error instanceof Error ? error.message : error);
  }
}
