/** @type {import('tailwindcss').Config} */

// Setiap warna dibaca dari CSS variable (didefinisikan di src/index.css untuk
// tema dark & light). Format "rgb(var(--x) / <alpha-value>)" ini yang bikin
// utility seperti bg-good/15 (opacity) tetap jalan normal.
function themeColor(name) {
  return `rgb(var(${name}) / <alpha-value>)`;
}

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: themeColor("--color-bg"),
        surface: themeColor("--color-surface"),
        surface2: themeColor("--color-surface2"),
        border: themeColor("--color-border"),
        ink: themeColor("--color-ink"),
        muted: themeColor("--color-muted"),
        sidebar: "rgb(var(--color-sidebar) / <alpha-value>)",
        brand: {
          orange: themeColor("--color-orange"),
          orangedim: themeColor("--color-orangedim"),
          yellow: themeColor("--color-yellow"),
        },
        info: themeColor("--color-info"),
        good: themeColor("--color-good"),
        warn: themeColor("--color-warn"),
        bad: themeColor("--color-bad"),
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
        modal: "0 20px 60px rgba(0,0,0,.5)",
      },
    },
  },
  plugins: [],
};
