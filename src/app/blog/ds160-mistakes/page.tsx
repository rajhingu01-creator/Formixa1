import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://formixa.com";

export const metadata: Metadata = {
  title: "Top 10 Mistakes People Make on the DS-160 Form",
  description:
    "The most common DS-160 errors that lead to visa delays and refusals — and exactly how to avoid each one. Don't let a formatting mistake cost you your visa interview.",
  alternates: { canonical: `${SITE_URL}/blog/ds160-mistakes` },
  other: {
    "ai-description":
      "The 10 most common mistakes on the DS-160 US visa application form, including wrong date formats, name mismatches, incomplete travel history, and security question errors.",
  },
};

const MISTAKES = [
  {
    number: 1,
    title: "Using the Wrong Date Format",
    body: `The DS-160 requires dates in DD-MMM-YYYY format — for example, 14-MAR-1990 or 05-JUN-2024. Applicants from countries that use MM/DD/YYYY or DD/MM/YYYY formats frequently enter their dates in the wrong order, causing a mismatch with passport records. A date entered as "03/14/1990" will not match a passport that reads "14 MAR 1990," and this discrepancy can trigger additional scrutiny or outright rejection.\n\nAlways spell out the month abbreviation (JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEP, OCT, NOV, DEC). Never use numeric months.`,
  },
  {
    number: 2,
    title: "Name Doesn't Match Passport Exactly",
    body: `Your name on the DS-160 must match your passport character for character. This means including all middle names, using hyphens where your passport has hyphens, and using the same romanization if your name is transliterated from another script.\n\nCommon errors: leaving out a middle name, using a shortened version of a first name (Tom instead of Thomas), or using a nickname. The DS-160 also asks separately for any other names you've been known by — including maiden names, previous names, and name transliterations. Omitting these is a separate mistake.`,
  },
  {
    number: 3,
    title: "Leaving Fields Blank Instead of Writing 'N/A'",
    body: `The DS-160 has fields that don't apply to everyone — for instance, a field for your employer's phone number if you're a student, or a field for your driver's license number if you don't drive. Many applicants leave these fields blank, which causes the form to error on submission.\n\nFor any field that doesn't apply to you, type "N/A" or select "Does Not Apply" when that option is offered. Never submit the form with unexplained blank fields.`,
  },
  {
    number: 4,
    title: "Vague or Inconsistent Travel Purpose",
    body: `The travel section asks you to select a visa category and briefly describe your purpose. Vague answers like "visit" or "tourism" when you're applying for a B-1 business visa create an immediate inconsistency. Similarly, stating that you'll stay "2 weeks" but then listing a return flight 6 weeks away raises questions.\n\nBe specific and consistent. Your stated purpose, intended length of stay, US contact, and financial sponsor should all tell the same coherent story. Consular officers are trained to spot inconsistencies between these fields.`,
  },
  {
    number: 5,
    title: "Not Disclosing Previous Visa Refusals",
    body: `If you have ever been refused a US visa, denied entry at the border, or had a visa revoked, you must disclose it. Many applicants assume that old refusals don't matter, or that a refusal from a different consulate doesn't count. They are wrong on both counts.\n\nThe US maintains records of all visa applications. Providing false information about a prior refusal is a federal crime and results in a permanent bar to entry — a far worse outcome than the original refusal would have been. Disclose, explain briefly, and let the officer assess the circumstances.`,
  },
  {
    number: 6,
    title: "Wrong Passport Information",
    body: `Transcription errors in passport numbers are extremely common. The DS-160 asks for your passport number, issue date, expiry date, and issuing authority. Each of these must be copied exactly from your passport.\n\nPassport numbers often contain letters that look like numbers (0 vs O, 1 vs I, l vs 1) and vice versa. Cross-check every character. A single digit off makes your application unverifiable and will flag during processing.`,
  },
  {
    number: 7,
    title: "Incorrect Answers to Security Questions",
    body: `The DS-160 security section contains questions about communicable diseases, terrorism, drug trafficking, human trafficking, crimes, and more. Many applicants misread these questions and answer incorrectly — either answering "Yes" when the question doesn't apply to them, or answering "No" when they should say "Yes."\n\nRead every security question carefully. The phrasing matters: "Have you ever been arrested or convicted for any offense or crime?" includes minor traffic offenses and violations in some jurisdictions. If in doubt, consult an immigration attorney before answering.`,
  },
  {
    number: 8,
    title: "Missing or Incomplete US Contact Information",
    body: `The DS-160 requires a US point of contact — a person or organization in the United States who knows about your trip. This can be a friend, relative, business contact, hotel, or conference organizer. The field requires a full US address and US phone number.\n\nApplicants who don't have a personal contact in the US often leave this section incomplete or enter their own foreign phone number. If you're staying at a hotel, use the hotel's name, address, and front desk phone number. This is a completely acceptable response.`,
  },
  {
    number: 9,
    title: "Photo Requirements Not Met",
    body: `The DS-160 photo upload has strict requirements: the photo must be recent (taken within 6 months), show a full frontal face with neutral expression, have a white or off-white background, be a specific pixel size, and show you without glasses (as of 2023 rules).\n\nMany applicants upload photos taken on a phone against a colored wall, or use old photos. A non-compliant photo will cause your application to be rejected at the consulate, even if everything else is correct. Use a photo service or app that specifically formats photos to US visa specifications.`,
  },
  {
    number: 10,
    title: "Not Saving Your Application ID",
    body: `The DS-160 system generates an application ID when you start your form. This ID is the only way to retrieve your form if you get timed out or need to return to it later. Many applicants forget to note this ID and lose their entire form.\n\nWrite down the application ID as soon as it appears. Keep it somewhere safe for the duration of your application process. You will need it if your session expires, if the form errors out, or if you need to access your submission later.`,
  },
];

