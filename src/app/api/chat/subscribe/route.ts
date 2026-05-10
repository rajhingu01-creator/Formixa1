import { NextRequest, NextResponse } from "next/server";
import { activateSubscription, getSessionDiscount } from "@/lib/chat-store";
import { recordChatSubscription } from "@/lib/chat-analytics-store";

const BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const CHAT_PRICE_CENTS = 999; // $9.99

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials not configured");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

// POST /api/chat/subscribe — create PayPal subscription (or discounted one-time order)
export async function POST(req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const { sessionId } = await req.json() as { sessionId: string };
    const discountPercent = getSessionDiscount(sessionId);
    const hasDiscount = discountPercent !== undefined && discountPercent < 100;

    const token = await getAccessToken();

    if (hasDiscount) {
      // Use PayPal Orders API for a one-time discounted payment
      const priceCents = Math.round(CHAT_PRICE_CENTS * (1 - discountPercent! / 100));
      const priceStr = (priceCents / 100).toFixed(2);

      const res = await fetch(`${BASE}/v2/checkout/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            amount: { currency_code: "USD", value: priceStr },
            description: `Formixa AI Chat Access (${discountPercent}% promo discount)`,
          }],
          application_context: {
            brand_name: "Formixa",
            user_action: "PAY_NOW",
            return_url: `${siteUrl}/chat?subscribed=1&session=${encodeURIComponent(sessionId)}&type=order`,
            cancel_url: `${siteUrl}/chat?canceled=1`,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`PayPal order failed: ${err}`);
      }

      const data = await res.json() as { id: string; links: { rel: string; href: string }[] };
      const approvalUrl = data.links.find((l) => l.rel === "approve")?.href;
      return NextResponse.json({ approvalUrl, orderId: data.id, discounted: true });
    }

    // Standard subscription (no discount or 100% handled by promo unlock)
    const planId = process.env.PAYPAL_CHAT_PLAN_ID;
    if (!planId) {
      return NextResponse.json({ error: "Chat subscription plan not configured" }, { status: 500 });
    }

    const res = await fetch(`${BASE}/v1/billing/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: "Formixa",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${siteUrl}/chat?subscribed=1&session=${encodeURIComponent(sessionId)}`,
          cancel_url: `${siteUrl}/chat?canceled=1`,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PayPal subscription failed: ${err}`);
    }

    const data = await res.json() as { id: string; links: { rel: string; href: string }[] };
    const approvalUrl = data.links.find((l) => l.rel === "approve")?.href;
    return NextResponse.json({ approvalUrl, subscriptionId: data.id });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}

// GET /api/chat/subscribe?subscriptionId=X&sessionId=Y — verify and activate subscription
// GET /api/chat/subscribe?orderId=X&sessionId=Y — capture and activate one-time order
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subscriptionId = searchParams.get("subscriptionId");
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("sessionId");

  if (!sessionId || (!subscriptionId && !orderId)) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const token = await getAccessToken();

    if (orderId) {
      // Capture the one-time order
      const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as { status: string; id: string };
      if (data.status === "COMPLETED") {
        activateSubscription(sessionId, data.id);
        recordChatSubscription(sessionId, data.id);
        return NextResponse.json({ activated: true });
      }
      return NextResponse.json({ activated: false, status: data.status });
    }

    // Verify subscription
    const res = await fetch(`${BASE}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as { status: string };

    if (data.status === "ACTIVE" || data.status === "APPROVED") {
      activateSubscription(sessionId, subscriptionId!);
      recordChatSubscription(sessionId, subscriptionId!);
      return NextResponse.json({ activated: true });
    }

    return NextResponse.json({ activated: false, status: data.status });
  } catch (err) {
    console.error("Verify subscription error:", err);
    return NextResponse.json({ error: "Failed to verify subscription" }, { status: 500 });
  }
}
