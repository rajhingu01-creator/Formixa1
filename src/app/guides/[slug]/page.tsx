import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guides, getGuide } from "@/lib/guides-data";
import { CheckCircle, AlertTriangle, Star, ExternalLink, ChevronLeft } from "lucide-react";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const guide = getGuide(params.slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.subtitle,
  };
}

export default function GuidePage({ params }: Props) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/guides" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ChevronLeft size={14} />
        All Guides
      </Link>

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 mb-2">{guide.badge}</p>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">{guide.title}</h1>
        <p className="mt-2 text-slate-500">{guide.subtitle}</p>
      </div>

      {/* What is it */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">What is it?</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{guide.what}</p>
      </section>

      {/* Who needs it */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Who needs it?</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{guide.whoNeeds}</p>
      </section>

      {/* Required documents */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Required Documents</h2>
        <ul className="space-y-2">
          {guide.documents.map((doc, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <CheckCircle size={15} className="shrink-0 mt-0.5 text-green-500" />
              {doc}
            </li>
          ))}
        </ul>
      </section>

      {/* Common mistakes */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Common Mistakes to Avoid</h2>
        <ul className="space-y-2">
          {guide.commonMistakes.map((m, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-500" />
              {m}
            </li>
          ))}
        </ul>
      </section>

      {/* Approval tips */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Approval Tips</h2>
        <ul className="space-y-2">
          {guide.approvalTips.map((t, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <Star size={15} className="shrink-0 mt-0.5 text-brand-500" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      <a
        href={guide.officialLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-5 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-100"
      >
        <ExternalLink size={14} />
        Official {guide.badge} Resource
      </a>

      <div className="mt-8 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
        This guide is for informational purposes only and is not legal advice. Immigration rules change frequently — always verify current requirements at the official government websites or consult a licensed immigration attorney.
      </div>
    </div>
  );
}
