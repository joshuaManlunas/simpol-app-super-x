/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.html",
    "./**/*.js",
    "./src/**/*.html",
    "./src/**/*.js",
    "./src/**/*.ts",
    "./popup.js",
    "./popup.html",
  ],
  theme: {
    extend: {
      colors: {
        "blue-primary": "#4285f4",
        "blue-dark": "#3367d6",
        "bg-light": "#f7f7f7",
        "text-dark": "#333",
        "border-light": "#ddd",
        "bg-dark": "var(--bg-dark)",
        "bg-header": "var(--bg-header)",
        "text-light": "var(--text-light)",
        "border-color": "var(--border-color)",
        "highlight-orange": "var(--highlight-orange)",
        "highlight-blue": "var(--highlight-blue)",
      },
      fontFamily: {
        mono: ["Courier New", "monospace"],
      },
      boxShadow: {
        panel: "0 4px 12px var(--shadow-color)",
      },
      borderRadius: {
        panel: "var(--panel-radius)",
      },
      transitionDuration: {
        default: "var(--animation-speed)",
      },
    },
  },
  plugins: [],
};
