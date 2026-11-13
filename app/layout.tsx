import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "EvalLens — Evaluate Intelligence. Improve Quality.", template: "%s · EvalLens" },
  description: "Evidence-based pairwise evaluation, reusable rubrics, and honest analytics for AI responses.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
