import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listMessages } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(listMessages());
}
