import { NextResponse } from "next/server";
import { captureOrder } from "@/lib/paypal";
import { findByOrderId, markPaid } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token } = body as { token?: string };
  if (!token) return NextResponse.json({ error: "Missing PayPal token" }, { status: 400 });

  try {
    const { status, submissionId, amountCents } = await captureOrder(token);

    if (status !== "COMPLETED") {
      return NextResponse.json({ error: `Payment not completed (status: ${status})` }, { status: 402 });
    }

    // Find submission by custom_id returned from PayPal
    let sub = submissionId ? findByOrderId(token) : undefined;
    if (!sub && submissionId) {
      // captureOrder returns custom_id as submissionId — use it directly
      const { getSubmission } = await import("@/lib/store");
      sub = getSubmission(submissionId);
    }
    if (!sub) sub = findByOrderId(token);
    if (!sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    markPaid(sub.id, amountCents);
    return NextResponse.json({ submissionId: sub.id });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
