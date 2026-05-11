import Groq from "groq-sdk";
import { ALL_QUESTIONS, type Answers, type Ds160Fields } from "./ds160";

const SYSTEM_PROMPT = `You are Formixa, an immigration form assistant.

Your job is to take a visa applicant's plain-English answers and normalize them into the structured fields of a US DS-160 nonimmigrant visa application.

Rules:
- Match passport spelling exactly. Do not "correct" names.
- Convert all dates to ISO 8601 format (YYYY-MM-DD). If a date is ambiguous, leave it blank and add a warning.
- For yes/no questions, return a real boolean (true or false). If the answer is unclear, return null and add a warning.
- For free-text answers, tidy whitespace and capitalization but preserve meaning.
- Country names should be in standard English (e.g. "United Kingdom", not "UK"; "United States", not "USA").
- If a required field is missing or unclear, leave it as an empty string and add a clear, actionable warning.
- Never invent information. Empty is better than wrong.
- The "warnings" array should be empty if everything is clean.

You MUST return a JSON object with exactly this structure (no extra keys, no markdown):
{
  "personal": { "surname": "", "given_names": "", "full_name": "", "other_names": "", "sex": "", "marital_status": "", "dob": "", "city_of_birth": "", "country_of_birth": "", "nationality": "", "national_id": "" },
  "passport": { "passport_number": "", "passport_book_number": "", "passport_country": "", "passport_issue_city": "", "passport_issue_country": "", "passport_issue_date": "", "passport_expiry_date": "", "passport_lost": null },
  "contact": { "home_address": "", "phone": "", "email": "", "social_media": "" },
  "travel": { "purpose_of_trip": "", "purpose_detail": "", "intended_arrival_date": "", "length_of_stay": "", "us_address": "", "trip_funded_by": "", "previously_visited_us": null, "previous_visa": "" },
  "companions": { "traveling_with_others": null, "companions_detail": "" },
  "us_contact": { "us_contact_name": "", "us_contact_relationship": "", "us_contact_address": "", "us_contact_phone": "", "us_contact_email": "" },
  "family": { "father_name": "", "father_dob": "", "father_in_us": null, "mother_name": "", "mother_dob": "", "mother_in_us": null, "spouse_name": "", "spouse_dob": "", "spouse_nationality": "" },
  "work_education": { "occupation": "", "employer_name": "", "employer_address": "", "monthly_income": "", "duties": "", "previous_employer": "", "education_history": "" },
  "security": { "communicable_disease": null, "criminal_history": null, "drug_use": null, "terrorist_activity": null, "previous_visa_refused": null, "security_explanation": "" },
  "warnings": []
}`;

const QUESTION_REFERENCE = ALL_QUESTIONS.map(
  (q) => `- ${q.id}: ${q.label}${q.options ? ` (one of: ${q.options.join(", ")})` : ""}`,
).join("\n");

let cachedClient: Groq | null = null;

function getClient(): Groq {
  if (cachedClient) return cachedClient;
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");
  cachedClient = new Groq({ apiKey: key });
  return cachedClient;
}

export async function mapAnswersToDs160(answers: Answers): Promise<Ds160Fields> {
  const client = getClient();
  const userPayload = JSON.stringify(answers, Object.keys(answers).sort(), 2);

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nQuestion reference (id → label):\n${QUESTION_REFERENCE}`,
      },
      {
        role: "user",
        content: `Here are the applicant's plain-English answers, keyed by question id. Normalize them into the DS-160 schema.\n\n${userPayload}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "";

  let parsed: Ds160Fields;
  try {
    parsed = JSON.parse(text) as Ds160Fields;
  } catch (err) {
    throw new Error(`Could not parse Groq response as JSON: ${(err as Error).message}`);
  }

  return parsed;
}
