import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#dde1e8",
          300: "#bec4d0",
          400: "#8d95a6",
          500: "#5b6478",
          600: "#424a5c",
          700: "#323848",
          800: "#1e222d",
          900: "#0f121a",
        },
        accent: {
          DEFAULT: "#047857",
          600: "#047857",
          500: "#059669",
          50: "#ecfdf5",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial"],
      },
    },
  },
  plugins: [],
};
export default config;
