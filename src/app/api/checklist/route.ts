import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

const SYSTEM = `You are an expert immigration document specialist. Generate a detailed, personalised pre-travel document checklist. Format your response as a JSON object with this structure:
{
  "title": "string",
  "sections": [
    {
      "category": "string",
      "items": [
        { "item": "string", "required": true|false, "notes": "string or null" }
      ]
    }
  ],
  "warnings": ["string"],
  "tips": ["string"]
}
Be thorough and specific to the visa type, nationality, destination, and travel date provided.`;

export async function POST(req: NextRequest) {
  try {
    const { visaType, nationality, destination, travelDate } = await req.json() as {
      visaType: string;
      nationality: string;
      destination: string;
      travelDate: string;
    };

    if (!visaType || !nationality || !destination) {
      return NextResponse.json({ error: "visaType, nationality, and destination are required" }, { status: 400 });
    }

    const prompt = `Generate a pre-travel document checklist for:
- Visa type: ${visaType}
- Applicant nationality: ${nationality}
- Destination country: ${destination}
- Travel date: ${travelDate || "not specified"}

Return only valid JSON matching the specified structure.`;

    const raw = await generateText(prompt, SYSTEM);

    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    const checklist = JSON.parse(cleaned);

    return NextResponse.json({ checklist });
  } catch (err) {
    console.error("Checklist API error:", err);
    return NextResponse.json({ error: "Failed to generate checklist" }, { status: 500 });
  }
}
