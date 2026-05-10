import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://formixa.com";

export const metadata: Metadata = {
  title: "How to Fill the DS-160 Form Step by Step (2026 Guide)",
  description:
    "A complete walkthrough of every section of the DS-160 US visa application — what you need, what to write, and how to avoid rejection. Updated for 2026.",
  alternates: { canonical: `${SITE_URL}/blog/how-to-fill-ds160-form` },
  other: {
    "ai-description":
      "Step-by-step guide for filling the DS-160 US nonimmigrant visa application form, covering every section from personal info to security questions.",
  },
};

export default function HowToFillDs160Page() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="mb-6">
        <Link href="/blog" className="text-sm text-brand-600 hover:underline">← Back to Blog</Link>
      </div>

      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
        How to Fill the DS-160 Form Step by Step (2026 Guide)
      </h1>

      <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
        <time dateTime="2026-01-15">January 15, 2026</time>
        <span>·</span>
        <span>8 min read</span>
      </div>

      <p className="mt-8 text-lg leading-relaxed text-slate-600">
        The DS-160 is the mandatory online visa application form for all US nonimmigrant visas — tourist (B-1/B-2), student (F-1), work (H-1B), and dozens of other categories. It's submitted electronically at{" "}
        <a href="https://ceac.state.gov" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">ceac.state.gov</a>{" "}
        before your visa interview. This guide walks through every section so you know exactly what to prepare and how to answer correctly.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Before You Start: What to Gather</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          The DS-160 will time out if left idle for more than 20 minutes, and there is no way to save and resume partway through a section. Before opening the form, collect the following documents:
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600 list-disc pl-5">
          <li>Your valid passport (number, issue date, expiry date, issuing country)</li>
          <li>Travel itinerary — intended arrival date, length of stay, US address where you'll stay</li>
          <li>US point of contact — name, address, phone number of a person or hotel</li>
          <li>Employment history — company names, addresses, job titles, dates</li>
          <li>Education history — schools attended, degrees, dates</li>
          <li>Family information — parents' full names and birth countries; spouse details if applicable</li>
          <li>Previous US visa information, if you've had one</li>
          <li>A digital photo meeting DS-160 photo requirements</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Having all of this in front of you before starting will cut your form-filling time in half.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Section 1: Personal Information</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          This section collects your full legal name, date of birth, gender, marital status, and national ID number. Every name field must match your passport exactly — including middle names, hyphens, and diacritical marks (accents). If your passport romanizes your name, use that romanization.
        </p>
        <h3 className="mt-6 text-lg font-semibold text-slate-900">Date of birth format</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          The DS-160 uses <strong>DD-MMM-YYYY</strong> format — for example, 14-MAR-1990. Do not use numeric months. This format trips up many applicants who type "03/14/1990" and get a mismatch with their passport record.
        </p>
        <h3 className="mt-6 text-lg font-semibold text-slate-900">Aliases and other names</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          If you have ever been known by any other name — maiden name, nickname, name transliteration — list it here. "Have you ever used any other name?" is answered Yes far more often than applicants expect. Omitting a previous name is a common cause of delays.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Section 2: Travel Information</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          This is one of the most scrutinized sections. The consular officer will compare what you write here against what you say in the interview.
        </p>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 list-disc pl-5">
          <li><strong>Purpose of trip:</strong> Select the primary purpose — tourism, business, study, etc. Be specific. "Pleasure/Tourism" is appropriate for a B-2 visit.</li>
          <li><strong>Intended date of arrival:</strong> Use your earliest likely arrival date. It doesn't need to be exact, but should be realistic.</li>
          <li><strong>Intended length of stay:</strong> Number of days, weeks, or months. Be conservative — overstating your intended stay can raise flags.</li>
          <li><strong>Address where you'll stay:</strong> Hotel name and address, or a contact's home address. Must be a real US address.</li>
          <li><strong>Person paying for the trip:</strong> If someone else is paying, provide their name and relationship. If you are paying yourself, select "Self".</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Section 3: Travel Companions</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          If you are traveling alone, answer "No" to traveling in a group or with family. If traveling with family members who are also applying for visas, list them here. Each companion should also complete their own DS-160.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Section 4: Previous US Travel</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Have you been to the US before? List all previous visits with approximate dates. If you have ever been refused a US visa or denied entry, this must be disclosed — it does not automatically disqualify you, but failing to disclose it will.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          If you have a previous visa, have the visa number and issue date ready. They are printed on the visa sticker in your passport.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Section 5: US Contact Information</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Provide the name, address, and phone number of a person or organization in the US who knows about your visit. This can be a friend, relative, business contact, or hotel. If you don't have a personal contact, the hotel you'll stay at is acceptable. You must provide a real US phone number — not your own foreign number.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Section 6: Family Information</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          This section asks for your parents' full names, dates of birth, and whether they are US citizens or residents. If your parent is deceased, you still provide their name — select "Deceased" for the US citizen/resident question if it applies.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          You will also be asked about your spouse if you are married — name, date of birth, nationality, country of birth. If divorced, still provide the ex-spouse's information.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Section 7: Work and Education</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          List your current employer's name, address, and phone number. State your job title and briefly describe your duties. If you are a student, provide your school's information instead. If unemployed or retired, select the appropriate status.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          For education, list your highest level and the institution's name and address. You don't need to list every school — just the highest degree obtained or currently being pursued.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Section 8: Security and Background Questions</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          This is the section most people dread. The DS-160 asks about communicable diseases, arrests, drug use, terrorism, human trafficking, and more. For most applicants, every answer is "No." Answer honestly — providing false information is a federal crime and will result in permanent inadmissibility.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          The questions are worded broadly. If you are unsure whether something applies to you (for example, a minor arrest that was expunged), consult an immigration attorney before answering.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Submitting and Printing</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          After answering all sections, review the form carefully. Once submitted, you cannot edit it. Print the confirmation page — it contains the barcode you will bring to your visa interview. The confirmation page is not the visa; it is just proof of application submission.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Use Formixa to Prepare Your DS-160</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Formixa is an AI-powered tool that maps plain-English answers into every DS-160 field with correct formatting — dates in DD-MMM-YYYY, standardized country names, properly phrased yes/no security answers. You answer ~50 questions and get a complete reference PDF for $25 that you can use while filling the official form at ceac.state.gov. It takes under 10 minutes and eliminates the most common mistakes.
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
