"use client";

import { useState } from "react";
import { CreditCard, ChevronRight, ChevronLeft, CheckCircle, ExternalLink } from "lucide-react";

interface Step {
  id: string;
  question: string;
  options: { label: string; next: string }[];
}

interface Resolution {
  title: string;
  steps: string[];
  wiseNote?: boolean;
}

const FLOW: Record<string, Step> = {
  start: {
    id: "start",
    question: "What payment issue are you experiencing?",
    options: [
      { label: "My card was declined", next: "card_declined" },
      { label: "PayPal payment failed", next: "paypal_failed" },
      { label: "The payment page isn't loading", next: "page_not_loading" },
      { label: "I was charged but didn't receive access", next: "charged_no_access" },
    ],
  },
  card_declined: {
    id: "card_declined",
    question: "What type of card are you using?",
    options: [
      { label: "Debit card", next: "card_debit" },
      { label: "Credit card", next: "card_credit" },
      { label: "Prepaid card", next: "card_prepaid" },
      { label: "Virtual card (e.g. Wise)", next: "card_virtual" },
    ],
  },
  card_debit: {
    id: "card_debit",
    question: "Have you enabled online or international payments?",
    options: [
      { label: "Not sure / No", next: "resolve_debit_enable" },
      { label: "Yes, it's enabled", next: "resolve_debit_contact" },
    ],
  },
  card_credit: {
    id: "card_credit",
    question: "Is this an international transaction?",
    options: [
      { label: "Yes (card is from another country)", next: "resolve_credit_intl" },
      { label: "No (same country)", next: "resolve_credit_limit" },
    ],
  },
  card_prepaid: {
    id: "card_prepaid",
    question: "Does your prepaid card support online payments?",
    options: [
      { label: "I'm not sure", next: "resolve_prepaid" },
      { label: "I believe so", next: "resolve_try_paypal" },
    ],
  },
  card_virtual: {
    id: "card_virtual",
    question: "Is your virtual card balance sufficient?",
    options: [
      { label: "Yes, it has funds", next: "resolve_virtual_settings" },
      { label: "Not sure / No", next: "resolve_virtual_topup" },
    ],
  },
  paypal_failed: {
    id: "paypal_failed",
    question: "What happened when you tried PayPal?",
    options: [
      { label: "Error on PayPal checkout page", next: "resolve_paypal_error" },
      { label: "PayPal declined the payment", next: "resolve_paypal_decline" },
      { label: "Page closed / timeout", next: "resolve_paypal_timeout" },
    ],
  },
  page_not_loading: {
    id: "page_not_loading",
    question: "What do you see when the payment page doesn't load?",
    options: [
      { label: "Blank page or spinning loader", next: "resolve_blank" },
      { label: "Error message", next: "resolve_error_msg" },
      { label: "PayPal popup doesn't appear", next: "resolve_popup_blocked" },
    ],
  },
  charged_no_access: {
    id: "charged_no_access",
    question: "Did you receive a PayPal confirmation email?",
    options: [
      { label: "Yes, PayPal confirmed the charge", next: "resolve_contact_support" },
      { label: "No email received", next: "resolve_pending_charge" },
    ],
  },
};

