import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

const INTERVIEWER_SYSTEM = `You are a US consular officer conducting a visa interview. Ask one question at a time in a formal, professional tone. Questions should probe travel purpose, ties to home country, financial ability, and intent to return. Never reveal your evaluation criteria. Stay in character as a consular officer.`;

const EVALUATOR_SYSTEM = `You are an expert visa interview coach. Evaluate the candidate's responses from a US consular officer perspective. Identify risky or concerning answers, highlight strong answers, and provide a confidence score from 0–100. Be specific and constructive.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      action: "start" | "answer" | "evaluate";
      visaType?: string;
      history?: { role: "officer" | "applicant"; text: string }[];
      answer?: string;
    };

    if (body.action === "start") {
      const question = await generateText(
        `Start a US ${body.visaType ?? "B1/B2"} visa interview. Ask the first question.`,
        INTERVIEWER_SYSTEM,
      );
      return NextResponse.json({ question });
    }

    if (body.action === "answer") {
      const history = body.history ?? [];
      const transcript = history
        .map((h) => `${h.role === "officer" ? "Officer" : "Applicant"}: ${h.text}`)
        .join("\n");

      const question = await generateText(
        `Interview transcript so far:\n${transcript}\n\nApplicant just answered: "${body.answer}"\n\nAsk the next follow-up question or a new area question.`,
        INTERVIEWER_SYSTEM,
      );
      return NextResponse.json({ question });
    }

    if (body.action === "evaluate") {
      const history = body.history ?? [];
      const transcript = history
        .map((h) => `${h.role === "officer" ? "Officer" : "Applicant"}: ${h.text}`)
        .join("\n");

      const evaluation = await generateText(
        `Evaluate this visa interview transcript:\n\n${transcript}\n\nProvide:\n1. Confidence Score (0-100)\n2. Strong answers (bullet points)\n3. Risky or weak answers (bullet points)\n4. Red flags the officer may have noted\n5. Top 3 tips to improve`,
        EVALUATOR_SYSTEM,
      );
      return NextResponse.json({ evaluation });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Interview API error:", err);
    return NextResponse.json({ error: "Failed to process interview" }, { status: 500 });
  }
}
