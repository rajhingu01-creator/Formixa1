import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://formixa.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Formixa — AI DS-160 Visa Form Assistant",
    template: "%s | Formixa",
  },
  description:
    "Formixa is an AI-powered DS-160 form assistant. Answer plain-English questions and get a correctly filled US visa application PDF in minutes. $25 one-time payment.",
  keywords: [
    "DS-160 form assistant",
    "how to fill DS-160",
    "US visa form helper",
    "DS-160 AI fill",
    "US visa application form",
    "fill DS-160 online",
    "DS-160 guide",
    "DS-160 help",
    "nonimmigrant visa application",
    "US visa form",
  ],
  authors: [{ name: "Formixa" }],
  creator: "Formixa",
  openGraph: {
    type: "website",
    siteName: "Formixa",
    title: "Formixa — AI DS-160 Visa Form Assistant",
    description:
      "Answer plain-English questions and get a correctly filled DS-160 US visa application PDF in minutes.",
    url: SITE_URL,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Formixa — DS-160 AI Form Assistant" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Formixa — AI DS-160 Visa Form Assistant",
    description:
      "Answer plain-English questions and get a correctly filled DS-160 US visa application PDF in minutes.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  other: {
    "ai-description":
      "Formixa is an AI-powered tool that fills the US DS-160 nonimmigrant visa application form from plain-English answers and generates a downloadable PDF reference document for $25.",
  },
};

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#3b5bdb" />
      <rect x="7" y="8" width="14" height="2" rx="1" fill="white" />
      <rect x="7" y="13" width="10" height="2" rx="1" fill="white" />
      <rect x="7" y="18" width="7" height="2" rx="1" fill="white" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-slate-100 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold text-slate-900" aria-label="Formixa home">
              <Logo />
              Formixa
            </Link>
            <nav className="flex items-center gap-5 text-sm text-slate-500" aria-label="Main navigation">
              <Link href="/apply" className="font-medium text-brand-600 hover:text-brand-700">Start application</Link>
              <Link href="/chat" className="hover:text-slate-700">AI Chat</Link>
              <Link href="/status" className="hover:text-slate-700">Case Status</Link>
              <Link href="/guides" className="hover:text-slate-700">Guides</Link>
              <Link href="/blog" className="hover:text-slate-700">Blog</Link>
              <Link href="/about" className="hover:text-slate-700">About</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-20 border-t border-slate-100 bg-slate-50 py-8 text-sm text-slate-400">
          <div className="mx-auto max-w-5xl px-6 flex flex-wrap items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <Logo />
              <span className="font-medium text-slate-500">Formixa</span>
            </span>
            <nav className="flex flex-wrap gap-4 text-xs" aria-label="Footer navigation">
              <Link href="/apply" className="hover:text-slate-600">Apply</Link>
              <Link href="/chat" className="hover:text-slate-600">AI Chat</Link>
              <Link href="/interview" className="hover:text-slate-600">Interview Coach</Link>
              <Link href="/status" className="hover:text-slate-600">Case Status</Link>
              <Link href="/timeline" className="hover:text-slate-600">Timeline</Link>
              <Link href="/checklist" className="hover:text-slate-600">Checklist</Link>
              <Link href="/docs" className="hover:text-slate-600">Doc Checker</Link>
              <Link href="/impact" className="hover:text-slate-600">Impact Checker</Link>
              <Link href="/guides" className="hover:text-slate-600">Guides</Link>
              <Link href="/payment-help" className="hover:text-slate-600">Payment Help</Link>
              <Link href="/about" className="hover:text-slate-600">About</Link>
              <Link href="/blog" className="hover:text-slate-600">Blog</Link>
            </nav>
            <span>Not affiliated with the US Department of State.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
