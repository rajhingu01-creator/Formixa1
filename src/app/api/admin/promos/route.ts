import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createPromoCode, listPromoCodes } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(listPromoCodes());
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { code?: string; discount_type?: string; discount_value?: number; max_uses?: number | null; scope?: string } = {};
  try { body = await req.json(); } catch { /* ignore */ }

  const { code, discount_type, discount_value, max_uses, scope } = body;

  if (!code || typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }
  if (discount_type !== "full" && discount_type !== "percent") {
    return NextResponse.json({ error: "discount_type must be 'full' or 'percent'" }, { status: 400 });
  }
  if (discount_type === "percent" && (typeof discount_value !== "number" || discount_value < 1 || discount_value > 99)) {
    return NextResponse.json({ error: "discount_value must be 1–99 for percent type" }, { status: 400 });
  }
  if (max_uses !== undefined && max_uses !== null && (typeof max_uses !== "number" || max_uses < 1)) {
    return NextResponse.json({ error: "max_uses must be a positive number or null" }, { status: 400 });
  }

  const promo = createPromoCode({
    code,
    discount_type,
    discount_value: discount_type === "full" ? 100 : (discount_value ?? 0),
    max_uses: max_uses ?? null,
    scope: (scope === "chat" || scope === "all") ? scope : "pdf",
  });

  return NextResponse.json(promo, { status: 201 });
}
