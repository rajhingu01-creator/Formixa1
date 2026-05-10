// Generates a print-ready DS-160 summary PDF from the Claude-normalized fields.
//
// The official DS-160 must be filed online at ceac.state.gov — it cannot be
// submitted as a static PDF. What we produce here is a clean, one-document
// summary the applicant can keep on their desk while filling in the official
// form, or hand to a third party (immigration lawyer, sponsor) for review.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Ds160Fields } from "./ds160";

type Row = { label: string; value: string };
type Section = { title: string; rows: Row[] };

function fmtBool(v: boolean | null | undefined): string {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "—";
}

function fmtStr(v: string | null | undefined): string {
  const s = (v ?? "").trim();
  return s.length ? s : "—";
}

function buildSections(f: Ds160Fields): Section[] {
  return [
    {
      title: "1. Personal information",
      rows: [
        { label: "Surname", value: fmtStr(f.personal.surname) },
        { label: "Given names", value: fmtStr(f.personal.given_names) },
        { label: "Full name", value: fmtStr(f.personal.full_name) },
        { label: "Other names used", value: fmtStr(f.personal.other_names) },
        { label: "Sex", value: fmtStr(f.personal.sex) },
        { label: "Marital status", value: fmtStr(f.personal.marital_status) },
        { label: "Date of birth", value: fmtStr(f.personal.dob) },
        { label: "Place of birth", value: `${fmtStr(f.personal.city_of_birth)}, ${fmtStr(f.personal.country_of_birth)}` },
        { label: "Nationality", value: fmtStr(f.personal.nationality) },
        { label: "National ID", value: fmtStr(f.personal.national_id) },
      ],
    },
    {
      title: "2. Passport",
      rows: [
        { label: "Passport number", value: fmtStr(f.passport.passport_number) },
        { label: "Passport book number", value: fmtStr(f.passport.passport_book_number) },
        { label: "Issuing country", value: fmtStr(f.passport.passport_country) },
        { label: "Place of issuance", value: `${fmtStr(f.passport.passport_issue_city)}, ${fmtStr(f.passport.passport_issue_country)}` },
        { label: "Issue date", value: fmtStr(f.passport.passport_issue_date) },
        { label: "Expiry date", value: fmtStr(f.passport.passport_expiry_date) },
        { label: "Lost or stolen passport history", value: fmtBool(f.passport.passport_lost) },
      ],
    },
    {
      title: "3. Address & contact",
      rows: [
        { label: "Home address", value: fmtStr(f.contact.home_address) },
        { label: "Phone", value: fmtStr(f.contact.phone) },
        { label: "Email", value: fmtStr(f.contact.email) },
        { label: "Social media (5 yrs)", value: fmtStr(f.contact.social_media) },
      ],
    },
    {
      title: "4. Travel",
      rows: [
        { label: "Purpose", value: fmtStr(f.travel.purpose_of_trip) },
        { label: "Details", value: fmtStr(f.travel.purpose_detail) },
        { label: "Intended arrival", value: fmtStr(f.travel.intended_arrival_date) },
        { label: "Length of stay", value: fmtStr(f.travel.length_of_stay) },
        { label: "Address in US", value: fmtStr(f.travel.us_address) },
        { label: "Trip funded by", value: fmtStr(f.travel.trip_funded_by) },
        { label: "Previous US visits", value: fmtBool(f.travel.previously_visited_us) },
        { label: "Previous visa / visit detail", value: fmtStr(f.travel.previous_visa) },
      ],
    },
    {
      title: "5. Travel companions",
      rows: [
        { label: "Traveling with others", value: fmtBool(f.companions.traveling_with_others) },
        { label: "Companions", value: fmtStr(f.companions.companions_detail) },
      ],
    },
    {
      title: "6. US point of contact",
      rows: [
        { label: "Name / org", value: fmtStr(f.us_contact.us_contact_name) },
        { label: "Relationship", value: fmtStr(f.us_contact.us_contact_relationship) },
        { label: "Address", value: fmtStr(f.us_contact.us_contact_address) },
        { label: "Phone", value: fmtStr(f.us_contact.us_contact_phone) },
        { label: "Email", value: fmtStr(f.us_contact.us_contact_email) },
      ],
    },
    {
      title: "7. Family",
      rows: [
        { label: "Father — name", value: fmtStr(f.family.father_name) },
        { label: "Father — DOB", value: fmtStr(f.family.father_dob) },
        { label: "Father in US?", value: fmtBool(f.family.father_in_us) },
        { label: "Mother — name", value: fmtStr(f.family.mother_name) },
        { label: "Mother — DOB", value: fmtStr(f.family.mother_dob) },
        { label: "Mother in US?", value: fmtBool(f.family.mother_in_us) },
        { label: "Spouse — name", value: fmtStr(f.family.spouse_name) },
        { label: "Spouse — DOB", value: fmtStr(f.family.spouse_dob) },
        { label: "Spouse — nationality", value: fmtStr(f.family.spouse_nationality) },
      ],
    },
    {
      title: "8. Work & education",
      rows: [
        { label: "Occupation", value: fmtStr(f.work_education.occupation) },
        { label: "Employer / school", value: fmtStr(f.work_education.employer_name) },
        { label: "Employer / school address", value: fmtStr(f.work_education.employer_address) },
        { label: "Monthly income", value: fmtStr(f.work_education.monthly_income) },
        { label: "Duties / studies", value: fmtStr(f.work_education.duties) },
        { label: "Previous employer", value: fmtStr(f.work_education.previous_employer) },
        { label: "Education history", value: fmtStr(f.work_education.education_history) },
      ],
    },
    {
      title: "9. Security & background",
      rows: [
        { label: "Communicable disease", value: fmtBool(f.security.communicable_disease) },
        { label: "Criminal history", value: fmtBool(f.security.criminal_history) },
        { label: "Drug-law violations", value: fmtBool(f.security.drug_use) },
        { label: "Terrorist activity", value: fmtBool(f.security.terrorist_activity) },
        { label: "Prior US visa denied", value: fmtBool(f.security.previous_visa_refused) },
        { label: "Explanation", value: fmtStr(f.security.security_explanation) },
      ],
    },
  ];
}

