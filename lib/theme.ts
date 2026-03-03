export const theme = {
  primary: {
    solid: "bg-[#4F46E5] text-white",
    gradient: "bg-gradient-to-r from-[#4F46E5] to-indigo-500 text-white",
    soft: "bg-indigo-50 text-indigo-700",
    border: "border-indigo-200",
    ring: "focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
  },
  secondary: {
    solid: "bg-[#14B8A6] text-white",
    soft: "bg-teal-50 text-teal-800",
    border: "border-teal-200",
    outline: "border border-teal-300 bg-white text-teal-700"
  },
  accent: {
    soft: "bg-rose-50 text-rose-700",
    border: "border-[#FB7185]/40",
    text: "text-[#FB7185]"
  },
  background: {
    app: "bg-gradient-to-b from-teal-50 via-indigo-50 to-slate-50",
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
