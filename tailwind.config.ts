import type { Config } from "tailwindcss";

// Palette + type sampled from the "Market Academy – Home" Adobe XD design.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0B0B0B", soft: "#141519", raised: "#18191A", line: "#233234" },
        brand: { DEFAULT: "#2660D3", light: "#4A75CB", soft: "#7EA0E6" },
        mute: { DEFAULT: "#BBBBBB", dim: "#888888", faint: "#666666" },
      },
      fontFamily: {
        sans: ["var(--font-tasa)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
