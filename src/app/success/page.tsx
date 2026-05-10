"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Stage = "capturing" | "ready" | "error";

function SuccessInner() {
  const params = useSearchParams();
  const token = params.get("token");           // PayPal order token
  const submissionId = params.get("submissionId"); // free promo path
  const [stage, setStage] = useState<Stage>(token ? "capturing" : "ready");
  const [resolvedId, setResolvedId] = useState<string | null>(submissionId);
  const [error, setError] = useState<string | null>(null);

  // PayPal return: capture payment first, then get submissionId
  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const res = await fetch("/api/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json() as { submissionId?: string; error?: string };
        if (!res.ok) { setError(data.error ?? "Payment capture failed"); setStage("error"); return; }
        setResolvedId(data.submissionId ?? null);
        setStage("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
        setStage("error");
      }
    })();
  }, [token]);

  // Auto-download once we have the submission ID
  useEffect(() => {
    if (stage !== "ready" || !resolvedId) return;
    const url = `/api/download?submissionId=${encodeURIComponent(resolvedId)}`;
    void triggerDownload(url, setError);
  }, [stage, resolvedId]);

  if (stage === "capturing") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500" />
        <p className="mt-4 text-slate-600">Confirming your payment…</p>
      </div>
    );
  }

  const isFreePromo = !token && !!submissionId;
  const downloadUrl = resolvedId ? `/api/download?submissionId=${encodeURIComponent(resolvedId)}` : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">
        {isFreePromo ? "Promo applied — enjoy your free download!" : "Payment received — thank you!"}
      </h1>
      <p className="mt-2 text-slate-600">
        Your DS-160 summary is ready. Your download should start automatically — use the button below if it doesn't.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        {downloadUrl ? (
          <a href={downloadUrl} className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-600 transition-colors">
            Download PDF
          </a>
        ) : (
          <p className="text-sm text-amber-700">No submission found. Please contact support.</p>
        )}
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">Back to home</Link>
      </div>

      {(error || stage === "error") && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error ?? "Something went wrong. Please contact support."}
        </div>
      )}

      <div className="mt-12 rounded-xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
        <strong className="text-slate-900">Next steps</strong>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Open the PDF and review every field.</li>
          <li>Go to <a className="text-brand-600 hover:underline" href="https://ceac.state.gov" target="_blank" rel="noreferrer">ceac.state.gov</a> and start a new DS-160.</li>
          <li>Copy each field across, or hand the PDF to your immigration lawyer.</li>
        </ol>
      </div>
    </div>
  );
}

async function triggerDownload(url: string, setError: (v: string | null) => void) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      setError(data.error ?? `Download failed (${res.status})`);
      return;
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl; a.download = "formixa-ds160.pdf";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Network error");
  }
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-16 text-slate-500">Loading…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
