import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PayPal webhooks can be added here in future.
// Current flow uses capture-on-return at /api/capture — no webhook needed for MVP.
export async function POST() {
  return NextResponse.json({ received: true });
}
