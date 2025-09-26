import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  safelist: [
    // Comprehensive class patterns
    { pattern: /^grid-/ },        // All grid-related classes
    { pattern: /^col-/ },          // All column-related classes
    { pattern: /^gap-/ },          // All gap classes
    { pattern: /^p-/ },            // All padding classes
    { pattern: /^m-/ },            // All margin classes
    { pattern: /^w-/ },            // All width classes
    { pattern: /^h-/ },            // All height classes
    { pattern: /^text-/ },         // All text-related classes
    { pattern: /^bg-/ },           // All background classes
    { pattern: /^border-/ },       // All border classes
    { pattern: /^rounded-/ },      // All rounded/border-radius classes
    { pattern: /^flex-/ },         // All flexbox-related classes
    { pattern: /^justify-/ },      // All justify classes
    { pattern: /^items-/ },        // All alignment classes
    { pattern: /^space-/ },        // Spacing between child elements
    { pattern: /^divide-/ },       // Divide classes
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
