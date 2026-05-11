import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAnalytics } from "@/lib/store";
import { getChatAnalytics } from "@/lib/chat-analytics-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pdf = getAnalytics();
  const chat = getChatAnalytics();

  const totalRevenueCents = pdf.summary.totalRevenueCents + chat.totalChatRevenueCents;

  return NextResponse.json({
    ...pdf,
    summary: {
      ...pdf.summary,
      totalRevenueCents,
      pdfRevenueCents: pdf.summary.totalRevenueCents,
      chatRevenueCents: chat.totalChatRevenueCents,
    },
    chat,
  });
}
