import Link from "next/link";
import { Activity } from "lucide-react";
import "./globals.css";
import { Disclaimer } from "@/components/disclaimer";
import { theme } from "@/lib/theme";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={theme.background.app}>
        <header className="border-b border-indigo-100/70 bg-white/80 backdrop-blur">
          <div className="app-shell py-5">
            <Link href="/?tab=overview" className="flex w-fit items-center gap-2 text-slate-900 no-underline">
              <span className="rounded-xl bg-indigo-600 p-2 text-white">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold leading-tight">AMR Steward</p>
                <p className="text-xs text-slate-600">Trusted AWaRe-aligned decision support</p>
              </div>
            </Link>
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