export default function Ds160MistakesPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="mb-6">
        <Link href="/blog" className="text-sm text-brand-600 hover:underline">← Back to Blog</Link>
      </div>

      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
        Top 10 Mistakes People Make on the DS-160 Form
      </h1>

      <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
        <time dateTime="2026-01-20">January 20, 2026</time>
        <span>·</span>
        <span>6 min read</span>
      </div>

      <p className="mt-8 text-lg leading-relaxed text-slate-600">
        The DS-160 is the Online Nonimmigrant Visa Application required by the US Department of State. It's submitted electronically at ceac.state.gov before your visa interview, and a single mistake can delay or derail your entire application. Here are the ten most common errors — and how to avoid every one of them.
      </p>

      <div className="mt-12 space-y-10">
        {MISTAKES.map((mistake) => (
          <section key={mistake.number}>
            <h2 className="text-xl font-semibold text-slate-900">
              <span className="mr-2 text-brand-500">#{mistake.number}</span>
              {mistake.title}
            </h2>
            {mistake.body.split("\n\n").map((para, i) => (
              <p key={i} className="mt-3 text-sm leading-relaxed text-slate-600">{para}</p>
            ))}
          </section>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-slate-900">How to Avoid All of These at Once</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Every mistake listed above comes down to the same root problem: the DS-160's formatting requirements are strict and non-obvious, and the form itself offers very little guidance. Applicants who are unfamiliar with US government form conventions — which is most of the world — make these errors not because they're careless but because the form doesn't explain what it expects.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Formixa was built specifically to solve this. You answer plain-English questions, and the AI maps your answers into DS-160-compatible format — converting dates to DD-MMM-YYYY, using standardized country names, flagging inconsistencies, and formatting security answers correctly. You download a complete reference PDF for $25 and use it while filling the official form, so you're copying correct answers rather than guessing.
        </p>
        <Link
          href="/apply"
          className="mt-6 inline-flex items-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          Start my DS-160 with Formixa — $25
        </Link>
      </section>
    </div>
  );
}
