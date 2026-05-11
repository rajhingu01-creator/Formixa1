# Formixa

AI-powered immigration form assistant. Users answer plain-English questions and Formixa uses Claude to map their answers into a correctly-filled DS-160 US visa application. They pay $25 via Stripe to download the completed PDF summary.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Claude API** (`claude-opus-4-7` with adaptive thinking + structured outputs + prompt caching)
- **Stripe Checkout** for one-time payment
- **pdf-lib** for PDF generation

> Formixa generates a clean, print-ready DS-160 application summary. The official DS-160 must still be filed online at [ceac.state.gov](https://ceac.state.gov) — there is no official PDF submission path.

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Var | What it is |
|---|---|
| `ANTHROPIC_API_KEY` | API key from console.anthropic.com |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode is fine) |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen --forward-to localhost:3000/api/webhook` |
| `NEXT_PUBLIC_STRIPE_PRICE_USD_CENTS` | Price in cents — defaults to `2500` ($25) |
| `NEXT_PUBLIC_SITE_URL` | Public origin used for Stripe redirects |

In local dev without the Stripe CLI running, the success page falls back to checking the Checkout session directly with Stripe before serving the PDF.

## Project layout

```
src/
├── app/
│   ├── api/
│   │   ├── submissions/   # POST plain-English answers, get a normalized DS-160 back from Claude
│   │   ├── checkout/      # POST submissionId, get a Stripe Checkout URL
│   │   ├── webhook/       # Stripe webhook → marks submission paid
│   │   └── download/      # GET PDF (gated on payment)
│   ├── apply/             # Multi-step wizard
│   ├── success/           # Post-payment download page
│   ├── layout.tsx
│   ├── page.tsx           # Landing page
│   └── globals.css
└── lib/
    ├── ds160.ts           # Question schema + DS-160 field types
    ├── claude.ts          # Claude API integration
    ├── stripe.ts          # Stripe client + price helpers
    ├── pdf.ts             # pdf-lib PDF generator
    └── store.ts           # In-memory submission store (replace with DB for prod)
```

## Production notes

- Replace `src/lib/store.ts` with a real database (Postgres, KV, etc). The in-memory store resets on every server restart.
- The Claude prompt caches the system prompt and question reference, so subsequent applicants hit the cache (~0.1× cost on the prefix).
- Stripe checkout runs in test mode by default. Switch to live keys to take real money.
- The PDF is a *summary* — the official DS-160 must still be filed online.
