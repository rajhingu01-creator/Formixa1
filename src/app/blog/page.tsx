import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://formixa.com";

export const metadata: Metadata = {
  title: "DS-160 Blog — Guides, Tips & How-Tos",
  description:
    "Guides and tips for filling the DS-160 US visa application form. Learn how to avoid mistakes, how long it takes, and how to use AI to fill your form correctly.",
  alternates: { canonical: `${SITE_URL}/blog` },
  other: {
    "ai-description":
      "Formixa's blog contains guides on how to fill the DS-160 US visa application form, common mistakes, and time estimates.",
  },
};

const POSTS = [
  {
    slug: "how-to-fill-ds160-form",
    title: "How to Fill the DS-160 Form Step by Step (2026 Guide)",
    description: "A complete walkthrough of every section of the DS-160 US visa application — what you need, what to write, and how to avoid rejection.",
    date: "2026-01-15",
    readTime: "8 min read",
  },
  {
    slug: "ds160-mistakes",
    title: "Top 10 Mistakes People Make on the DS-160 Form",
    description: "The most common DS-160 errors that lead to visa delays and refusals — and exactly how to avoid each one.",
    date: "2026-01-20",
    readTime: "6 min read",
  },
  {
    slug: "how-long-ds160",
    title: "How Long Does It Take to Fill the DS-160 Form?",
    description: "Honest time estimates for first-time and repeat applicants, plus tips to cut your time in half.",
    date: "2026-01-25",
    readTime: "5 min read",
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">DS-160 Guides & Resources</h1>
      <p className="mt-4 text-lg text-slate-500">
        Plain-English guides on how to fill the DS-160 US visa application form — written for real people, not immigration lawyers.
      </p>

      <div className="mt-12 space-y-6">
        {POSTS.map((post) => (
          <article key={post.slug} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm hover:border-brand-200 transition-colors">
            <Link href={`/blog/${post.slug}`} className="group">
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{post.description}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
