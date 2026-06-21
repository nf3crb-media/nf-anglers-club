/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nf: {
          deep: "#0a1419",
          deep2: "#0f2027",
          slate: "#16323b",
          line: "#1e3d47",
          fog: "#7fa6ad",
          ink: "#e8f3f1",
          glow: "#c8ff3c",
          glow2: "#5ce0a0",
          amber: "#ffb43c",
        },
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};
