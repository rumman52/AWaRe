export const theme = {
  colors: {
    primary: "#4f46e5",
    secondary: "#0f766e",
    accent: "#f97362",
    surface: "#ffffff",
    border: "#d9e2ef",
    text: "#0f172a",
    muted: "#475569",
    aware: {
      ACCESS: "#15803d",
      WATCH: "#b45309",
      RESERVE: "#b91c1c"
    }
  },
  classes: {
    pageBg: "bg-gradient-to-b from-indigo-50 via-teal-50/30 to-slate-50",
    panel: "rounded-2xl border border-[color:var(--border)] bg-white shadow-[0_14px_34px_rgba(15,23,42,0.08)]",
    primaryButton:
      "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 shadow-[0_8px_20px_rgba(79,70,229,0.35)]",
    secondaryButton: "border border-teal-600 text-teal-700 bg-white hover:bg-teal-50"
  }
} as const;

export type AwareGroup = keyof typeof theme.colors.aware;
