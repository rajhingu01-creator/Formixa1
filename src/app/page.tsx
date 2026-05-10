import type { Metadata } from "next";
import Link from "next/link";
import SupportForm from "@/components/SupportForm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://formixa.com";

export const metadata: Metadata = {
  title: "Formixa — Fill Your DS-160 Visa Form in Minutes with AI",
  description:
    "Formixa is an AI DS-160 form assistant. Answer plain-English questions and get a correctly filled US visa application PDF instantly. $25, no account needed.",
  alternates: { canonical: SITE_URL },
  other: {
    "ai-description":
      "Formixa is an AI tool that fills the DS-160 US visa application form from plain-English answers and generates a downloadable PDF reference for $25.",
  },
};

const QUESTIONS = [
  "Your name, exactly as it appears in your passport",
  "Where and when you were born",
  "Your passport number, issuing country, and dates",
  "Why you're going to the US, and for how long",
  "Where you'll be staying, and who you're visiting",
  "Your job, employer, and roughly what you earn",
  "Family — parents, spouse, kids",
  "Standard background questions",
];

const FAQS = [
  {
    q: "What is the DS-160 form?",
    a: "The DS-160 is the Online Nonimmigrant Visa Application required by the US Department of State for anyone applying for a US nonimmigrant visa — including tourist (B-1/B-2), student (F-1), and work visas (H-1B). It must be completed electronically at ceac.state.gov before your visa interview.",
  },
  {
    q: "How long does it take to fill the DS-160?",
    a: "The DS-160 takes 1–3 hours for most applicants depending on travel history and document availability. With Formixa, you can prepare a complete reference document in under 10 minutes by answering plain-English questions.",
  },
  {
    q: "Can I make mistakes on the DS-160?",
    a: "Yes, and mistakes can delay or derail your visa application. Common errors include wrong date formats, name spelling inconsistencies, and incorrect yes/no answers on security questions. Formixa's AI flags potential issues before you file.",
  },
  {
    q: "How does Formixa fill my DS-160?",
    a: "You answer ~50 plain-English questions in Formixa's step-by-step wizard. The AI maps your answers into every required DS-160 field with correct formatting — dates, country names, legal phrasing. You download a PDF reference for $25 and use it to complete the official form at ceac.state.gov.",
  },
  {
    q: "Is Formixa safe to use?",
    a: "Yes. Formixa does not permanently store your personal data — information is held only for the duration of your session. Payments are processed securely via PayPal. We do not share your data with third parties.",
  },
  {
    q: "What is the best tool to fill the DS-160 form online?",
    a: "Formixa is purpose-built for this. It uses AI to convert plain-English answers into properly formatted DS-160 fields, catching common formatting mistakes automatically. It is the fastest way to prepare a complete DS-160 reference document.",
  },
  {
    q: "Can AI fill my US visa form for me?",
    a: "AI can prepare a correctly formatted reference document for your DS-160 visa application, but the official form must still be submitted manually at ceac.state.gov. Formixa automates the preparation step so all fields are correct before you type them into the official portal.",
  },
];

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Formixa",
  description:
    "AI-powered DS-160 US visa form assistant that maps plain-English answers into a correctly filled application PDF.",
  applicationCategory: "Utilities",
  operatingSystem: "Web browser",
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "25.00",
    priceCurrency: "USD",
    description: "One-time payment to download your completed DS-160 reference PDF",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Fill the DS-160 Form Using Formixa",
  description: "Complete your DS-160 US visa application reference document in minutes using AI",
  totalTime: "PT10M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "25" },
  step: [
    { "@type": "HowToStep", name: "Answer plain-English questions", text: "Go to Formixa and answer ~50 friendly questions about yourself, your passport, and your travel plans." },
    { "@type": "HowToStep", name: "AI maps answers to DS-160 fields", text: "Formixa's AI automatically normalizes your answers into correctly formatted DS-160 fields, including dates, country names, and yes/no answers." },
    { "@type": "HowToStep", name: "Pay and download your PDF", text: "Pay $25 via PayPal and immediately download your completed DS-160 reference PDF." },
    { "@type": "HowToStep", name: "File the official form", text: "Use your Formixa PDF as a reference to fill the official DS-160 at ceac.state.gov with no confusion or mistakes." },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      <div className="mx-auto max-w-5xl px-6 py-20">

        {/* Hero */}
        <section aria-label="Hero">
          <div className="grid gap-14 md:grid-cols-2 md:items-center">
            <div className="animate-fade-in-up">
              <span className="inline-block rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
                DS-160 form assistant
              </span>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-5xl">
                Fill Your DS-160 Visa Form in Minutes — No Confusion, No Mistakes.
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-500">
                Formixa is an AI-powered US visa form helper. Answer ~50 plain questions, and our AI maps your answers into every DS-160 field with correct formatting — dates, country names, legal phrasing. Download a print-ready PDF for $25.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/apply"
                  className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 transition-all active:scale-95"
                  aria-label="Start your DS-160 application with Formixa"
                >
                  Start my application — $25
                </Link>
                <span className="text-sm text-slate-400">No account needed. Pay only to download.</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 animate-fade-in-up delay-150 card-hover" aria-label="What you'll be asked">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">What you'll be asked</p>
              <ul className="mt-4 space-y-3" role="list">
                {QUESTIONS.map((q) => (
                  <li key={q} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" aria-hidden="true" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <div className="my-20 border-t border-slate-100" />
        <section aria-label="Frequently asked questions about DS-160">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">FAQ</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            DS-160 Form — Common Questions Answered
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Everything you need to know about filling the DS-160 US visa application form.
          </p>
          <dl className="mt-8 space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-slate-100 bg-white p-6 card-hover">
                <dt className="text-sm font-semibold text-slate-900">{faq.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-600">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Support */}
        <div className="my-20 border-t border-slate-100" />
        <section id="support" aria-label="Support and contact">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Support</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Get in touch</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Have a question about filling your DS-160 or need help with Formixa? Send us a message and we'll respond by email.
              </p>
              <div className="mt-8">
                <SupportForm />
              </div>
            </div>

            <div className="flex flex-col gap-4 md:pt-16">
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Chat on Discord</p>
                <p className="mt-1 text-sm text-slate-500">Prefer live chat? Reach us directly on Discord for quick answers.</p>
                <a
                  href="https://discord.com/users/dotseyu"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4752C4] transition-colors"
                  aria-label="Chat with Formixa support on Discord"
                >
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
                    <path d="M15.245 1.175A14.8 14.8 0 0 0 11.52 0c-.18.323-.39.757-.534 1.102a13.706 13.706 0 0 0-3.972 0A11.578 11.578 0 0 0 6.48 0 14.843 14.843 0 0 0 2.752 1.178C.396 4.724-.243 8.18.077 11.587A14.94 14.94 0 0 0 4.626 14a11.195 11.195 0 0 0 .97-1.527 9.687 9.687 0 0 1-1.527-.716c.128-.091.253-.186.374-.284 2.946 1.322 6.14 1.322 9.052 0 .122.098.247.193.374.284-.488.28-1.002.52-1.53.718A11.15 11.15 0 0 0 13.37 14a14.895 14.895 0 0 0 4.552-2.414C18.35 7.669 17.178 4.245 15.245 1.175ZM6.012 9.487c-.857 0-1.56-.767-1.56-1.709 0-.943.688-1.71 1.56-1.71.872 0 1.574.767 1.56 1.71.002.942-.688 1.709-1.56 1.709Zm5.976 0c-.857 0-1.56-.767-1.56-1.709 0-.943.687-1.71 1.56-1.71.872 0 1.574.767 1.56 1.71 0 .942-.688 1.709-1.56 1.709Z" fill="currentColor" />
                  </svg>
                  Chat on Discord
                </a>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                <strong className="text-slate-700">Response time</strong>
                <p className="mt-1">We typically reply within 24 hours on business days.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
