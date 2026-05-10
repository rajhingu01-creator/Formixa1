import { NextResponse } from "next/server";
import { buildPdf } from "@/lib/pdf";
import { findByOrderId, getSubmission } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const submissionId = url.searchParams.get("submissionId");
  const orderId = url.searchParams.get("orderId");

  let submission = submissionId ? getSubmission(submissionId) : undefined;
  if (!submission && orderId) submission = findByOrderId(orderId);

  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  if (!submission.paid) return NextResponse.json({ error: "Payment required" }, { status: 402 });

  const bytes = await buildPdf(submission.fields);
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

  return new Response(ab, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="formixa-ds160-${submission.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
