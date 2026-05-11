"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  LayoutDashboard, Tag, LogOut, TrendingUp, FileText, Users, Zap,
  Inbox, Reply, Mail, MailOpen, MessageCircle, Sparkles, DollarSign,
} from "lucide-react";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
);

// ── Types ──────────────────────────────────────────────────────────────────────

type Period = "daily" | "weekly" | "monthly";
type TimeSeries = { date: string; forms: number; revenueCents: number };

type ChatAnalytics = {
  totalSubscriptions: number;
  totalChatRevenueCents: number;
  totalQuestionsAsked: number;
  totalPromoUnlocks: number;
  totalChatSessions: number;
  recentSubscriptions: { id: string; activatedAt: string; revenueAmountCents: number }[];
};

type Analytics = {
  summary: {
    totalRevenueCents: number;
    pdfRevenueCents: number;
    chatRevenueCents: number;
    totalForms: number;
    avgRevenuePerDayCents: number;
    activePromos: number;
  };
  timeSeries: TimeSeries[];
  conversion: { total: number; paid: number };
  topPromos: { code: string; uses: number }[];
  unreadMessages: number;
  recentTransactions: {
    id: string; date: string; email: string;
    amountCents: number; promoCode: string | null; paid: boolean;
  }[];
  chat: ChatAnalytics;
};

type PromoCode = {
  code: string;
  discount_type: "full" | "percent";
  discount_value: number;
  times_used: number;
  max_uses: number | null;
  active: boolean;
  created_at: string;
  scope: "pdf" | "chat" | "all";
};

type ContactMessage = {
  id: string; name: string; email: string; message: string;
  createdAt: number; read: boolean; replied: boolean;
};

type NavTab = "dashboard" | "pdf-promos" | "chat-promos" | "inbox";

// ── Helpers ────────────────────────────────────────────────────────────────────

function usd(cents: number) { return "$" + (cents / 100).toFixed(2); }

function aggregate(raw: TimeSeries[], period: Period) {
  if (period === "daily") return raw.map((d) => ({ label: d.date.slice(5), forms: d.forms, rev: d.revenueCents }));
  const buckets = new Map<string, { forms: number; rev: number }>();
  raw.forEach((d) => {
    const key = period === "weekly"
      ? `W${Math.ceil(new Date(d.date).getDate() / 7)} ${d.date.slice(0, 7)}`
      : d.date.slice(0, 7);
    const cur = buckets.get(key) ?? { forms: 0, rev: 0 };
    buckets.set(key, { forms: cur.forms + d.forms, rev: cur.rev + d.revenueCents });
  });
  return Array.from(buckets.entries()).map(([label, v]) => ({ label, forms: v.forms, rev: v.rev }));
}

// ── Logo / Login ───────────────────────────────────────────────────────────────

function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#3b5bdb" />
      <rect x="7" y="8" width="14" height="2" rx="1" fill="white" />
      <rect x="7" y="13" width="10" height="2" rx="1" fill="white" />
      <rect x="7" y="18" width="7" height="2" rx="1" fill="white" />
    </svg>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) { onSuccess(); return; }
    const d = await res.json().catch(() => ({})) as { error?: string };
    setError(d.error ?? "Login failed");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Logo size={32} />
          <div>
            <p className="text-base font-semibold text-white">Formixa Admin</p>
            <p className="text-xs text-slate-400">Sign in to continue</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none" />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({ tab, setTab, onLogout, unread }: { tab: NavTab; setTab: (t: NavTab) => void; onLogout: () => void; unread: number }) {
  const nav = [
    { id: "dashboard" as NavTab, label: "Dashboard", icon: LayoutDashboard, badge: 0 },
    { id: "pdf-promos" as NavTab, label: "PDF Promos", icon: FileText, badge: 0 },
    { id: "chat-promos" as NavTab, label: "Chat Promos", icon: MessageCircle, badge: 0 },
    { id: "inbox" as NavTab, label: "Inbox", icon: Inbox, badge: unread },
  ];

  return (
    <aside className="flex w-56 flex-col bg-slate-900 min-h-screen">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <Logo size={26} />
        <div>
          <p className="text-sm font-semibold text-white leading-none">Formixa</p>
          <p className="text-xs text-slate-500 mt-0.5">Admin</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              tab === id ? "bg-brand-500 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}>
            <Icon size={16} />
            <span className="flex-1 text-left">{label}</span>
            {badge > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white leading-none">{badge}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="px-3 pb-5 border-t border-slate-800 pt-4">
        <button onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}

// ── Period Toggle ──────────────────────────────────────────────────────────────

function PeriodToggle({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
      {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
            period === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}>
          {p}
        </button>
      ))}
    </div>
  );
}

const lineOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: "index" as const, intersect: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 11 } } },
    y: { grid: { color: "#f1f5f9" }, ticks: { color: "#94a3b8", font: { size: 11 } }, border: { display: false } },
  },
};

// ── Dashboard View ─────────────────────────────────────────────────────────────

function DashboardView() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState<Period>("daily");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setData(d as Analytics))
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="text-sm text-red-500 p-6">Failed to load analytics.</p>;
  if (!data) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500" />
    </div>
  );

  const pts = aggregate(data.timeSeries, period);
  const chatRevPct = data.summary.totalRevenueCents > 0
    ? Math.round((data.summary.chatRevenueCents / data.summary.totalRevenueCents) * 100) : 0;
  const pdfRevPct = 100 - chatRevPct;
  const convRate = data.conversion.total > 0
    ? Math.round((data.conversion.paid / data.conversion.total) * 100) : 0;

  // Summary cards
  const summaryCards = [
    { label: "Total Revenue", value: usd(data.summary.totalRevenueCents), sub: "All time", icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
    { label: "PDF Revenue", value: usd(data.summary.pdfRevenueCents), sub: `${pdfRevPct}% of total`, icon: FileText, color: "text-brand-500", bg: "bg-brand-50" },
    { label: "Chat Revenue", value: usd(data.summary.chatRevenueCents), sub: `${chatRevPct}% of total`, icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Avg Rev / Day", value: usd(data.summary.avgRevenuePerDayCents), sub: "Last 30 days", icon: TrendingUp, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Forms Submitted", value: data.summary.totalForms.toString(), sub: `${convRate}% conversion`, icon: FileText, color: "text-slate-500", bg: "bg-slate-100" },
    { label: "Chat Sessions", value: data.chat.totalChatSessions.toString(), sub: "Unique sessions", icon: Users, color: "text-teal-500", bg: "bg-teal-50" },
    { label: "Questions Asked", value: data.chat.totalQuestionsAsked.toString(), sub: "All time", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Chat Subscribers", value: data.chat.totalSubscriptions.toString(), sub: `${data.chat.totalPromoUnlocks} via promo`, icon: Sparkles, color: "text-pink-500", bg: "bg-pink-50" },
  ];

  return (
    <div className="space-y-6">

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{c.label}</p>
              <div className={`rounded-lg p-1.5 ${c.bg}`}>
                <c.icon size={14} className={c.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue split + period toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Revenue & Activity</h2>
        <PeriodToggle period={period} onChange={setPeriod} />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Revenue over time */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-4">PDF Revenue Over Time</p>
          <div className="h-52">
            <Line
              data={{
                labels: pts.map((p) => p.label),
                datasets: [{
                  data: pts.map((p) => +(p.rev / 100).toFixed(2)),
                  borderColor: "#3b5bdb", backgroundColor: "rgba(59,91,219,0.08)",
                  borderWidth: 2, pointRadius: 3, pointBackgroundColor: "#3b5bdb",
                  fill: true, tension: 0.4,
                }],
              }}
              options={{ ...lineOpts, scales: { ...lineOpts.scales, y: { ...lineOpts.scales.y, ticks: { ...lineOpts.scales.y.ticks, callback: (v) => "$" + v } } } }}
            />
          </div>
        </div>

        {/* Forms submitted */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-4">Forms Submitted</p>
          <div className="h-52">
            <Line
              data={{
                labels: pts.map((p) => p.label),
                datasets: [{
                  data: pts.map((p) => p.forms),
                  borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.08)",
                  borderWidth: 2, pointRadius: 3, pointBackgroundColor: "#10b981",
                  fill: true, tension: 0.4,
                }],
              }}
              options={lineOpts}
            />
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Revenue split doughnut */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-4">Revenue Split</p>
          <div className="flex items-center gap-4">
            <div className="h-36 w-36 flex-none">
              <Doughnut
                data={{
                  labels: ["PDF Downloads", "AI Chat"],
                  datasets: [{
                    data: [data.summary.pdfRevenueCents, data.summary.chatRevenueCents],
                    backgroundColor: ["#3b5bdb", "#a855f7"],
                    borderWidth: 0,
                  }],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${usd((c.raw as number))}` } } },
                  cutout: "72%",
                }}
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-brand-500 flex-none" />
                <div>
                  <p className="text-slate-700 font-medium">PDF</p>
                  <p className="text-xs text-slate-400">{usd(data.summary.pdfRevenueCents)} · {pdfRevPct}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple-500 flex-none" />
                <div>
                  <p className="text-slate-700 font-medium">Chat</p>
                  <p className="text-xs text-slate-400">{usd(data.summary.chatRevenueCents)} · {chatRevPct}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion doughnut */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-4">PDF Conversion Rate</p>
          <div className="flex items-center gap-4">
            <div className="h-36 w-36 flex-none">
              <Doughnut
                data={{
                  labels: ["Paid", "Not paid"],
                  datasets: [{
                    data: [data.conversion.paid, Math.max(0, data.conversion.total - data.conversion.paid)],
                    backgroundColor: ["#3b5bdb", "#e2e8f0"], borderWidth: 0,
                  }],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } }, cutout: "72%",
                }}
              />
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-3xl font-bold text-slate-900">{convRate}%</p>
                <p className="text-xs text-slate-400">conversion</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-brand-500" /> {data.conversion.paid} paid
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-slate-200" /> {Math.max(0, data.conversion.total - data.conversion.paid)} unpaid
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top promos */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-4">Top Promo Codes</p>
          {data.topPromos.length === 0 ? (
            <div className="flex h-36 items-center justify-center text-sm text-slate-400">No promo usage yet</div>
          ) : (
            <div className="h-36">
              <Bar
                data={{
                  labels: data.topPromos.map((p) => p.code),
                  datasets: [{ data: data.topPromos.map((p) => p.uses), backgroundColor: "#748ffc", borderRadius: 5, borderSkipped: false }],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 } } },
                    y: { grid: { color: "#f1f5f9" }, ticks: { color: "#94a3b8", font: { size: 11 }, stepSize: 1 }, border: { display: false } },
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Chat stats row */}
      <div className="grid gap-4 lg:grid-cols-4">
        {[
          { label: "Chat Sessions", value: data.chat.totalChatSessions, icon: Users, color: "text-teal-600" },
          { label: "Questions Asked", value: data.chat.totalQuestionsAsked, icon: MessageCircle, color: "text-orange-600" },
          { label: "Subscriptions", value: data.chat.totalSubscriptions, icon: Sparkles, color: "text-purple-600" },
          { label: "Promo Unlocks", value: data.chat.totalPromoUnlocks, icon: Zap, color: "text-pink-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-purple-100 bg-purple-50 p-4 flex items-center gap-3">
            <s.icon size={20} className={s.color} />
            <div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions + chat subs side by side */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* PDF transactions */}
        <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Recent PDF Transactions</p>
          </div>
          {data.recentTransactions.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Promo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTransactions.map((t) => (
                    <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                        {new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-slate-700 truncate max-w-[120px]">{t.email}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{usd(t.amountCents)}</td>
                      <td className="px-4 py-3">
                        {t.promoCode
                          ? <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-mono text-brand-600">{t.promoCode}</span>
                          : <span className="text-slate-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Chat subscriptions */}
        <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Recent Chat Subscriptions</p>
            <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full">{usd(data.chat.totalChatRevenueCents)} total</span>
          </div>
          {data.chat.recentSubscriptions.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">No chat subscriptions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.chat.recentSubscriptions.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(s.activatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{usd(s.revenueAmountCents)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Promo Codes View (generic) ─────────────────────────────────────────────────

function PromoCodesView({ scope }: { scope: "pdf" | "chat" }) {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"full" | "percent">("full");
  const [value, setValue] = useState("50");
  const [maxUses, setMaxUses] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isChatScope = scope === "chat";

  const load = () => {
    fetch("/api/admin/promos")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const all = d as PromoCode[];
        // Filter by scope — chat promos have scope="chat"|"all", pdf promos have scope="pdf"|"all" or undefined
        setPromos(all.filter((p) =>
          isChatScope
            ? (p.scope === "chat" || p.scope === "all")
            : (p.scope === "pdf" || p.scope === "all" || !p.scope)
        ));
      })
      .catch(() => { /* silent */ });
  };

  useEffect(() => { load(); }, [scope]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true); setFormError(null); setSuccess(false);
    const res = await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        discount_type: type,
        discount_value: type === "percent" ? parseInt(value, 10) : 100,
        max_uses: maxUses ? parseInt(maxUses, 10) : null,
        scope,
      }),
    });
    setCreating(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({})) as { error?: string };
      setFormError(d.error ?? "Failed to create"); return;
    }
    setCode(""); setValue("50"); setMaxUses(""); setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    load();
  };

  const remove = async (c: string) => {
    await fetch(`/api/admin/promos/${encodeURIComponent(c)}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      {isChatScope && (
        <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm text-purple-800">
          <strong>Chat promo codes</strong> are entered in the /chat paywall. <strong>Full (100% off)</strong> codes grant free unlimited access instantly. <strong>Percentage</strong> codes apply a discount on the one-time payment.
        </div>
      )}

      {/* Create form */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-900 mb-4">
          Create {isChatScope ? "Chat" : "PDF"} promo code
        </p>
        <form onSubmit={create} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={isChatScope ? "CHATFREE" : "LAUNCH50"} required
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono uppercase tracking-wider focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as "full" | "percent")}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
              <option value="full">Full free (100% off)</option>
              <option value="percent">Percentage off</option>
            </select>
          </div>
          {type === "percent" && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">Discount %</label>
              <input type="number" min={1} max={99} value={value} onChange={(e) => setValue(e.target.value)}
                className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
          )}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Max uses <span className="text-slate-400">(blank = unlimited)</span></label>
            <input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)}
              placeholder="∞"
              className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          <button type="submit" disabled={creating}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors">
            {creating ? "Creating…" : "Create"}
          </button>
        </form>
        {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
        {success && <p className="mt-2 text-xs text-green-600 font-medium">✓ Promo code created successfully</p>}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">{isChatScope ? "Chat" : "PDF"} promo codes</p>
          <span className="text-xs text-slate-400">{promos.length} code{promos.length !== 1 ? "s" : ""}</span>
        </div>
        {promos.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">No {isChatScope ? "chat" : "PDF"} promo codes yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Uses</th>
                <th className="px-5 py-3">Remaining</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => {
                const remaining = p.max_uses === null ? "∞" : Math.max(0, p.max_uses - p.times_used).toString();
                return (
                  <tr key={p.code} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono font-medium text-slate-900">{p.code}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {p.discount_type === "full" ? "100% off" : `${p.discount_value}% off`}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{p.times_used}</td>
                    <td className="px-5 py-3 text-slate-600">{remaining}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${p.active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${p.active ? "bg-green-500" : "bg-slate-400"}`} />
                        {p.active ? "Active" : "Exhausted"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => void remove(p.code)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Inbox View ─────────────────────────────────────────────────────────────────

function InboxView({ onRead }: { onRead: () => void }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/inbox")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setMessages(d as ContactMessage[]))
      .catch(() => { /* silent */ });
  };

  useEffect(() => { load(); }, []);

  const expand = async (msg: ContactMessage) => {
    setExpanded(expanded === msg.id ? null : msg.id);
    setReplyId(null); setReplyText(""); setReplyError(null);
    if (!msg.read) {
      await fetch(`/api/admin/inbox/${msg.id}`, { method: "PATCH" });
      load(); onRead();
    }
  };

  const sendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSending(true); setReplyError(null);
    const res = await fetch(`/api/admin/inbox/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: replyText }),
    });
    setSending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({})) as { error?: string };
      setReplyError(d.error ?? "Failed to send"); return;
    }
    setReplyId(null); setReplyText(""); load();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">{messages.filter((m) => !m.read).length} unread of {messages.length} messages</p>
      {messages.length === 0 && (
        <div className="rounded-xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">No messages yet.</div>
      )}
      {messages.map((msg) => (
        <div key={msg.id} className={`rounded-xl border bg-white shadow-sm overflow-hidden ${!msg.read ? "border-brand-200" : "border-slate-100"}`}>
          <button className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors" onClick={() => void expand(msg)}>
            <span className="mt-0.5 flex-none text-slate-400">
              {msg.read ? <MailOpen size={16} /> : <Mail size={16} className="text-brand-500" />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${msg.read ? "text-slate-700" : "text-slate-900"}`}>{msg.name}</span>
                <span className="text-xs text-slate-400">{msg.email}</span>
                {msg.replied && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-600">Replied</span>}
                {!msg.read && <span className="h-2 w-2 rounded-full bg-brand-500 flex-none" />}
              </div>
              <p className="mt-0.5 text-sm text-slate-500 truncate">{msg.message}</p>
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {new Date(msg.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </button>
          {expanded === msg.id && (
            <div className="border-t border-slate-100 px-5 py-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.message}</p>
              {replyId === msg.id ? (
                <div className="mt-4 space-y-2">
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4}
                    placeholder="Type your reply…"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
                  {replyError && <p className="text-xs text-red-600">{replyError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => void sendReply(msg.id)} disabled={sending || !replyText.trim()}
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
                      {sending ? "Sending…" : "Send reply"}
                    </button>
                    <button onClick={() => { setReplyId(null); setReplyText(""); setReplyError(null); }} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setReplyId(msg.id)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                  <Reply size={14} /> Reply via email
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────────────────────────

function AdminShell({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<NavTab>("dashboard");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { unreadMessages?: number }) => setUnread(d.unreadMessages ?? 0))
      .catch(() => { /* silent */ });
  }, []);

  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); onLogout(); };

  const tabTitles: Record<NavTab, string> = {
    dashboard: "Analytics Dashboard",
    "pdf-promos": "PDF Promo Codes",
    "chat-promos": "AI Chat Promo Codes",
    inbox: "Inbox",
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar tab={tab} setTab={setTab} onLogout={() => void logout()} unread={unread} />
      <main className="flex-1 bg-slate-50 overflow-auto">
        <div className="px-8 py-7">
          <h1 className="text-xl font-bold text-slate-900 mb-6">{tabTitles[tab]}</h1>
          {tab === "dashboard" && <DashboardView />}
          {tab === "pdf-promos" && <PromoCodesView scope="pdf" />}
          {tab === "chat-promos" && <PromoCodesView scope="chat" />}
          {tab === "inbox" && <InboxView onRead={() => setUnread((n) => Math.max(0, n - 1))} />}
        </div>
      </main>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => setAuthed(r.status !== 401));
  }, []);

  if (authed === null) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
    </div>
  );

  if (!authed) return <LoginForm onSuccess={() => setAuthed(true)} />;
  return <AdminShell onLogout={() => setAuthed(false)} />;
}
