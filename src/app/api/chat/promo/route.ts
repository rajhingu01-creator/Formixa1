import { NextRequest, NextResponse } from "next/server";
import { getPromoCode, incrementPromoUse } from "@/lib/store";
import { applyPromoToSession, getSession } from "@/lib/chat-store";
import { recordPromoUnlock } from "@/lib/chat-analytics-store";

const CHAT_PRICE_CENTS = 999; // $9.99

export async function POST(req: NextRequest) {
  try {
    const { code, sessionId } = await req.json() as { code: string; sessionId: string };

    if (!code?.trim() || !sessionId) {
      return NextResponse.json({ error: "Code and sessionId are required" }, { status: 400 });
    }

    const promo = getPromoCode(code.trim());

    if (!promo) {
      return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 404 });
    }

    // Only accept codes scoped to "chat" or "all"
    if (promo.scope !== "chat" && promo.scope !== "all") {
      return NextResponse.json({ error: "This promo code is not valid for the AI Chat" }, { status: 400 });
    }

    if (promo.max_uses !== null && promo.times_used >= promo.max_uses) {
      return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 400 });
    }

    const isFullDiscount = promo.discount_type === "full";
    const discountPercent = isFullDiscount ? 100 : promo.discount_value;

    applyPromoToSession(sessionId, promo.code, isFullDiscount ? undefined : discountPercent);
    incrementPromoUse(promo.code);
    if (isFullDiscount) recordPromoUnlock();

    const session = getSession(sessionId);

    if (isFullDiscount) {
      return NextResponse.json({
        success: true,
        discountType: "full",
        message: "Promo code applied! You now have unlimited chat access.",
        questionCount: session.questionCount,
      });
    }

    const discountedCents = Math.round(CHAT_PRICE_CENTS * (1 - discountPercent / 100));
    return NextResponse.json({
      success: true,
      discountType: "percent",
      discountPercent,
      discountedPriceCents: discountedCents,
      message: `${discountPercent}% discount applied! Subscribe for $${(discountedCents / 100).toFixed(2)}.`,
      questionCount: session.questionCount,
    });
  } catch (err) {
    console.error("Chat promo error:", err);
    return NextResponse.json({ error: "Failed to apply promo code" }, { status: 500 });
  }
}
