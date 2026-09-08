import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar gratis",
  description: "Buat akun cakra dan mulai bangun kehadiran digital Anda.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
