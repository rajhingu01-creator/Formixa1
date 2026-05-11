import type { Ds160Fields, Answers } from "./ds160";

export type Submission = {
  id: string;
  createdAt: number;
  answers: Answers;
  fields: Ds160Fields;
  paid: boolean;
  paypalOrderId?: string;
  paidAmountCents?: number;
  promoCode?: string;
};

export type PromoCode = {
  code: string;
  discount_type: "full" | "percent";
  discount_value: number;
  times_used: number;
  max_uses: number | null;
  active: boolean;
  created_at: string;
  scope: "pdf" | "chat" | "all"; // "pdf" = DS-160 only, "chat" = AI chat only, "all" = both
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: number;
  read: boolean;
  replied: boolean;
};

declare global {
  // eslint-disable-next-line no-var
  var __formixaStore: Map<string, Submission> | undefined;
  // eslint-disable-next-line no-var
  var __formixaPromos: Map<string, PromoCode> | undefined;
  // eslint-disable-next-line no-var
  var __formixaMessages: Map<string, ContactMessage> | undefined;
}

const store: Map<string, Submission> =
  globalThis.__formixaStore ?? (globalThis.__formixaStore = new Map());

const promoStore: Map<string, PromoCode> =
  globalThis.__formixaPromos ?? (globalThis.__formixaPromos = new Map());

const messageStore: Map<string, ContactMessage> =
  globalThis.__formixaMessages ?? (globalThis.__formixaMessages = new Map());

function newId(prefix: string): string {
  return `${prefix}_` + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// --- Submissions ---

export function createSubmission(input: { answers: Answers; fields: Ds160Fields }): Submission {
  const sub: Submission = { id: newId("sub"), createdAt: Date.now(), answers: input.answers, fields: input.fields, paid: false };
  store.set(sub.id, sub);
  return sub;
}

export function getSubmission(id: string): Submission | undefined { return store.get(id); }

export function attachPaypalOrder(id: string, orderId: string): void {
  const sub = store.get(id);
  if (sub) { sub.paypalOrderId = orderId; store.set(id, sub); }
}

export function markPaid(id: string, amountCents?: number, promoCode?: string): void {
  const sub = store.get(id);
  if (sub) {
    sub.paid = true;
    if (amountCents !== undefined) sub.paidAmountCents = amountCents;
    if (promoCode) sub.promoCode = promoCode;
    store.set(id, sub);
  }
}

export function findByOrderId(orderId: string): Submission | undefined {
  for (const sub of store.values()) { if (sub.paypalOrderId === orderId) return sub; }
  return undefined;
}

export function getAllSubmissions(): Submission[] { return Array.from(store.values()); }

// --- Promo Codes ---

export function createPromoCode(
  input: Pick<PromoCode, "code" | "discount_type" | "discount_value"> & { max_uses?: number | null; scope?: PromoCode["scope"] },
): PromoCode {
  const promo: PromoCode = {
    code: input.code.toUpperCase().trim(),
    discount_type: input.discount_type,
    discount_value: input.discount_value,
    times_used: 0,
    max_uses: input.max_uses ?? null,
    active: true,
    created_at: new Date().toISOString(),
    scope: input.scope ?? "pdf",
  };
  promoStore.set(promo.code, promo);
  return promo;
}

export function getPromoCode(code: string): PromoCode | undefined {
  const promo = promoStore.get(code.toUpperCase().trim());
  if (!promo?.active) return undefined;
  return promo;
}

export function listPromoCodes(): PromoCode[] {
  return Array.from(promoStore.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function deletePromoCode(code: string): boolean { return promoStore.delete(code.toUpperCase().trim()); }

export function incrementPromoUse(code: string): void {
  const promo = promoStore.get(code.toUpperCase().trim());
  if (promo?.active) {
    promo.times_used += 1;
    if (promo.max_uses !== null && promo.times_used >= promo.max_uses) promo.active = false;
    promoStore.set(promo.code, promo);
  }
}

// --- Contact Messages ---

export function createMessage(input: Pick<ContactMessage, "name" | "email" | "message">): ContactMessage {
  const msg: ContactMessage = { id: newId("msg"), name: input.name, email: input.email, message: input.message, createdAt: Date.now(), read: false, replied: false };
  messageStore.set(msg.id, msg);
  return msg;
}

export function listMessages(): ContactMessage[] {
  return Array.from(messageStore.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function getMessage(id: string): ContactMessage | undefined { return messageStore.get(id); }

export function markMessageRead(id: string): void {
  const msg = messageStore.get(id);
  if (msg) { msg.read = true; messageStore.set(id, msg); }
}

export function markMessageReplied(id: string): void {
  const msg = messageStore.get(id);
  if (msg) { msg.read = true; msg.replied = true; messageStore.set(id, msg); }
}

export function getUnreadCount(): number {
  return Array.from(messageStore.values()).filter((m) => !m.read).length;
}

// --- Analytics ---

function dayKey(ts: number): string { return new Date(ts).toISOString().slice(0, 10); }

export function getAnalytics() {
  const subs = Array.from(store.values());
  const promos = Array.from(promoStore.values());

  const paidSubs = subs.filter((s) => s.paid);
  const totalRevenueCents = paidSubs.reduce((sum, s) => sum + (s.paidAmountCents ?? 0), 0);
  const totalForms = subs.length;
  const activePromos = promos.filter((p) => p.active).length;

  const thirtyDaysAgo = Date.now() - 30 * 86_400_000;
  const revenueIn30 = subs.filter((s) => s.paid && s.createdAt >= thirtyDaysAgo).reduce((sum, s) => sum + (s.paidAmountCents ?? 0), 0);
  const avgRevenuePerDayCents = Math.round(revenueIn30 / 30);

  const timeSeries: { date: string; forms: number; revenueCents: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const daySubs = subs.filter((s) => dayKey(s.createdAt) === key);
    timeSeries.push({ date: key, forms: daySubs.length, revenueCents: daySubs.filter((s) => s.paid).reduce((sum, s) => sum + (s.paidAmountCents ?? 0), 0) });
  }

  const conversion = { total: totalForms, paid: paidSubs.length };
  const topPromos = promos.filter((p) => p.times_used > 0).sort((a, b) => b.times_used - a.times_used).slice(0, 6).map((p) => ({ code: p.code, uses: p.times_used }));
  const recentTransactions = paidSubs.sort((a, b) => b.createdAt - a.createdAt).slice(0, 20).map((s) => ({
    id: s.id,
    date: new Date(s.createdAt).toISOString(),
    email: s.fields?.contact?.email ?? "—",
    amountCents: s.paidAmountCents ?? 0,
    promoCode: s.promoCode ?? null,
    paid: s.paid,
  }));

  return { summary: { totalRevenueCents, totalForms, avgRevenuePerDayCents, activePromos }, timeSeries, conversion, topPromos, recentTransactions, unreadMessages: getUnreadCount() };
}