const RESOLUTIONS: Record<string, Resolution> = {
  resolve_debit_enable: {
    title: "Enable online & international payments",
    steps: [
      "Log in to your bank app or website",
      "Go to Card Settings or Security",
      "Enable 'Online Payments' or 'International Transactions'",
      "Some banks require a call — contact your bank's support line",
      "Try the payment again after enabling",
    ],
    wiseNote: true,
  },
  resolve_debit_contact: {
    title: "Contact your bank",
    steps: [
      "Your bank may be blocking the transaction as a security measure",
      "Call the number on the back of your card",
      "Tell them you are trying to make an online payment to PayPal",
      "Ask them to whitelist or approve the transaction",
      "Alternatively, use a Wise virtual card (see below)",
    ],
    wiseNote: true,
  },
  resolve_credit_intl: {
    title: "Enable international transactions on your credit card",
    steps: [
      "Log in to your card issuer's app or portal",
      "Enable 'International Transactions' or 'Cross-border Payments'",
      "If you can't find the setting, call your card issuer",
      "PayPal processes payments in USD — make sure USD transactions are enabled",
      "Try again after enabling",
    ],
    wiseNote: true,
  },
  resolve_credit_limit: {
    title: "Check your credit limit and card settings",
    steps: [
      "Verify you have sufficient credit available",
      "Check if your card has online transaction limits",
      "Confirm your billing address matches exactly what PayPal has on file",
      "Try a different browser or incognito mode",
    ],
  },
  resolve_prepaid: {
    title: "Prepaid card limitations",
    steps: [
      "Many prepaid cards do not support recurring or online merchant payments",
      "Check the card documentation for 'online payment' support",
      "If not supported, use your bank debit card or a Wise virtual card instead",
      "PayPal also allows you to pay directly from a bank account",
    ],
    wiseNote: true,
  },
  resolve_try_paypal: {
    title: "Try PayPal with your prepaid card",
    steps: [
      "Add the prepaid card directly to your PayPal account wallet",
      "Go to PayPal.com → Wallet → Link a card",
      "PayPal will charge and refund $1 to verify the card",
      "Once verified, retry the payment through PayPal",
    ],
  },
  resolve_virtual_settings: {
    title: "Check Wise virtual card settings",
    steps: [
      "Open the Wise app and go to your card settings",
      "Enable 'Online payments' if it is toggled off",
      "Make sure the card currency matches USD or the card allows currency conversion",
      "Check if you need to 'freeze/unfreeze' the card",
    ],
  },
  resolve_virtual_topup: {
    title: "Top up your Wise virtual card",
    steps: [
      "Open the Wise app → your USD balance",
      "Add funds by transferring from your local currency balance",
      "Wise converts at the mid-market rate",
      "Once topped up, retry the payment",
    ],
  },
  resolve_paypal_error: {
    title: "Fix PayPal checkout errors",
    steps: [
      "Clear your browser cache and cookies",
      "Try a different browser (Chrome, Firefox, Safari)",
      "Disable browser extensions especially ad blockers",
      "Make sure JavaScript is enabled",
      "Log out of PayPal and log back in",
      "Try on a mobile device if desktop isn't working",
    ],
  },
  resolve_paypal_decline: {
    title: "PayPal declined the payment",
    steps: [
      "Check if your PayPal balance is sufficient or your linked card/bank is up to date",
      "Go to PayPal → Wallet and verify your payment method is confirmed",
      "Check if your PayPal account has any limitations (check the Resolution Centre)",
      "Try adding a different payment method to PayPal",
      "Contact PayPal support if the issue persists",
    ],
  },
  resolve_paypal_timeout: {
    title: "PayPal session timed out",
    steps: [
      "Do not click the browser back button during payment — this can cause timeouts",
      "Start the payment process again from the beginning",
      "Make sure your internet connection is stable",
      "Complete the PayPal steps within 10 minutes to avoid session expiry",
    ],
  },
  resolve_blank: {
    title: "Fix blank payment page",
    steps: [
      "Disable any ad blockers or privacy extensions for this site",
      "Try an incognito/private browser window",
      "Allow pop-ups from this website in your browser settings",
      "Try a different browser",
      "Check if your internet connection is stable",
    ],
  },
  resolve_error_msg: {
    title: "Resolve payment error message",
    steps: [
      "Note the exact error message you see",
      "Clear browser cache and reload",
      "Try a different browser or device",
      "If the error mentions 'currency' or 'region', try a Wise USD virtual card",
      "Contact our support with the error message if the issue continues",
    ],
    wiseNote: true,
  },
  resolve_popup_blocked: {
    title: "Allow PayPal pop-ups",
    steps: [
      "Your browser may be blocking the PayPal pop-up window",
      "Look for a pop-up blocked icon in your address bar",
      "Click it and select 'Always allow pop-ups from this site'",
      "Try again — the PayPal window should now open",
      "On mobile: make sure you are not in Reader Mode",
    ],
  },
  resolve_contact_support: {
    title: "Contact Formixa support",
    steps: [
      "You have been charged but not received access — this is unusual and we will fix it",
      "Forward your PayPal confirmation email to our support",
      "Include your receipt number if shown in PayPal",
      "We will manually verify your payment and grant access within 24 hours",
      "Use the Contact/Support form on the Formixa homepage",
    ],
  },
  resolve_pending_charge: {
    title: "Payment may be pending",
    steps: [
      "Check your PayPal account under Activity — look for a 'Pending' transaction",
      "Pending payments can take 1–3 business days to clear",
      "If pending for more than 3 days, contact PayPal to investigate",
      "Check your bank/card statement for an authorisation hold",
      "If nothing appears, the payment was not completed — try again",
    ],
  },
};

export default function PaymentHelpPage() {
  const [currentStep, setCurrentStep] = useState<string>("start");
  const [history, setHistory] = useState<string[]>([]);
  const [resolution, setResolution] = useState<Resolution | null>(null);

  function choose(next: string) {
    if (RESOLUTIONS[next]) {
      setHistory((h) => [...h, currentStep]);
      setResolution(RESOLUTIONS[next]);
      setCurrentStep(next);
    } else if (FLOW[next]) {
      setHistory((h) => [...h, currentStep]);
      setCurrentStep(next);
      setResolution(null);
    }
  }

  function goBack() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentStep(prev);
    setResolution(null);
  }

  function reset() {
    setCurrentStep("start");
    setHistory([]);
    setResolution(null);
  }

  const step = FLOW[currentStep];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-700 mb-4">
          <CreditCard size={14} />
          Payment Troubleshooter
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Visa Payment Troubleshooter</h1>
        <p className="mt-2 text-slate-500">Answer a few questions and we&apos;ll help you fix your payment issue.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {!resolution && step && (
          <>
            <p className="font-medium text-slate-900 mb-5">{step.question}</p>
            <div className="space-y-2">
              {step.options.map((opt) => (
                <button
                  key={opt.next}
                  onClick={() => choose(opt.next)}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-left text-slate-700 hover:border-brand-300 hover:bg-brand-50 transition-colors"
                >
                  {opt.label}
                  <ChevronRight size={16} className="text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </>
        )}

        {resolution && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-green-500" />
              <h2 className="font-semibold text-slate-900">{resolution.title}</h2>
            </div>
            <ol className="space-y-3">
              {resolution.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700">
                  <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>

            {resolution.wiseNote && (
              <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-sm font-semibold text-blue-800 mb-2">Recommended fix: Wise Virtual Card</p>
                <p className="text-sm text-blue-700 mb-3">
                  A Wise virtual debit card works reliably for online payments in any currency. Open a free Wise account, get a virtual USD card, top it up, and use it to pay. No foreign transaction fees.
                </p>
                <a
                  href="https://wise.com/register"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
                >
                  <ExternalLink size={12} />
                  Open a free Wise account
                </a>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
          {history.length > 0 ? (
            <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
              <ChevronLeft size={14} />
              Back
            </button>
          ) : <span />}
          {(history.length > 0 || resolution) && (
            <button onClick={reset} className="text-sm text-slate-400 hover:text-slate-600">
              Start over
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Still having trouble? Use the contact form on our homepage and we&apos;ll help within 24 hours.
      </p>
    </div>
  );
}
