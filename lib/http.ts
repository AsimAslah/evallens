const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(request: Request, limit = 60, windowMs = 60_000) {
  const forwarded = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "local";
  const key = forwarded.split(",")[0].trim();
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  current.count += 1;
  if (current.count > limit) return Response.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)) } });
  return null;
}

export async function readJson(request: Request, maxBytes = 400_000) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > maxBytes) throw new Error("PAYLOAD_TOO_LARGE");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new Error("PAYLOAD_TOO_LARGE");
  return JSON.parse(text);
}
