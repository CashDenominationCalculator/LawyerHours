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
        navy: '#1a2332',
        'lh-green': '#2d8a4e',
        'lh-green-light': '#e8f5e9',
        amber: '#e8a838',
        'amber-light': '#fff8e1',
      },
    },
  },
  plugins: [],
};
export default config;
