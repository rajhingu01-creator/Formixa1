import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Successful — Download Your DS-160 PDF | Formixa",
  description: "Your DS-160 reference PDF is ready. Download it and use it to complete the official form at ceac.state.gov.",
  robots: { index: false, follow: false },
};

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
