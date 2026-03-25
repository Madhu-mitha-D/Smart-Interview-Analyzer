/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#6d5fff",
        accent2: "#00e5cc",
        accent3: "#ff4d88",
        border: "rgba(255,255,255,0.08)",
        surface: "rgba(255,255,255,0.032)",
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "system-ui", "sans-serif"],
        body: ["Cabinet Grotesk", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
        "5xl": "44px",
      },
      keyframes: {
        "shimmer-slide": {
          "0%": { transform: "translateX(-150%) skewX(-12deg)" },
          "100%": { transform: "translateX(250%) skewX(-12deg)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "float-y": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-18px)" },
        },
        "glow-breathe": {
          "0%,100%": { opacity: "0.4", filter: "blur(70px)" },
          "50%": { opacity: "0.85", filter: "blur(52px)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-5%)", opacity: "0" },
          "5%": { opacity: "0.4" },
          "95%": { opacity: "0.4" },
          "100%": { transform: "translateY(105vh)", opacity: "0" },
        },
      },
      animation: {
        "shimmer-slide": "shimmer-slide 0.6s ease forwards",
        "spin-slow": "spin-slow 18s linear infinite",
        "float-y": "float-y 5s ease-in-out infinite",
        "glow-breathe": "glow-breathe 4s ease-in-out infinite",
        "scan-line": "scan-line 12s linear infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh": "radial-gradient(at 40% 20%, rgba(109,95,255,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0,229,204,0.18) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(109,95,255,0.15) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};
