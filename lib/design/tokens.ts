export const designTokens = {
  colors: {
    primary: "#1d4ed8",
    background: "#f8fafc",
    card: "#ffffff",
    border: "#dbe3ef",
    text: "#0f172a",
    muted: "#475569",
    aware: {
      ACCESS: "#15803d",
      WATCH: "#b45309",
      RESERVE: "#b91c1c"
    }
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem"
  },
  radius: {
    xl: "1rem"
  },
  shadow: {
    soft: "0 10px 30px rgba(15,23,42,0.08)"
  }
} as const;

export type AwareGroup = keyof typeof designTokens.colors.aware;
