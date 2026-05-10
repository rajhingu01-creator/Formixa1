import { NextRequest, NextResponse } from "next/server";
import { addAlert } from "@/lib/status-store";

export async function POST(req: NextRequest) {
  try {
    const { receiptNumber, email, currentStatus } = await req.json() as {
      receiptNumber: string;
      email: string;
      currentStatus: string;
    };

    if (!receiptNumber || !email || !currentStatus) {
      return NextResponse.json({ error: "receiptNumber, email, and currentStatus are required" }, { status: 400 });
    }

    const alert = addAlert(receiptNumber.trim().toUpperCase(), email.trim().toLowerCase(), currentStatus);
    return NextResponse.json({ success: true, alertId: alert.id });
  } catch (err) {
    console.error("Alert subscription error:", err);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}
