import { NextResponse } from "next/server";
import { createOrder } from "@/lib/paypal";
import { attachPaypalOrder, getPromoCode, getSubmission, incrementPromoUse, markPaid } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_PRICE_CENTS = parseInt(process.env.NEXT_PUBLIC_STRIPE_PRICE_USD_CENTS ?? "2500", 10);
const SITE_URL = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { submissionId, promoCode } = body as { submissionId?: string; promoCode?: string };
  if (!submissionId) return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });

  const submission = getSubmission(submissionId);
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  // Handle promo code
  if (promoCode?.trim()) {
    const promo = getPromoCode(promoCode.trim());
    if (!promo) return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 400 });

    if (promo.discount_type === "full") {
      markPaid(submissionId, 0, promo.code);
      incrementPromoUse(promo.code);
      return NextResponse.json({ url: `${SITE_URL()}/success?submissionId=${submissionId}`, free: true });
    }

    // Percent discount — proceed through PayPal with reduced price
    const discountedCents = Math.round(BASE_PRICE_CENTS * (1 - promo.discount_value / 100));
    try {
      const { id: orderId, approvalUrl } = await createOrder(discountedCents, submissionId);
      attachPaypalOrder(submissionId, orderId);
      incrementPromoUse(promo.code);
      return NextResponse.json({ url: approvalUrl });
    } catch (err) {
      return NextResponse.json({ error: `Could not start checkout: ${(err as Error).message}` }, { status: 500 });
    }
  }

  // Normal PayPal checkout
  try {
    const { id: orderId, approvalUrl } = await createOrder(BASE_PRICE_CENTS, submissionId);
    attachPaypalOrder(submissionId, orderId);
    return NextResponse.json({ url: approvalUrl });
  } catch (err) {
    return NextResponse.json({ error: `Could not start checkout: ${(err as Error).message}` }, { status: 500 });
  }
}
