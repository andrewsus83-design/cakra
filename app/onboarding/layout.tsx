import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Bangun kehadiran digital Anda dalam 8 langkah singkat.",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
