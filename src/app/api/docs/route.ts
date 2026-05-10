import { NextRequest, NextResponse } from "next/server";
import { generateFromParts } from "@/lib/gemini";

const SYSTEM = `You are an expert document verification specialist for immigration documents. Carefully examine the provided document image or PDF and identify:
1. Document type
2. Any errors, inconsistencies, or formatting issues
3. Expired dates (compare against today's date)
4. Name/data mismatches between fields
5. Missing required fields
6. Quality issues (blurry, cut off, damaged)

Respond in plain English as a structured report. Be specific about what you found and where.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a JPEG, PNG, WebP image or PDF." },
        { status: 400 },
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10 MB." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // For PDFs use the first page representation
    const mimeType = file.type === "application/pdf" ? "application/pdf" : file.type;

    const report = await generateFromParts(
      [
        { inlineData: { data: base64, mimeType } },
        { text: `Today's date is ${new Date().toISOString().split("T")[0]}. Analyse this immigration document and provide a detailed verification report.` },
      ],
      SYSTEM,
    );

    return NextResponse.json({ report });
  } catch (err) {
    console.error("Docs API error:", err);
    return NextResponse.json({ error: "Failed to analyse document" }, { status: 500 });
  }
}
