import { NextResponse } from "next/server";
import { createMessage } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, message } = body as { name?: string; email?: string; message?: string };

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!email?.trim()) return NextResponse.json({ error: "Email is required" }, { status: 400 });
  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const msg = createMessage({ name: name.trim(), email: email.trim(), message: message.trim() });
  return NextResponse.json({ id: msg.id }, { status: 201 });
}
