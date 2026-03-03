import Link from "next/link";
import { Activity } from "lucide-react";
import "./globals.css";
import { Disclaimer } from "@/components/disclaimer";

const navItems = [
  { href: "/new-case", label: "New Case" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Chat Assistant" }
] as const;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-gradient-to-b from-blue-50 to-white">
          <div className="app-shell py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/new-case" className="flex items-center gap-2 text-slate-900">
                <span className="rounded-xl bg-blue-700 p-2 text-white">
                  <Activity className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold leading-tight">AMR Steward</p>
                  <p className="text-xs text-slate-600">Trusted AWaRe-aligned decision support</p>
                </div>
              </Link>

              <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-100">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <div className="app-shell pt-6">
          <div className="mb-4">
            <Disclaimer />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
