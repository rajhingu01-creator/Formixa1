import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

async function fetchUscisStatus(receiptNumber: string): Promise<string> {
  const url = "https://egov.uscis.gov/casestatus/mycasestatus.do";
  const body = new URLSearchParams({
    appReceiptNum: receiptNumber.trim().toUpperCase(),
    initCaseSearch: "CHECK STATUS",
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (compatible; Formixa/1.0)",
      Referer: "https://egov.uscis.gov/casestatus/landing.do",
    },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`USCIS returned ${res.status}`);
  return await res.text();
}

function extractStatusFromHtml(html: string): { title: string; detail: string } | null {
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const detailMatch = html.match(/<p[^>]*>\s*(.*?)\s*<\/p>/is);

  if (!titleMatch) return null;

  const title = titleMatch[1].replace(/<[^>]+>/g, "").trim();
  const detail = detailMatch ? detailMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";

  return { title, detail };
}

export async function POST(req: NextRequest) {
  try {
    const { receiptNumber } = await req.json() as { receiptNumber: string };

    if (!receiptNumber?.trim()) {
      return NextResponse.json({ error: "Receipt number is required" }, { status: 400 });
    }

    const cleaned = receiptNumber.trim().toUpperCase().replace(/\s+/g, "");
    if (!/^[A-Z]{3}\d{10}$/.test(cleaned)) {
      return NextResponse.json(
        { error: "Invalid receipt number format. Expected format: IOE1234567890 (3 letters + 10 digits)" },
        { status: 400 },
      );
    }

    const html = await fetchUscisStatus(cleaned);
    const raw = extractStatusFromHtml(html);

    if (!raw) {
      return NextResponse.json({ error: "Could not parse USCIS response. Please try again." }, { status: 502 });
    }

    const plainEnglish = await generateText(
      `USCIS case status title: "${raw.title}"\nUSCIS case detail: "${raw.detail}"\n\nExplain this status in plain English (2-3 sentences) and suggest 2-3 actionable next steps for the applicant.`,
      "You are a helpful US immigration assistant. Translate USCIS case statuses into clear, plain English with practical next steps.",
    );

    return NextResponse.json({
      receiptNumber: cleaned,
      rawTitle: raw.title,
      rawDetail: raw.detail,
      plainEnglish,
    });
  } catch (err) {
    console.error("Status API error:", err);
    return NextResponse.json({ error: "Failed to fetch case status. USCIS may be temporarily unavailable." }, { status: 502 });
  }
}
