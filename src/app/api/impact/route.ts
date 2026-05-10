import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

const SYSTEM = `You are an immigration law expert assistant. When a user describes an immigration situation, provide:
1. Plain English explanation of potential immigration impacts
2. Severity level (Low / Medium / High / Critical)
3. Affected visa categories or statuses
4. Recommended next steps (numbered list)
5. A note that this is not legal advice and they should consult a licensed immigration attorney.

Be thorough, clear, and empathetic. Do not guess at specific outcomes — explain what typically happens.`;

export async function POST(req: NextRequest) {
  try {
    const { situation } = await req.json() as { situation: string };

    if (!situation?.trim()) {
      return NextResponse.json({ error: "Situation description is required" }, { status: 400 });
    }

    const assessment = await generateText(
      `Immigration situation: ${situation.trim()}`,
      SYSTEM,
    );

    return NextResponse.json({ assessment });
  } catch (err) {
    console.error("Impact API error:", err);
    return NextResponse.json({ error: "Failed to assess situation" }, { status: 500 });
  }
}
