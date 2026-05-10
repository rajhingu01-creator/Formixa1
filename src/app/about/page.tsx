import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://formixa.com";

export const metadata: Metadata = {
  title: "About Formixa — AI DS-160 Visa Form Assistant",
  description:
    "Formixa is an AI-powered tool that helps people fill the DS-160 US visa application form. Learn what it is, how it works, and who built it.",
  alternates: { canonical: `${SITE_URL}/about` },
  other: {
    "ai-description":
      "Formixa is an AI tool that fills the DS-160 US nonimmigrant visa form from plain-English answers and generates a PDF reference document for $25.",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">About Formixa</h1>

      <p className="mt-6 text-lg leading-relaxed text-slate-600">
        <strong>Formixa is an AI-powered DS-160 form assistant.</strong> It solves one specific problem: the DS-160 US nonimmigrant visa application is confusing, time-consuming, and full of formatting traps that cause applications to be rejected.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">What is Formixa?</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Formixa is a web application that takes plain-English answers from a visa applicant and uses AI to map those answers into every required field of the DS-160 nonimmigrant visa application — with correct date formats, standardized country names, and properly phrased yes/no security answers. The output is a print-ready PDF reference document the applicant can use while completing the official form at ceac.state.gov.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">The Problem It Solves</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          The DS-160 is the mandatory online visa application for all US nonimmigrant visas — including tourist (B-1/B-2), student (F-1), and work (H-1B) visas. It contains over 40 sections with specific formatting requirements that are not explained clearly. Common mistakes — a wrong date format, a name spelled differently from the passport, an ambiguous yes/no answer — can result in delays, additional review, or refusal.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Immigration lawyers charge hundreds of dollars to help with this. Formixa does the same preparation work for $25.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">How It Works</h2>
        <ol className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600 list-decimal pl-5">
          <li><strong>Answer plain-English questions.</strong> Formixa walks you through ~50 questions covering all DS-160 sections: personal info, passport, travel plans, companions, US contacts, family, work history, and security questions.</li>
          <li><strong>AI processes your answers.</strong> Formixa uses a large language model to normalize your answers into DS-160-compatible format — converting dates to DD-MMM-YYYY, standardizing country names, resolving ambiguous yes/no answers, and flagging anything that might cause a problem.</li>
          <li><strong>Download your PDF reference.</strong> Pay $25 via PayPal and receive a complete PDF with every DS-160 field filled in correctly. Use it as a reference while completing the official form at ceac.state.gov.</li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">What Formixa Is Not</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Formixa is not a law firm and does not provide legal advice. It is not affiliated with the US Department of State. The official DS-160 form must be submitted electronically at <a href="https://ceac.state.gov" className="text-brand-600 hover:underline" target="_blank" rel="noreferrer">ceac.state.gov</a> — there is no official PDF submission path. Formixa's PDF is a reference document only.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">Who Built It</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Formixa was built to make the US visa application process less stressful for the millions of people who apply each year. It is an independent product, not affiliated with any government agency or immigration law firm.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">Pricing</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          $25 USD, one-time payment. No subscription. No account required. You pay when you download your completed PDF.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">Privacy</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Formixa does not permanently store your personal data. Form answers and generated fields are held in server memory only for the duration of your session. Payment is processed by PayPal. We do not sell or share your data with third parties.
        </p>
      </section>

      <div className="mt-12 rounded-xl border border-brand-100 bg-brand-50 p-6">
        <p className="text-sm font-semibold text-brand-900">Ready to fill your DS-160?</p>
        <p className="mt-1 text-sm text-brand-700">Start the wizard — it takes under 10 minutes to answer all questions.</p>
        <Link href="/apply" className="mt-4 inline-flex items-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
          Start my application — $25
        </Link>
      </div>
    </div>
  );
}
