"use client";

import { useState } from "react";
import { AlertTriangle, Search } from "lucide-react";

const EXAMPLES = [
  "I overstayed my B2 visa by 3 months in 2022. Can I still apply for an H1B?",
  "I was arrested but not convicted for a DUI. How does this affect my green card application?",
  "I worked without authorization on a student visa for 2 months. What are the consequences?",
];

export default function ImpactPage() {
  const [situation, setSituation] = useState("");
  const [assessment, setAssessment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkImpact() {
    if (!situation.trim()) return;
    setLoading(true);
    setAssessment("");
    setError("");

    const res = await fetch("/api/impact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ situation }),
    });

    const data = await res.json() as { assessment?: string; error?: string };
    setLoading(false);

    if (data.error) { setError(data.error); return; }
    if (data.assessment) setAssessment(data.assessment);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 mb-4">
          <AlertTriangle size={14} />
          Immigration Impact Checker
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Understand Your Immigration Risk</h1>
        <p className="mt-2 text-slate-500">
          Describe your situation and get a plain English assessment of potential immigration impacts and next steps.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 mb-2">Describe your situation</label>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          rows={5}
          placeholder="E.g. I overstayed my tourist visa by 6 months and want to apply for a student visa…"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 resize-none"
        />

        <div className="mt-2 mb-4">
          <p className="text-xs text-slate-400 mb-2">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setSituation(ex)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 text-left"
              >
                {ex.length > 60 ? ex.slice(0, 60) + "…" : ex}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={checkImpact}
          disabled={!situation.trim() || loading}
          className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <Search size={16} />
          {loading ? "Analysing…" : "Check Impact"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">{error}</div>
      )}

      {assessment && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Assessment</h2>
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{assessment}</div>
        </div>
      )}

      <div className="mt-6 rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
        <strong>Disclaimer:</strong> This tool provides general information only and is <strong>not legal advice</strong>. Immigration law is complex and fact-specific. Always consult a licensed immigration attorney before taking any action.
      </div>
    </div>
  );
}
