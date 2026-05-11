export interface ChatSubscriptionRecord {
  id: string;
  sessionId: string;
  subscriptionId: string;
  activatedAt: Date;
  revenueAmountCents: number; // $9.99 = 999
}

declare global {
  // eslint-disable-next-line no-var
  var __formixaChatSubs: Map<string, ChatSubscriptionRecord> | undefined;
  // eslint-disable-next-line no-var
  var __formixaChatQuestionsTotal: number | undefined;
  // eslint-disable-next-line no-var
  var __formixaChatPromoUnlocks: number | undefined;
  // eslint-disable-next-line no-var
  var __formixaChatSessions: number | undefined;
}

const subStore: Map<string, ChatSubscriptionRecord> =
  globalThis.__formixaChatSubs ?? (globalThis.__formixaChatSubs = new Map());

if (globalThis.__formixaChatQuestionsTotal === undefined) globalThis.__formixaChatQuestionsTotal = 0;
if (globalThis.__formixaChatPromoUnlocks === undefined) globalThis.__formixaChatPromoUnlocks = 0;
if (globalThis.__formixaChatSessions === undefined) globalThis.__formixaChatSessions = 0;

export const CHAT_SUB_PRICE_CENTS = 999; // $9.99/month

export function recordChatSubscription(sessionId: string, subscriptionId: string): void {
  const id = `csub_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  subStore.set(id, {
    id,
    sessionId,
    subscriptionId,
    activatedAt: new Date(),
    revenueAmountCents: CHAT_SUB_PRICE_CENTS,
  });
}

export function recordChatQuestion(): void {
  globalThis.__formixaChatQuestionsTotal! += 1;
}

export function recordPromoUnlock(): void {
  globalThis.__formixaChatPromoUnlocks! += 1;
}

export function recordNewSession(): void {
  globalThis.__formixaChatSessions! += 1;
}

export function getChatAnalytics() {
  const subs = Array.from(subStore.values());
  const totalChatRevenueCents = subs.reduce((s, r) => s + r.revenueAmountCents, 0);

  return {
    totalSubscriptions: subs.length,
    totalChatRevenueCents,
    totalQuestionsAsked: globalThis.__formixaChatQuestionsTotal ?? 0,
    totalPromoUnlocks: globalThis.__formixaChatPromoUnlocks ?? 0,
    totalChatSessions: globalThis.__formixaChatSessions ?? 0,
    recentSubscriptions: subs
      .sort((a, b) => b.activatedAt.getTime() - a.activatedAt.getTime())
      .slice(0, 20)
      .map((s) => ({
        id: s.id,
        activatedAt: s.activatedAt.toISOString(),
        revenueAmountCents: s.revenueAmountCents,
      })),
  };
}