// Word-wraps text into lines that fit within `maxWidth`, measuring with the
// supplied font + size. pdf-lib doesn't ship a layout helper.
function wrap(font: import("pdf-lib").PDFFont, size: number, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n/)) {
    if (paragraph.length === 0) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      const w = font.widthOfTextAtSize(candidate, size);
      if (w > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export async function buildPdf(fields: Ds160Fields): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 612;
  const pageHeight = 792;
  const marginX = 54;
  const marginY = 60;
  const contentWidth = pageWidth - marginX * 2;
  const labelColWidth = 170;
  const valueColWidth = contentWidth - labelColWidth - 12;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - marginY;

  const drawHeader = () => {
    page.drawText("Formixa — DS-160 application summary", {
      x: marginX,
      y,
      size: 18,
      font: helvBold,
      color: rgb(0.1, 0.13, 0.32),
    });
    y -= 24;
    page.drawText(
      "Generated for your records. Use this to fill out the official DS-160 at ceac.state.gov.",
      { x: marginX, y, size: 9, font: helv, color: rgb(0.4, 0.4, 0.45) },
    );
    y -= 24;
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < marginY) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - marginY;
    }
  };

  drawHeader();

  for (const section of buildSections(fields)) {
    ensureSpace(40);
    page.drawText(section.title, {
      x: marginX,
      y,
      size: 13,
      font: helvBold,
      color: rgb(0.17, 0.34, 0.74),
    });
    y -= 6;
    page.drawLine({
      start: { x: marginX, y: y - 2 },
      end: { x: marginX + contentWidth, y: y - 2 },
      thickness: 0.5,
      color: rgb(0.78, 0.82, 0.9),
    });
    y -= 14;

    for (const row of section.rows) {
      const valueLines = wrap(helv, 10, row.value, valueColWidth);
      const blockHeight = Math.max(valueLines.length, 1) * 13 + 4;
      ensureSpace(blockHeight + 6);

      page.drawText(row.label, {
        x: marginX,
        y,
        size: 10,
        font: helvBold,
        color: rgb(0.25, 0.27, 0.32),
      });

      let lineY = y;
      for (const ln of valueLines) {
        page.drawText(ln, {
          x: marginX + labelColWidth,
          y: lineY,
          size: 10,
          font: helv,
          color: rgb(0.1, 0.12, 0.18),
        });
        lineY -= 13;
      }

      y = Math.min(y - 13, lineY);
      y -= 4;
    }

    y -= 10;
  }

  if (fields.warnings && fields.warnings.length > 0) {
    ensureSpace(40);
    page.drawText("Warnings — review these before filing", {
      x: marginX,
      y,
      size: 13,
      font: helvBold,
      color: rgb(0.7, 0.25, 0.1),
    });
    y -= 18;
    for (const w of fields.warnings) {
      const lines = wrap(helv, 10, `• ${w}`, contentWidth);
      const blockHeight = lines.length * 13 + 2;
      ensureSpace(blockHeight);
      for (const ln of lines) {
        page.drawText(ln, { x: marginX, y, size: 10, font: helv, color: rgb(0.55, 0.2, 0.08) });
        y -= 13;
      }
      y -= 4;
    }
  }

  ensureSpace(30);
  y -= 10;
  page.drawText(`Generated by Formixa on ${new Date().toISOString().slice(0, 10)}`, {
    x: marginX,
    y,
    size: 8,
    font: helv,
    color: rgb(0.55, 0.55, 0.6),
  });

  return await pdf.save();
}
