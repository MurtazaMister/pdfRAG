import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        surface: "#111113",
        "surface-elevated": "#17171a",
        border: "#2a2a2f",
        text: "#f4f4f5",
        muted: "#a1a1aa",
        accent: "#6366f1",
        success: "#22c55e",
        danger: "#ef4444"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
