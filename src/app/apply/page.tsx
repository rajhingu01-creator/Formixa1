"use client";

import { useMemo, useState } from "react";
import { SECTIONS, type Question } from "@/lib/ds160";

type Status = "filling" | "submitting" | "review" | "checkout" | "error";

type SubmissionResult = {
  submissionId: string;
  warnings: string[];
  preview: {
    full_name: string;
    nationality: string;
    passport_number: string;
    intended_arrival_date: string;
    purpose_of_trip: string;
  };
};

export default function ApplyPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("filling");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);

  const totalSteps = SECTIONS.length;
  const section = SECTIONS[stepIndex];
  const progress = useMemo(
    () => Math.round(((stepIndex + 1) / totalSteps) * 100),
    [stepIndex, totalSteps],
  );

  const setAnswer = (id: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const missingRequired = section.questions
    .filter((q) => q.required)
    .filter((q) => !(answers[q.id] ?? "").trim());

  const next = () => {
    if (missingRequired.length > 0) return;
    if (stepIndex < totalSteps - 1) setStepIndex(stepIndex + 1);
    else void submit();
  };

  const prev = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const submit = async () => {
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong");
        return;
      }
      setResult(data as SubmissionResult);
      setStatus("review");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Network error");
    }
  };

  const checkout = async () => {
    if (!result) return;
    setStatus("checkout");
    setPromoError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: result.submissionId, promoCode: promoCode.trim() || undefined }),
      });
      const data = await res.json() as { url?: string; error?: string; free?: boolean };
      if (!res.ok) {
        // Invalid promo code — show inline, stay on review screen
        if (res.status === 400 && promoCode.trim()) {
          setPromoError(data.error ?? "Invalid promo code");
          setStatus("review");
          return;
        }
        setStatus("error");
        setError(data.error ?? "Could not start checkout");
        return;
      }
      if (!data.url) {
        setStatus("error");
        setError("No redirect URL returned from server");
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Network error");
    }
  };

  if (status === "submitting") {
    return (
      <Wrapper>
        <Centered>
          <Spinner />
          <p className="mt-4 text-slate-700">Mapping your answers into DS-160 fields…</p>
          <p className="mt-1 text-sm text-slate-500">This usually takes 10–30 seconds.</p>
        </Centered>
      </Wrapper>
    );
  }

  if (status === "review" && result) {
    return (
      <Wrapper>
        <h1 className="text-3xl font-semibold text-slate-900">Review and pay</h1>
        <p className="mt-2 text-slate-600">
          Here's a quick preview of how Claude interpreted your answers. Pay $25 to download the full PDF.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Preview</div>
          <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {Object.entries(result.preview).map(([k, v]) => (
              <div key={k}>
                <dt className="text-slate-500">{k.replace(/_/g, " ")}</dt>
                <dd className="font-medium text-slate-900">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>

        {result.warnings.length > 0 && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-amber-900">Warnings</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-amber-800">
              You can still pay and download — the PDF will include these warnings so you remember to fix them.
            </p>
          </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700">Promo code <span className="text-slate-400 font-normal">(optional)</span></label>
          <div className="mt-1.5 flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(null); }}
              placeholder="ENTER CODE"
              className="w-48 rounded-md border border-slate-300 px-3 py-2 text-sm font-mono uppercase tracking-wider shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          {promoError && <p className="mt-1 text-xs text-red-600">{promoError}</p>}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={checkout}
            disabled={(status as Status) === "checkout"}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-base font-medium text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-60"
          >
            {(status as Status) === "checkout" ? "Processing…" : promoCode.trim() ? "Apply code & continue" : "Pay $25 and download PDF"}
          </button>
          <button
            onClick={() => setStatus("filling")}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            Edit my answers
          </button>
        </div>
      </Wrapper>
    );
  }

  if (status === "error") {
    return (
      <Wrapper>
        <h1 className="text-3xl font-semibold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={() => setStatus(result ? "review" : "filling")}
          className="mt-6 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Go back
        </button>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Step {stepIndex + 1} of {totalSteps}</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h1 className="text-3xl font-semibold text-slate-900">{section.title}</h1>
      {section.description && (
        <p className="mt-2 text-slate-600">{section.description}</p>
      )}

      <div className="mt-8 space-y-6">
        {section.questions.map((q) => (
          <Field
            key={q.id}
            question={q}
            value={answers[q.id] ?? ""}
            onChange={(v) => setAnswer(q.id, v)}
          />
        ))}
      </div>

      {missingRequired.length > 0 && (
        <p className="mt-6 text-sm text-amber-700">
          Please fill in: {missingRequired.map((q) => q.label).join(", ")}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={prev}
          disabled={stepIndex === 0}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Back
        </button>
        <button
          onClick={next}
          disabled={missingRequired.length > 0}
          className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-60"
        >
          {stepIndex === totalSteps - 1 ? "Review My Answers" : "Continue"}
        </button>
      </div>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-2xl px-6 py-12">{children}</div>;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center py-20 text-center">{children}</div>;
}

function Spinner() {
  return (
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
  );
}

function Field({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  const labelEl = (
    <label htmlFor={question.id} className="block text-sm font-medium text-slate-800">
      {question.label}
      {question.required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
  const helper = question.helper && (
    <p className="mt-1 text-xs text-slate-500">{question.helper}</p>
  );
  const baseInput =
    "mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

  switch (question.type) {
    case "textarea":
      return (
        <div>
          {labelEl}
          {helper}
          <textarea
            id={question.id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            placeholder={question.placeholder}
            className={baseInput}
          />
        </div>
      );
    case "date":
      return (
        <div>
          {labelEl}
          {helper}
          <input
            id={question.id}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseInput}
          />
        </div>
      );
    case "select":
      return (
        <div>
          {labelEl}
          {helper}
          <select
            id={question.id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseInput}
          >
            <option value="">Select…</option>
            {question.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      );
    case "yesno":
      return (
        <div>
          {labelEl}
          {helper}
          <div className="mt-2 flex gap-3">
            {["Yes", "No"].map((opt) => {
              const active = value === opt;
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => onChange(opt)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      );
    case "text":
    default:
      return (
        <div>
          {labelEl}
          {helper}
          <input
            id={question.id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className={baseInput}
          />
        </div>
      );
  }
}
