"use client";

import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";

export default function DocsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(f.type)) {
      setError("Please upload a JPEG, PNG, WebP image or PDF file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10 MB.");
      return;
    }
    setError("");
    setFile(f);
    setReport("");
  }

  async function analyseDocument() {
    if (!file) return;
    setLoading(true);
    setReport("");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/docs", { method: "POST", body: formData });
    const data = await res.json() as { report?: string; error?: string };
    setLoading(false);

    if (data.error) { setError(data.error); return; }
    if (data.report) setReport(data.report);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-4">
          <FileText size={14} />
          Document Checker
        </div>
        <h1 className="text-3xl font-bold text-slate-900">AI Immigration Document Checker</h1>
        <p className="mt-2 text-slate-500">
          Upload your passport, visa, or immigration document. AI scans for errors, expired dates, and mismatches.
        </p>
      </div>

      <div
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-white hover:border-slate-300"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        <Upload size={36} className="mx-auto mb-3 text-slate-300" />
        <p className="font-medium text-slate-700">Drag and drop your document here</p>
        <p className="text-sm text-slate-400 mt-1">or</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-3 rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Browse Files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <p className="mt-3 text-xs text-slate-400">Accepted: JPEG, PNG, WebP, PDF — max 10 MB</p>
      </div>

      {file && !error && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-brand-600" />
            <div>
              <p className="text-sm font-medium text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={analyseDocument}
              disabled={loading}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "Analysing…" : "Analyse Document"}
            </button>
            <button
              onClick={() => { setFile(null); setReport(""); }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 flex gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {report && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-green-500" />
            <h2 className="font-semibold text-slate-900">Document Analysis Report</h2>
          </div>
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{report}</div>
        </div>
      )}

      <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
        <strong>Privacy note:</strong> Your document is sent securely to the AI for analysis and is not stored on our servers. Do not upload documents with your full Social Security Number visible.
      </div>
    </div>
  );
}
