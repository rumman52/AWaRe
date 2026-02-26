import Link from "next/link";
import "./globals.css";
import { Disclaimer } from "@/components/disclaimer";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-6xl px-4 py-6">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">AMR Steward</h1>
              <p className="text-sm text-slate-600">WHO AWaRe-aligned antibiotic stewardship decision support prototype</p>
            </div>
            <nav className="flex gap-2 text-sm">
              <Link href="/new-case" className="rounded-lg bg-slate-900 px-3 py-2 text-white">New Case</Link>
              <Link href="/dashboard" className="rounded-lg border border-slate-300 px-3 py-2">Dashboard</Link>
              <Link href="/admin/guides" className="rounded-lg border border-slate-300 px-3 py-2">Guides</Link>
            </nav>
          </header>
          <div className="mb-4">
            <Disclaimer />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
