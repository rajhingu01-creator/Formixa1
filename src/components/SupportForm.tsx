"use client";

import { useState } from "react";

export default function SupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to send"); setStatus("error"); return; }
      setStatus("sent");
      setName(""); setEmail(""); setMessage("");
    } catch {
      setError("Network error. Please try again."); setStatus("error");
    }
  };

  const inputCls = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
        <p className="text-sm font-semibold text-green-800">Message sent!</p>
        <p className="mt-1 text-sm text-green-700">We'll get back to you as soon as possible.</p>
        <button onClick={() => setStatus("idle")} className="mt-3 text-xs text-green-600 underline">Send another</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600">Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Message</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} placeholder="How can we help?" className={inputCls} />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit" disabled={status === "sending"}
        className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
