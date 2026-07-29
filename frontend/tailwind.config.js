/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f5f7fa",
        surface: "#ffffff",
        surface2: "#eef2f7",
        border: "#d9e2ec",
        ink: "#1f2937",
        muted: "#6b7280",

        brand: {
          orange: "#ff6a13",
          orangedim: "#ffd9c4",
          yellow: "#f2c230",
        },

        info: "#2563eb",
        good: "#16a34a",
        warn: "#f59e0b",
        bad: "#dc2626",
      },

      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },

      boxShadow: {
        modal: "0 20px 60px rgba(0,0,0,.15)",
      },
    },
  },
  plugins: [],
};
