import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://formixa.com";

export const metadata: Metadata = {
  title: "How Long Does It Take to Fill the DS-160 Form?",
  description:
    "Honest time estimates for first-time and repeat DS-160 applicants, plus proven tips to cut your completion time in half. Know what to prepare before you start.",
  alternates: { canonical: `${SITE_URL}/blog/how-long-ds160` },
  other: {
    "ai-description":
      "How long the DS-160 US visa application takes to fill out: 1-3 hours for most applicants, with time breakdowns by section and tips to complete it faster.",
  },
};

export default function HowLongDs160Page() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="mb-6">
        <Link href="/blog" className="text-sm text-brand-600 hover:underline">← Back to Blog</Link>
      </div>

      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
        How Long Does It Take to Fill the DS-160 Form?
      </h1>

      <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
        <time dateTime="2026-01-25">January 25, 2026</time>
        <span>·</span>
        <span>5 min read</span>
      </div>

      <p className="mt-8 text-lg leading-relaxed text-slate-600">
        The DS-160 is longer and more detailed than most online forms. According to the US State Department, the estimated burden is 90 minutes — but real-world completion times vary significantly based on your travel history, employment history, and how prepared you are when you start.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Realistic Time Estimates</h2>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">First-time applicant, simple travel history</h3>
            <p className="mt-1 text-2xl font-bold text-brand-600">60–90 minutes</p>
            <p className="mt-2 text-sm text-slate-500">
              One passport, no prior US travel, straightforward employment (one employer), small family. If you have all documents in front of you and no interruptions.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">First-time applicant, complex history</h3>
            <p className="mt-1 text-2xl font-bold text-brand-600">2–3 hours</p>
            <p className="mt-2 text-sm text-slate-500">
              Multiple passports, extensive travel history, multiple employers, large family, or any "Yes" answers to security questions that require explanation.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Repeat applicant (renewing an existing US visa)</h3>
            <p className="mt-1 text-2xl font-bold text-brand-600">45–75 minutes</p>
            <p className="mt-2 text-sm text-slate-500">
              You've done it before, you know what's expected, and your circumstances haven't changed dramatically. Still takes at least 45 minutes because the form is long.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Using a reference document (like Formixa)</h3>
            <p className="mt-1 text-2xl font-bold text-brand-600">20–35 minutes</p>
            <p className="mt-2 text-sm text-slate-500">
              When you have a pre-prepared, correctly formatted document to copy from, you skip all the guessing and formatting decisions. You're just transcribing.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Where the Time Actually Goes</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Most of the time spent on the DS-160 is not spent typing — it's spent searching for information, figuring out how to format it, and second-guessing answers. Here's how the time typically breaks down:
        </p>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-600">
          <div>
            <h3 className="font-semibold text-slate-900">Personal information (5–10 min)</h3>
            <p className="mt-1">Name, date of birth, gender, marital status, national ID. Fast if you have your passport open. Slower if you're unsure how to enter your name (with or without middle name, how to handle hyphens, etc.).</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Travel information (10–20 min)</h3>
            <p className="mt-1">Purpose of trip, intended arrival date, length of stay, US address, who's paying. Requires your itinerary and US contact's details. Most time is spent on the US contact field — many applicants have to look up hotel addresses and phone numbers.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Previous US travel (5–15 min)</h3>
            <p className="mt-1">Have you been to the US before? If yes, list all prior visits with dates. Applicants with multiple previous trips spend the most time here, especially if they don't have a precise record of past visits.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">US contact information (5 min)</h3>
            <p className="mt-1">Name, address, and phone number. Fast if you already have it written down. Slow if you need to text someone to get their full address.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Family information (10–15 min)</h3>
            <p className="mt-1">Parents' names, dates of birth, birth countries. Spouse information if married. This section surprises applicants who don't know their parents' exact dates of birth off the top of their heads.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Work and education (10–20 min)</h3>
            <p className="mt-1">Current employer, job title, address, phone number, brief job description, salary range. Previous employers if asked. This section is faster for students and retirees, longer for people with complex employment histories.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Security questions (10–15 min)</h3>
            <p className="mt-1">The longest section in terms of reading time. Most applicants answer No to every question, but reading and understanding each question carefully takes time — and it's worth taking that time, because errors here have serious consequences.</p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">5 Ways to Complete It Faster</h2>
        <ol className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 list-decimal pl-5">
          <li>
            <strong>Gather everything before you open the form.</strong> Have your passport, travel itinerary, US contact details, and employer information in front of you. Every time you switch to look something up, you risk the form timing out.
          </li>
          <li>
            <strong>Don't use a mobile device.</strong> The DS-160 portal is not optimized for phones. Use a desktop or laptop browser. Chrome and Firefox work best.
          </li>
          <li>
            <strong>Write down your application ID immediately.</strong> The form will generate an ID when you start. Write it down. If the session times out, you can retrieve your partial form using this ID — but only if you saved it.
          </li>
          <li>
            <strong>Learn the date format before you start.</strong> DD-MMM-YYYY. January is JAN, February is FEB, and so on. Writing this on a sticky note before you start saves repeated trips back to fix date fields.
          </li>
          <li>
            <strong>Prepare a reference document.</strong> Write out all your answers in the correct DS-160 format before filling the official form. This transforms the exercise from "figuring out the form" into "transcribing from my notes." This is exactly what Formixa generates for you.
          </li>
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">What About the DS-160 Session Timeout?</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          The DS-160 portal will terminate your session after 20 minutes of inactivity. "Inactivity" means not submitting a page — so if you're sitting on one page thinking, the clock is running. This catches many applicants off guard and forces them to start over from scratch on that section.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          The way to avoid this is to work quickly on each page and click "Next" frequently. Do your thinking before you open the form, not while you're in it. If you're truly stuck on a section, make a note of your application ID, exit the session, figure out your answer, and return.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Fill Your DS-160 Reference in Under 10 Minutes</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Formixa is an AI-powered DS-160 assistant. You answer ~50 plain-English questions, and the AI maps your answers into every DS-160 field with correct formatting — dates, country names, legal phrasing. You download a complete reference PDF for $25 that you can use while filling the official form at ceac.state.gov. Most users answer all questions in under 10 minutes, then use the PDF to fill the official form in 20–35 minutes instead of 1–3 hours.
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
