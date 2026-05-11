const BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is not set");

  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function createOrder(
  amountCents: number,
  submissionId: string,
): Promise<{ id: string; approvalUrl: string }> {
  const token = await getAccessToken();
  const amount = (amountCents / 100).toFixed(2);

  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        amount: { currency_code: "USD", value: amount },
        custom_id: submissionId,
        description: "Formixa DS-160 PDF — AI-completed application summary",
      }],
      application_context: {
        brand_name: "Formixa",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `${siteUrl()}/success`,
        cancel_url: `${siteUrl()}/apply?canceled=1`,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal create order failed: ${err}`);
  }

  const order = await res.json() as { id: string; links: { rel: string; href: string }[] };
  const approvalUrl = order.links.find((l) => l.rel === "approve")?.href;
  if (!approvalUrl) throw new Error("No approval URL in PayPal response");

  return { id: order.id, approvalUrl };
}

export async function captureOrder(
  orderId: string,
): Promise<{ status: string; submissionId: string; amountCents: number }> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal capture failed: ${err}`);
  }

  const data = await res.json() as {
    status: string;
    purchase_units: { custom_id?: string; payments?: { captures?: { amount?: { value?: string } }[] } }[];
  };

  const unit = data.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const submissionId = unit?.custom_id ?? "";
  const amountCents = Math.round(parseFloat(capture?.amount?.value ?? "0") * 100);

  return { status: data.status, submissionId, amountCents };
}
