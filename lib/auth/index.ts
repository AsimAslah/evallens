function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}

export function isOwnerRequest(request: Request, configured = process.env.ADMIN_API_TOKEN) {
  if (!configured || configured.length < 24) return false;
  const header = request.headers.get("authorization") ?? "";
  const supplied = header.startsWith("Bearer ") ? header.slice(7) : "";
  return timingSafeEqual(configured, supplied);
}

export function unauthorized() {
  return Response.json({ error: "Owner authorization required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
}
