"use client";

import { useState } from "react";
import { Search, Bell, CheckCircle } from "lucide-react";

interface StatusResult {
  receiptNumber: string;
  rawTitle: string;
  rawDetail: string;
  plainEnglish: string;
}

export default function StatusPage() {
  const [receiptNumber, setReceiptNumber] = useState("");
  const [result, setResult] = useState<StatusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertDone, setAlertDone] = useState(false);

  async function checkStatus() {
    if (!receiptNumber.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    setAlertDone(false);

    const res = await fetch("/api/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiptNumber }),
    });

    const data = await res.json() as StatusResult & { error?: string };
    setLoading(false);

    if (data.error) { setError(data.error); return; }
    setResult(data);
  }

  async function subscribeAlert() {
    if (!email.trim() || !result) return;
    setAlertLoading(true);

    await fetch("/api/status/alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiptNumber: result.receiptNumber,
        email,
        currentStatus: result.rawTitle,
      }),
    });

    setAlertLoading(false);
    setAlertDone(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-4">
          <Search size={14} />
          USCIS Case Tracker
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Track Your USCIS Case Status</h1>
        <p className="mt-2 text-slate-500">Enter your receipt number to get your current status in plain English.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 mb-2">USCIS Receipt Number</label>
        <div className="flex gap-3">
          <input
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && checkStatus()}
            placeholder="e.g. IOE1234567890"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            onClick={checkStatus}
            disabled={!receiptNumber.trim() || loading}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Checking…" : "Check"}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">Format: 3 letters + 10 digits, e.g. IOE1234567890 or MSC2212345678</p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="rounded-lg bg-brand-50 p-2">
                <Search size={16} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono">{result.receiptNumber}</p>
                <h2 className="text-lg font-semibold text-slate-900">{result.rawTitle}</h2>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 mb-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Official USCIS Status</p>
              <p className="text-sm text-slate-700">{result.rawDetail}</p>
            </div>

            <div className="rounded-xl bg-brand-50 p-4">
              <p className="text-xs font-medium text-brand-600 mb-1">Plain English Summary</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{result.plainEnglish}</p>
            </div>
          </div>

          {/* Email alert subscription */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={16} className="text-slate-600" />
              <h3 className="font-medium text-slate-900">Get Email Alerts When Status Changes</h3>
            </div>
            {alertDone ? (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle size={16} />
                You&apos;re subscribed! We&apos;ll email you if the status changes.
              </div>
            ) : (
              <div className="flex gap-3">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  type="email"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <button
                  onClick={subscribeAlert}
                  disabled={!email.trim() || alertLoading}
                  className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-60"
                >
                  {alertLoading ? "Saving…" : "Alert Me"}
                </button>
              </div>
            )}
            <p className="mt-2 text-xs text-slate-400">We check status every 24 hours. No spam, unsubscribe anytime.</p>
          </div>
        </div>
      )}
    </div>
  );
}
