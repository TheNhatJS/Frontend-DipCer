import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "custom-image": "url('/static/image/bg.jpg')",
      },
      boxShadow: {
        glow: "0 10px 25px rgba(56, 182, 255, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
