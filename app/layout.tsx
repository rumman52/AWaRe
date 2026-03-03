import Link from "next/link";
import { Activity, BookOpen } from "lucide-react";
import "./globals.css";
import { Disclaimer } from "@/components/disclaimer";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-gradient-to-b from-indigo-50 via-white to-white">
          <div className="app-shell py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/?tab=new-case" className="inline-flex items-center gap-2 text-slate-900">
                <span className="rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 p-2 text-white"><Activity className="h-5 w-5" /></span>
                <span>
                  <strong className="block leading-tight">AMR Steward</strong>
                  <span className="text-xs text-slate-600">Trusted AWaRe-aligned decision support</span>
                </span>
              </Link>
              <nav className="flex items-center gap-2">
                <Link href="/?tab=new-case" className="rounded-xl border border-teal-600 px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50">Workspace</Link>
                <Link href="/admin/guides" className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"><BookOpen className="h-4 w-4" /> Guides</Link>
              </nav>
            </div>
          </div>
        </header>

        <div className="app-shell pt-6">
          <div className="mb-4"><Disclaimer /></div>
          {children}
        </div>
      </body>
    </html>
  );
}
