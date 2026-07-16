import type { Config } from "tailwindcss";

/**
 * Apiary design system — "inside the hive": warm, dark, honey.
 * Role colors map worker bees to their craft.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hive: {
          bg: "#161006", // deepest brown — page background
          panel: "#221A0C", // cards / panels
          panel2: "#2B2110", // raised panels
          border: "#3A2D14", // hairline borders
        },
        honey: {
          DEFAULT: "#F0A818",
          light: "#FFC94A",
          deep: "#C9861A",
        },
        wax: {
          DEFAULT: "#F5E6C4", // primary text
          dim: "#9A8759", // muted text / labels
        },
        role: {
          marketing: "#F07050",
          dev: "#B99AF5",
          research: "#6FC9E8",
          copy: "#F0A818",
          support: "#7DD87D",
        },
      },
      fontFamily: {
        display: ["var(--font-unbounded)", "system-ui", "sans-serif"],
        sans: ["var(--font-instrument)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "honey-glow":
          "radial-gradient(120% 80% at 50% -20%, rgba(240,168,24,0.14) 0%, rgba(240,168,24,0.04) 35%, transparent 65%)",
        "honey-btn": "linear-gradient(135deg, #F0A818 0%, #FFC94A 100%)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.82)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
