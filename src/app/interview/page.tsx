"use client";

import { useState } from "react";
import { Mic, ChevronRight, Star, AlertTriangle, CheckCircle } from "lucide-react";

type Step = "setup" | "interview" | "evaluation";
type HistoryEntry = { role: "officer" | "applicant"; text: string };

const VISA_TYPES = ["B1/B2 Tourist/Business", "F1 Student", "H1B Work", "J1 Exchange", "L1 Intracompany", "O1 Extraordinary Ability", "K1 Fiancé"];

export default function InterviewPage() {
  const [step, setStep] = useState<Step>("setup");
  const [visaType, setVisaType] = useState("B1/B2 Tourist/Business");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState("");
  const [questionNum, setQuestionNum] = useState(0);
  const MAX_QUESTIONS = 8;

  async function startInterview() {
    setLoading(true);
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", visaType }),
    });
    const data = await res.json() as { question: string };
    setCurrentQuestion(data.question);
    setHistory([{ role: "officer", text: data.question }]);
    setQuestionNum(1);
    setStep("interview");
    setLoading(false);
  }

  async function submitAnswer() {
    if (!answer.trim()) return;
    const myAnswer = answer.trim();
    setAnswer("");
    setLoading(true);

    const updatedHistory: HistoryEntry[] = [...history, { role: "applicant", text: myAnswer }];

    if (questionNum >= MAX_QUESTIONS) {
      // Move to evaluation
      setHistory(updatedHistory);
      await evaluate(updatedHistory);
      return;
    }

    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "answer", visaType, history: updatedHistory, answer: myAnswer }),
    });
    const data = await res.json() as { question: string };
    const nextHistory: HistoryEntry[] = [...updatedHistory, { role: "officer", text: data.question }];
    setHistory(nextHistory);
    setCurrentQuestion(data.question);
    setQuestionNum((n) => n + 1);
    setLoading(false);
  }

  async function evaluate(h: HistoryEntry[]) {
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "evaluate", history: h }),
    });
    const data = await res.json() as { evaluation: string };
    setEvaluation(data.evaluation);
    setStep("evaluation");
    setLoading(false);
  }

  function restart() {
    setStep("setup");
    setHistory([]);
    setCurrentQuestion("");
    setAnswer("");
    setEvaluation("");
    setQuestionNum(0);
  }

  if (step === "setup") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-700 mb-4">
          <Mic size={14} />
          Visa Interview Coach
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Simulate Your US Visa Interview</h1>
        <p className="mt-3 text-slate-500 max-w-lg mx-auto">
          Practice with an AI consular officer. Get your answers evaluated, risky responses flagged, and a confidence score at the end.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Visa Type</label>
          <select
            value={visaType}
            onChange={(e) => setVisaType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {VISA_TYPES.map((v) => <option key={v}>{v}</option>)}
          </select>

          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <strong>How it works:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside text-slate-500">
              <li>AI officer asks up to {MAX_QUESTIONS} consular-style questions</li>
              <li>Type your answer as you would speak in an actual interview</li>
              <li>After the session, get a detailed evaluation with a confidence score</li>
            </ul>
          </div>

          <button
            onClick={startInterview}
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? "Starting…" : <><span>Start Interview</span><ChevronRight size={16} /></>}
          </button>
        </div>
      </div>
    );
  }

  if (step === "interview") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-900">Visa Interview — {visaType}</h1>
          <span className="text-sm text-slate-400">Question {questionNum}/{MAX_QUESTIONS}</span>
        </div>

        <div className="space-y-3 mb-6">
          {history.map((h, i) => (
            <div key={i} className={`flex ${h.role === "officer" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                h.role === "officer"
                  ? "bg-slate-100 text-slate-800 rounded-bl-sm"
                  : "bg-brand-600 text-white rounded-br-sm"
              }`}>
                {h.role === "officer" && <span className="block text-xs font-semibold text-slate-500 mb-1">Consular Officer</span>}
                {h.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl px-4 py-3">
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), submitAnswer())}
            rows={3}
            placeholder="Type your answer…"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 resize-none"
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={submitAnswer}
              disabled={!answer.trim() || loading}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
            >
              {questionNum >= MAX_QUESTIONS ? "Finish" : "Answer"}
            </button>
            <button
              onClick={() => evaluate(history)}
              disabled={loading || history.length < 3}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              End & Evaluate
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Evaluation
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700 mb-3">
          <Star size={14} />
          Interview Complete
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Interview Evaluation</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle size={20} className="text-green-500 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-500">Evaluation based on {history.filter(h => h.role === "applicant").length} answers</p>
        </div>
        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{evaluation}</div>
      </div>

      <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-4 flex gap-3 text-sm text-amber-800">
        <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-500" />
        This simulation is for practice only. Actual interview outcomes depend on many factors. Consult an immigration attorney for personalised advice.
      </div>

      <button
        onClick={restart}
        className="mt-6 w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Practice Again
      </button>
    </div>
  );
}
