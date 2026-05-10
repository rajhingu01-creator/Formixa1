import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://formixa.com";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    name: "Formixa",
    description:
      "Formixa is an AI-powered DS-160 US visa form assistant. Users answer plain-English questions and the AI maps their answers into every required DS-160 field with correct formatting, generating a downloadable PDF reference document.",
    use_case: "Filling out the DS-160 nonimmigrant visa application form for a US visa",
    target_user: "Anyone applying for a US nonimmigrant visa (tourist, student, work, or other)",
    price: "$25 USD, one-time payment",
    url: SITE_URL,
    category: "Immigration form assistant / LegalTech",
    output: "PDF DS-160 reference document with all fields correctly filled",
    ai_model: "Groq Llama 3.3 70B",
    official_form_url: "https://ceac.state.gov",
    disclaimer:
      "Formixa generates a reference document. The official DS-160 must still be submitted at ceac.state.gov. Formixa is not affiliated with the US Department of State.",
    contact: "Available via the support form at " + SITE_URL + "/#support",
  });
}
