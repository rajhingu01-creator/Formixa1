"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

interface ProcessingEntry {
  min: number;
  max: number;
  unit: "months" | "weeks";
}

type ServiceCenter = keyof typeof PROCESSING_TIMES[string];

const PROCESSING_TIMES: Record<string, Record<string, ProcessingEntry>> = {
  "I-130 (Spouse of USC)": {
    "Vermont Service Center": { min: 12, max: 18, unit: "months" },
    "National Benefits Center": { min: 10, max: 15, unit: "months" },
    "Texas Service Center": { min: 11, max: 17, unit: "months" },
    "California Service Center": { min: 13, max: 20, unit: "months" },
  },
  "I-485 (Adjustment of Status)": {
    "Chicago Lockbox": { min: 15, max: 24, unit: "months" },
    "National Benefits Center": { min: 14, max: 22, unit: "months" },
    "Dallas Lockbox": { min: 16, max: 25, unit: "months" },
  },
  "I-765 (Employment Authorization)": {
    "Vermont Service Center": { min: 3, max: 5, unit: "months" },
    "Nebraska Service Center": { min: 3, max: 6, unit: "months" },
    "Texas Service Center": { min: 4, max: 7, unit: "months" },
  },
  "I-140 (Immigrant Petition)": {
    "Nebraska Service Center": { min: 6, max: 12, unit: "months" },
    "Texas Service Center": { min: 7, max: 14, unit: "months" },
    "Premium Processing": { min: 2, max: 3, unit: "weeks" },
  },
  "I-539 (Extension of Status)": {
    "Vermont Service Center": { min: 12, max: 18, unit: "months" },
    "Nebraska Service Center": { min: 10, max: 16, unit: "months" },
  },
  "N-400 (Naturalization)": {
    "Atlanta Field Office": { min: 10, max: 14, unit: "months" },
    "Boston Field Office": { min: 8, max: 12, unit: "months" },
    "Chicago Field Office": { min: 12, max: 18, unit: "months" },
    "Los Angeles Field Office": { min: 14, max: 22, unit: "months" },
    "New York Field Office": { min: 15, max: 24, unit: "months" },
  },
  "I-129 (H1B Petition)": {
    "Vermont Service Center": { min: 3, max: 5, unit: "months" },
    "California Service Center": { min: 3, max: 6, unit: "months" },
    "Premium Processing": { min: 2, max: 3, unit: "weeks" },
  },
  "DS-160 / Visa Interview (B1/B2)": {
    "Any US Embassy (average)": { min: 1, max: 6, unit: "months" },
    "High-demand embassy": { min: 3, max: 12, unit: "months" },
  },
};

function addMonthsToDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function addWeeksToDate(weeks: number): string {
  const d = new Date();
  d.setDate(d.getDate() + weeks * 7);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function TimelinePage() {
  const [formType, setFormType] = useState("");
  const [serviceCenter, setServiceCenter] = useState("");
  const [filingDate, setFilingDate] = useState(new Date().toISOString().split("T")[0]);

  const formTypes = Object.keys(PROCESSING_TIMES);
  const serviceCenters = formType ? Object.keys(PROCESSING_TIMES[formType]) : [];
  const entry = formType && serviceCenter ? PROCESSING_TIMES[formType][serviceCenter] : null;

  function calcDates(e: ProcessingEntry) {
    const filingMs = new Date(filingDate).getTime();
    const today = Date.now();
    const elapsed = Math.floor((today - filingMs) / (1000 * 60 * 60 * 24));

    if (e.unit === "months") {
      const minDays = e.min * 30 - elapsed;
      const maxDays = e.max * 30 - elapsed;
      const minDate = new Date(today + Math.max(0, minDays) * 86400000);
      const maxDate = new Date(today + Math.max(0, maxDays) * 86400000);
      return {
        range: `${e.min}–${e.max} months`,
        earliest: minDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        latest: maxDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        elapsed: `${Math.floor(elapsed / 30)} months elapsed since filing`,
      };
    } else {
      const minDays = e.min * 7 - elapsed;
      const maxDays = e.max * 7 - elapsed;
      const minDate = new Date(today + Math.max(0, minDays) * 86400000);
      const maxDate = new Date(today + Math.max(0, maxDays) * 86400000);
      return {
        range: `${e.min}–${e.max} weeks`,
        earliest: minDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        latest: maxDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        elapsed: `${elapsed} days elapsed since filing`,
      };
    }
  }

  const dates = entry ? calcDates(entry) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700 mb-4">
          <Clock size={14} />
          Processing Time Estimator
        </div>
        <h1 className="text-3xl font-bold text-slate-900">USCIS Processing Time Estimator</h1>
        <p className="mt-2 text-slate-500">
          Select your form type and service center to estimate when your case may be completed.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Form / Visa Type</label>
          <select
            value={formType}
            onChange={(e) => { setFormType(e.target.value); setServiceCenter(""); }}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="">Select a form…</option>
            {formTypes.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>

        {formType && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Service Center / Location</label>
            <select
              value={serviceCenter}
              onChange={(e) => setServiceCenter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Select a service center…</option>
              {serviceCenters.map((sc) => <option key={sc}>{sc}</option>)}
            </select>
          </div>
        )}

        {formType && serviceCenter && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Filing Date</label>
            <input
              type="date"
              value={filingDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFilingDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        )}
      </div>

      {dates && entry && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
            <h2 className="font-semibold text-brand-900 mb-4">Estimated Processing Window</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-500 mb-1">Total Range</p>
                <p className="font-semibold text-slate-800">{dates.range}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Earliest Completion</p>
                <p className="font-semibold text-slate-800">{dates.earliest}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Latest Completion</p>
                <p className="font-semibold text-slate-800">{dates.latest}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-center text-slate-500">{dates.elapsed}</p>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
            <strong>Note:</strong> These estimates are based on USCIS published processing times and may not reflect real-time changes. Check{" "}
            <a href="https://egov.uscis.gov/processing-times/" target="_blank" rel="noreferrer" className="text-brand-600 underline">
              egov.uscis.gov/processing-times
            </a>{" "}
            for the latest official data.
          </div>
        </div>
      )}
    </div>
  );
}
