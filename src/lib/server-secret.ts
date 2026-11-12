import "server-only";

import { timingSafeEqual } from "node:crypto";

export function safeSecretEqual(received: string | null | undefined, expected: string | null | undefined) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : request.headers.get("x-api-key");
}
