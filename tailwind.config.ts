import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wishes: {
          pink: {
            DEFAULT: "#FFAEC9",
            soft: "#FFB6C1",
            light: "#FFF0F5",
            deep: "#FF8DA1",
          },
          blue: {
            DEFAULT: "#A0C4FF",
            baby: "#BDE0FE",
            ice: "#E2F0FD",
          },
          mint: {
            DEFAULT: "#BEE3DB",
            soft: "#C1F0DC",
            pale: "#E8F8F2",
          },
          cream: {
            DEFAULT: "#FFF9E6",
            soft: "#FDFAF2",
            warm: "#FFF2D8",
          },
          chocolate: {
            DEFAULT: "#4A2E1B",
            dark: "#3D2314",
            light: "#795548",
          },
          cherry: {
            DEFAULT: "#FF3366",
            gloss: "#E63946",
          },
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        display: ["var(--font-display)", "Fredoka", "Comfortaa", "sans-serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      boxShadow: {
        pastel: "0 10px 30px -5px rgba(255, 174, 201, 0.3)",
        dreamy: "0 20px 40px -10px rgba(160, 196, 255, 0.35)",
        floating: "0 25px 50px -12px rgba(74, 46, 27, 0.15)",
        innerGlow: "inset 0 2px 8px rgba(255, 255, 255, 0.8)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseSlow: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        spinSlow: "spin 20s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(1.5deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
