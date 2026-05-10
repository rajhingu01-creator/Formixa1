import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";
import { getSession, incrementQuestionCount, isUnlocked, FREE_QUESTION_LIMIT } from "@/lib/chat-store";
import { recordChatQuestion, recordNewSession } from "@/lib/chat-analytics-store";

const SYSTEM = `You are an expert US immigration attorney assistant. Answer immigration questions clearly, accurately, and concisely in plain English. Always recommend consulting a licensed immigration attorney for case-specific advice. Be helpful, professional, and empathetic.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { question?: string; sessionId?: string };
    const { question, sessionId } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const session = getSession(sessionId);
    const isNew = session.questionCount === 0;
    const unlocked = isUnlocked(sessionId);
    if (isNew) recordNewSession();

    if (!unlocked && session.questionCount >= FREE_QUESTION_LIMIT) {
      return NextResponse.json({ needsSubscription: true }, { status: 402 });
    }

    const count = incrementQuestionCount(sessionId);
    recordChatQuestion();

    let answer: string;
    try {
      answer = await generateText(`Immigration question: ${question.trim()}`, SYSTEM);
    } catch (aiErr: unknown) {
      const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
      if (msg.includes("GROQ_API_KEY") || msg.includes("GEMINI_API_KEY")) {
        return NextResponse.json(
          { error: "AI API key is not configured. Please add GROQ_API_KEY to your .env.local file." },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: `AI error: ${msg}` }, { status: 500 });
    }

    return NextResponse.json({
      answer,
      questionCount: count,
      freeLimit: FREE_QUESTION_LIMIT,
      subscribed: session.subscribed,
      promoUnlocked: session.promoUnlocked,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Chat API error:", msg);
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
