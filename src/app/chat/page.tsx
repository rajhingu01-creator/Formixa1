"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Lock, MessageCircle, AlertCircle, Tag, CheckCircle, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

function getOrCreateSessionId(): string {
  const key = "formixa_chat_session";
  let id = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    if (typeof window !== "undefined") localStorage.setItem(key, id);
  }
  return id;
}

const SUGGESTIONS = [
  "Can I work on a B1/B2 visa?",
  "How long can I stay after my I-94 expires?",
  "What documents do I need for F1?",
  "How do I extend my H1B?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [chatError, setChatError] = useState("");

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number | null>(null);
  const [promoDiscountedCents, setPromoDiscountedCents] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const FREE_LIMIT = 3;

  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
    const params = new URLSearchParams(window.location.search);
    const subscriptionId = params.get("subscription_id");
    const orderId = params.get("token"); // PayPal one-time order returns ?token=ORDER_ID
    const sessionParam = params.get("session");
    const type = params.get("type");
    if (sessionParam) {
      if (orderId && type === "order") {
        verifyOrder(orderId, sessionParam);
      } else if (subscriptionId) {
        verifySubscription(subscriptionId, sessionParam);
      }
      window.history.replaceState({}, "", "/chat");
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function verifySubscription(subscriptionId: string, sid: string) {
    const res = await fetch(`/api/chat/subscribe?subscriptionId=${subscriptionId}&sessionId=${encodeURIComponent(sid)}`);
    const data = await res.json() as { activated?: boolean };
    if (data.activated) { setUnlocked(true); setNeedsSubscription(false); }
  }

  async function verifyOrder(orderId: string, sid: string) {
    const res = await fetch(`/api/chat/subscribe?orderId=${orderId}&sessionId=${encodeURIComponent(sid)}`);
    const data = await res.json() as { activated?: boolean };
    if (data.activated) { setUnlocked(true); setNeedsSubscription(false); }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setChatError("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, sessionId }),
      });

      const data = await res.json() as {
        answer?: string;
        questionCount?: number;
        subscribed?: boolean;
        promoUnlocked?: boolean;
        needsSubscription?: boolean;
        error?: string;
      };

      setLoading(false);

      if (res.status === 402 || data.needsSubscription) {
        setNeedsSubscription(true);
        setMessages((m) => m.slice(0, -1));
        setInput(question);
        return;
      }

      if (data.error) {
        setChatError(data.error);
        setMessages((m) => m.slice(0, -1));
        setInput(question);
        return;
      }

      if (data.answer) {
        setMessages((m) => [...m, { role: "assistant", text: data.answer! }]);
        if (data.questionCount !== undefined) setQuestionCount(data.questionCount);
        if (data.subscribed || data.promoUnlocked) setUnlocked(true);
      }
    } catch {
      setLoading(false);
      setChatError("Network error — could not reach the server. Please check your connection and try again.");
      setMessages((m) => m.slice(0, -1));
      setInput(question);
    }
  }

  async function applyPromo() {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    setPromoSuccess("");

    const res = await fetch("/api/chat/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoInput.trim(), sessionId }),
    });

    const data = await res.json() as {
      success?: boolean; message?: string; error?: string;
      discountType?: "full" | "percent"; discountPercent?: number; discountedPriceCents?: number;
    };
    setPromoLoading(false);

    if (data.error) { setPromoError(data.error); return; }
    if (data.success) {
      setPromoSuccess(data.message ?? "Promo applied!");
      if (data.discountType === "full") {
        setUnlocked(true);
        setNeedsSubscription(false);
        setTimeout(() => setShowPromo(false), 1800);
      } else if (data.discountType === "percent") {
        setPromoDiscountPercent(data.discountPercent ?? null);
        setPromoDiscountedCents(data.discountedPriceCents ?? null);
        // Don't unlock — user still needs to pay at discounted price
      }
    }
  }

  async function startSubscription() {
    setSubscribing(true);
    const res = await fetch("/api/chat/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const data = await res.json() as { approvalUrl?: string; error?: string };
    setSubscribing(false);
    if (data.approvalUrl) window.location.href = data.approvalUrl;
  }

  const remaining = Math.max(0, FREE_LIMIT - questionCount);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 animate-fade-in">

      {/* Header */}
      <div className="mb-8 text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 mb-4 shadow-sm">
          <MessageCircle size={14} />
          AI Immigration Chat
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Immigration Questions, Answered Instantly</h1>
        <p className="mt-2 text-slate-500">
          Ask any immigration question and get a clear, expert answer powered by AI.
          {!unlocked && (
            <span className={`ml-1 font-semibold ${remaining <= 1 ? "text-red-500" : "text-brand-600"}`}>
              {remaining} free question{remaining !== 1 ? "s" : ""} remaining.
            </span>
          )}
          {unlocked && (
            <span className="ml-1 font-semibold text-green-600 inline-flex items-center gap-1">
              <Sparkles size={12} /> Unlimited access active
            </span>
          )}
        </p>
      </div>

      {/* Error banner */}
      {chatError && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 animate-scale-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{chatError}</span>
          <button onClick={() => setChatError("")} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Chat window */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-fade-in-up delay-75">

        {/* Messages */}
        <div className="h-[440px] overflow-y-auto p-6 space-y-4 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-center text-slate-400 animate-fade-in">
              <div>
                <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
                  <MessageCircle size={22} className="text-brand-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">Ask any immigration question to get started</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Powered by AI · Not legal advice</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-sm mx-auto">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end animate-msg-right" : "justify-start animate-msg-left"}`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center mr-2 shrink-0 mt-1">
                  <MessageCircle size={13} className="text-brand-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  m.role === "user"
                    ? "bg-brand-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-msg-left">
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center mr-2 shrink-0 mt-1">
                <MessageCircle size={13} className="text-brand-600" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="flex gap-1.5 items-center">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Paywall */}
        {needsSubscription && (
          <div className="border-t border-amber-100 bg-gradient-to-b from-amber-50 to-orange-50 p-6 animate-scale-in">
            <div className="text-center mb-5">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <Lock size={18} className="text-amber-600" />
              </div>
              <p className="font-semibold text-slate-800 text-lg">You&apos;ve used your 3 free questions</p>
              <p className="mt-1 text-sm text-slate-500">Get unlimited access for $9.99/month, or enter a promo code.</p>
            </div>

            {promoDiscountPercent !== null && promoDiscountedCents !== null && (
              <div className="mb-4 max-w-sm mx-auto rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-center gap-2 animate-scale-in">
                <CheckCircle size={15} className="shrink-0" />
                <span><strong>{promoDiscountPercent}% off</strong> applied — subscribe for <strong>${(promoDiscountedCents / 100).toFixed(2)}</strong> one-time</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <button
                onClick={startSubscription}
                disabled={subscribing}
                className="flex-1 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors shadow-sm"
              >
                {subscribing ? "Redirecting…" : promoDiscountedCents !== null
                  ? `Pay $${(promoDiscountedCents / 100).toFixed(2)} (${promoDiscountPercent}% off)`
                  : "Subscribe — $9.99/mo"}
              </button>
              <button
                onClick={() => { setShowPromo((s) => !s); setPromoError(""); setPromoSuccess(""); }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Tag size={13} />
                Promo code
              </button>
            </div>

            {/* Promo code input */}
            {showPromo && (
              <div className="mt-4 max-w-sm mx-auto animate-fade-in-up">
                {promoSuccess ? (
                  <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700 animate-scale-in">
                    <CheckCircle size={16} />
                    {promoSuccess}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                      placeholder="Enter promo code"
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono uppercase focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                    <button
                      onClick={applyPromo}
                      disabled={!promoInput.trim() || promoLoading}
                      className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                      {promoLoading ? "…" : "Apply"}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={11} /> {promoError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Input bar */}
        {!needsSubscription && (
          <div className="border-t border-slate-100 p-4 flex gap-3 bg-white">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask an immigration question…"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-shadow"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-white hover:bg-brand-700 disabled:opacity-40 transition-all active:scale-95 shadow-sm"
            >
              <Send size={16} />
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-slate-400 animate-fade-in delay-300">
        AI responses are for informational purposes only and are not legal advice. Consult a licensed immigration attorney for your specific situation.
      </p>
    </div>
  );
}
