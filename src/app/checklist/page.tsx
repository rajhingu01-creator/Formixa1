"use client";

import { useState } from "react";
import { CheckSquare, Download, AlertCircle } from "lucide-react";

interface ChecklistItem {
  item: string;
  required: boolean;
  notes: string | null;
}

interface ChecklistSection {
  category: string;
  items: ChecklistItem[];
}

interface Checklist {
  title: string;
  sections: ChecklistSection[];
  warnings: string[];
  tips: string[];
}

const VISA_TYPES = ["B1/B2 Tourist/Business", "F1 Student", "H1B Work", "J1 Exchange", "UK Visit Visa", "Canada PR (Express Entry)", "Schengen Visa", "Australia Tourist", "Dubai Visit Visa"];

async function downloadPdf(checklist: Checklist, visaType: string) {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const addPage = () => {
    const page = doc.addPage([595, 842]); // A4
    return { page, y: 800 };
  };

  let { page, y } = addPage();
  const margin = 50;
  const width = 595 - margin * 2;

  const draw = (text: string, x: number, yPos: number, size: number, f = font, color = rgb(0.1, 0.1, 0.1)) => {
    page.drawText(text, { x, y: yPos, size, font: f, color });
  };

  draw(checklist.title, margin, y, 16, boldFont, rgb(0.23, 0.36, 0.86));
  y -= 30;
  draw(`Visa: ${visaType}  |  Generated: ${new Date().toLocaleDateString()}`, margin, y, 9, font, rgb(0.5, 0.5, 0.5));
  y -= 30;

  for (const section of checklist.sections) {
    if (y < 100) { ({ page, y } = addPage()); }
    draw(section.category, margin, y, 12, boldFont, rgb(0.23, 0.36, 0.86));
    y -= 20;

    for (const item of section.items) {
      if (y < 80) { ({ page, y } = addPage()); }
      const checkbox = item.required ? "☑" : "☐";
      const label = `${checkbox} ${item.item}${item.required ? " *" : ""}`;
      draw(label, margin, y, 10);
      y -= 16;
      if (item.notes) {
        draw(`   ${item.notes}`, margin, y, 8, font, rgb(0.5, 0.5, 0.5));
        y -= 14;
      }
    }
    y -= 10;
  }

  if (checklist.warnings.length) {
    if (y < 100) { ({ page, y } = addPage()); }
    draw("Warnings", margin, y, 12, boldFont, rgb(0.8, 0.4, 0.0));
    y -= 20;
    for (const w of checklist.warnings) {
      if (y < 60) { ({ page, y } = addPage()); }
      draw(`! ${w}`, margin, y, 10, font, rgb(0.7, 0.3, 0.0));
      y -= 16;
    }
  }

  const bytes = await doc.save();
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `formixa-checklist-${visaType.replace(/\W+/g, "-").toLowerCase()}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ChecklistPage() {
  const [visaType, setVisaType] = useState("");
  const [nationality, setNationality] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  async function generate() {
    if (!visaType || !nationality || !destination) return;
    setLoading(true);
    setChecklist(null);
    setError("");

    const res = await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visaType, nationality, destination, travelDate }),
    });

    const data = await res.json() as { checklist?: Checklist; error?: string };
    setLoading(false);
    if (data.error) { setError(data.error); return; }
    if (data.checklist) setChecklist(data.checklist);
  }

  async function handleDownload() {
    if (!checklist) return;
    setDownloading(true);
    await downloadPdf(checklist, visaType);
    setDownloading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 mb-4">
          <CheckSquare size={14} />
          Pre-Travel Checklist
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Your Personalised Document Checklist</h1>
        <p className="mt-2 text-slate-500">AI generates a tailored checklist based on your visa type, nationality, and destination.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Visa Type</label>
            <select
              value={visaType}
              onChange={(e) => setVisaType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Select…</option>
              {VISA_TYPES.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Your Nationality</label>
            <input
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="e.g. Indian, Nigerian, Brazilian"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Destination Country</label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. United States, UK, Canada"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Travel Date (optional)</label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <button
          onClick={generate}
          disabled={!visaType || !nationality || !destination || loading}
          className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate Checklist"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 flex gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {checklist && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">{checklist.title}</h2>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-60"
            >
              <Download size={14} />
              {downloading ? "Generating PDF…" : "Download PDF"}
            </button>
          </div>

          {checklist.warnings.length > 0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Warnings</p>
              <ul className="space-y-1">
                {checklist.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-amber-800 flex gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-500" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {checklist.sections.map((section, si) => (
            <div key={si} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3">{section.category}</h3>
              <ul className="space-y-2">
                {section.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-3">
                    <CheckSquare size={16} className={`shrink-0 mt-0.5 ${item.required ? "text-brand-600" : "text-slate-300"}`} />
                    <div>
                      <span className={`text-sm ${item.required ? "font-medium text-slate-800" : "text-slate-600"}`}>
                        {item.item}
                        {item.required && <span className="ml-1 text-xs text-brand-500 font-normal">Required</span>}
                      </span>
                      {item.notes && <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {checklist.tips.length > 0 && (
            <div className="rounded-xl bg-green-50 border border-green-100 p-4">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Tips</p>
              <ul className="space-y-1 list-disc list-inside">
                {checklist.tips.map((t, i) => <li key={i} className="text-sm text-green-800">{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
