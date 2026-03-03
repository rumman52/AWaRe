import Link from "next/link";
import { Activity } from "lucide-react";
import "./globals.css";
import { Disclaimer } from "@/components/disclaimer";
import { theme } from "@/lib/theme";

const navItems = [
  { href: "/?tab=new-case", label: "New Case" },
  { href: "/?tab=dashboard", label: "Dashboard" },
  { href: "/?tab=chat", label: "Chat Assistant" }
] as const;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={theme.background.app}>
        <header className="border-b border-indigo-100/70 bg-white/80 backdrop-blur">
          <div className="app-shell py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/?tab=new-case" className="flex items-center gap-2 text-slate-900 no-underline">
                <span className="rounded-xl bg-indigo-600 p-2 text-white">
                  <Activity className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold leading-tight">AMR Steward</p>
                  <p className="text-xs text-slate-600">Trusted AWaRe-aligned decision support</p>
                </div>
              </Link>

              <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-full border border-teal-300 bg-white px-4 py-2 text-slate-700 transition hover:bg-teal-50 no-underline">
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
