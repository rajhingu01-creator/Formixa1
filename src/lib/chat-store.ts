export interface ChatSession {
  id: string;
  questionCount: number;
  subscribed: boolean;
  promoUnlocked: boolean;
  promoCode?: string;
  promoDiscountPercent?: number;
  subscriptionId?: string;
  createdAt: Date;
}

const sessions = new Map<string, ChatSession>();

export function getSession(id: string): ChatSession {
  if (!sessions.has(id)) {
    sessions.set(id, {
      id,
      questionCount: 0,
      subscribed: false,
      promoUnlocked: false,
      createdAt: new Date(),
    });
  }
  return sessions.get(id)!;
}

export function incrementQuestionCount(id: string): number {
  const s = getSession(id);
  s.questionCount++;
  return s.questionCount;
}

export function activateSubscription(sessionId: string, subscriptionId: string): void {
  const s = getSession(sessionId);
  s.subscribed = true;
  s.subscriptionId = subscriptionId;
}

export function applyPromoToSession(sessionId: string, code: string, discountPercent?: number): void {
  const s = getSession(sessionId);
  s.promoCode = code.toUpperCase();
  if (discountPercent !== undefined && discountPercent < 100) {
    // Percent discount — user still needs to pay but at reduced price
    s.promoDiscountPercent = discountPercent;
  } else {
    // Full discount — unlock immediately
    s.promoUnlocked = true;
    s.promoDiscountPercent = 100;
  }
}

export function getSessionDiscount(sessionId: string): number | undefined {
  return sessions.get(sessionId)?.promoDiscountPercent;
}

export function isUnlocked(sessionId: string): boolean {
  const s = getSession(sessionId);
  return s.subscribed || s.promoUnlocked;
}

export const FREE_QUESTION_LIMIT = 3;
