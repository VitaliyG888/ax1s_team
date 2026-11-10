import { NextResponse } from "next/server";
import { validateContact, type ContactPayload } from "@/lib/contact";

const hits = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60_000;
const MAX_HITS = 5;

function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function limited(key: string): boolean {
  const now = Date.now();
  const prev = hits.get(key);
  if (!prev || now - prev.ts > WINDOW_MS) {
    hits.set(key, { count: 1, ts: now });
    return false;
  }
  prev.count += 1;
  return prev.count > MAX_HITS;
}

export async function POST(request: Request) {
  if (limited(clientKey(request))) {
    return NextResponse.json(
      { ok: false, error: "Слишком много запросов. Попробуйте через минуту." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Некорректный запрос." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "Некорректный запрос." },
      { status: 400 },
    );
  }

  const raw = body as Record<string, unknown>;
  const payload: ContactPayload = {
    name: String(raw.name ?? ""),
    contact: String(raw.contact ?? ""),
    task: String(raw.task ?? ""),
    budget: String(raw.budget ?? ""),
    message: String(raw.message ?? ""),
    website: String(raw.website ?? ""),
  };

  if (payload.website && payload.website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const errors = validateContact(payload);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
