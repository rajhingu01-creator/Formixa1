import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getMessage, markMessageRead, markMessageReplied } from "@/lib/store";
import { sendEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  markMessageRead(params.id);
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const msg = getMessage(params.id);
  if (!msg) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  let body: { reply?: string } = {};
  try { body = await req.json(); } catch { /* ignore */ }

  if (!body.reply?.trim()) return NextResponse.json({ error: "Reply text is required" }, { status: 400 });

  try {
    await sendEmail(
      msg.email,
      `Re: Your message to Formixa`,
      `<p>Hi ${msg.name},</p><p>${body.reply.trim().replace(/\n/g, "<br>")}</p><hr><p style="color:#64748b;font-size:12px;">Formixa Support</p>`,
    );
    markMessageReplied(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: `Failed to send email: ${(err as Error).message}` }, { status: 500 });
  }
}
