import { NextRequest, NextResponse } from "next/server";
import { getAllAlerts, updateAlertStatus } from "@/lib/status-store";
import { sendEmail } from "@/lib/mailer";

// Called by a cron job every 24h: GET /api/status/check?secret=CRON_SECRET
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = getAllAlerts();
  const results: { id: string; changed: boolean; error?: string }[] = [];

  for (const alert of alerts) {
    try {
      const body = new URLSearchParams({
        appReceiptNum: alert.receiptNumber,
        initCaseSearch: "CHECK STATUS",
      });

      const res = await fetch("https://egov.uscis.gov/casestatus/mycasestatus.do", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const html = await res.text();
      const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
      const newStatus = titleMatch
        ? titleMatch[1].replace(/<[^>]+>/g, "").trim()
        : "";

      if (newStatus && newStatus !== alert.lastStatus) {
        await sendEmail(
          alert.email,
          `USCIS Case Update: ${alert.receiptNumber}`,
          `<p>Your USCIS case <strong>${alert.receiptNumber}</strong> has a new status:</p>
           <p><strong>${newStatus}</strong></p>
           <p>Previous status: ${alert.lastStatus}</p>
           <p>Check the full details at <a href="https://egov.uscis.gov">egov.uscis.gov</a>.</p>
           <p style="color:#888;font-size:12px">You are receiving this because you subscribed to status alerts on Formixa.</p>`,
        );
        updateAlertStatus(alert.id, newStatus);
        results.push({ id: alert.id, changed: true });
      } else {
        updateAlertStatus(alert.id, newStatus || alert.lastStatus);
        results.push({ id: alert.id, changed: false });
      }
    } catch (err) {
      results.push({ id: alert.id, changed: false, error: String(err) });
    }
  }

  return NextResponse.json({ checked: alerts.length, results });
}
