import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides-data";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Immigration Visa Guides",
  description: "Plain English guides for DS-160, F-1, B1/B2, I-485, I-130, I-765, UK Visit Visa, and Canada PR. What each form is, who needs it, required documents, and approval tips.",
};

const BADGE_COLORS: Record<string, string> = {
  "US Visa": "bg-blue-50 text-blue-700",
  "Green Card": "bg-green-50 text-green-700",
  "Work Permit": "bg-orange-50 text-orange-700",
  "UK Visa": "bg-red-50 text-red-700",
  "Canada PR": "bg-red-50 text-red-700",
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-700 mb-4">
          <BookOpen size={14} />
          Visa Guides
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Plain English Immigration Guides</h1>
        <p className="mt-2 text-slate-500 max-w-xl mx-auto">
          Everything you need to know about the most common immigration forms and visa types — written in plain English.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in-up delay-75">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm card-hover"
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_COLORS[g.badge] ?? "bg-slate-100 text-slate-600"}`}>
                {g.badge}
              </span>
            </div>
            <h2 className="font-semibold text-slate-900 group-hover:text-brand-700 leading-snug mb-2">{g.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">{g.subtitle}</p>
            <span className="mt-3 inline-flex items-center text-xs font-medium text-brand-600 group-hover:underline">
              Read guide →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
