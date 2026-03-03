export const theme = {
  primary: {
    solid: "bg-indigo-600 text-white",
    gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white",
    soft: "bg-indigo-50 text-indigo-700",
    border: "border-indigo-200",
    ring: "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
  },
  secondary: {
    solid: "bg-teal-600 text-white",
    soft: "bg-teal-50 text-teal-800",
    border: "border-teal-200",
    outline: "border border-teal-300 bg-white text-teal-700"
  },
  accent: {
    soft: "bg-[#fff1ee] text-[#c2412d]",
    border: "border-[#f8c9c0]",
    text: "text-[#e35d4b]"
  },
  background: {
    app: "bg-gradient-to-b from-[#eef7fb] via-[#f4f3ff] to-slate-50",
    heroGlowTeal: "bg-teal-300/30",
    heroGlowCoral: "bg-rose-300/25"
  },
  surface: {
    card: "bg-white",
    muted: "bg-slate-50"
  },
  border: "border-slate-200",
  text: {
    primary: "text-slate-900",
    secondary: "text-slate-700"
  },
  muted: "text-slate-500"
} as const;
