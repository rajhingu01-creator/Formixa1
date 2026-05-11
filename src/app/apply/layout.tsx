import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://formixa.com";

export const metadata: Metadata = {
  title: "Start Your DS-160 Application — Formixa",
  description:
    "Answer plain-English questions and get your DS-160 US visa application filled correctly by AI. Download a print-ready PDF reference for $25. No account needed.",
  alternates: { canonical: `${SITE_URL}/apply` },
  robots: { index: false },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
