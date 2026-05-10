import { NextResponse } from "next/server";
import { mapAnswersToDs160 } from "@/lib/claude";
import { createSubmission } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const answers = (body as { answers?: Record<string, string> } | null)?.answers;
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "Missing 'answers' object" }, { status: 400 });
  }

  try {
    const fields = await mapAnswersToDs160(answers);
    const submission = createSubmission({ answers, fields });
    return NextResponse.json({
      submissionId: submission.id,
      warnings: fields.warnings ?? [],
      preview: {
        full_name: fields.personal.full_name,
        nationality: fields.personal.nationality,
        passport_number: fields.passport.passport_number,
        intended_arrival_date: fields.travel.intended_arrival_date,
        purpose_of_trip: fields.travel.purpose_of_trip,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Could not process answers: ${message}` },
      { status: 500 },
    );
  }
}
