/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",           // 👈 Added this because your brain file is here
    "./App.tsx",             // 👈 This is in your root folder
    "./components/**/*.{tsx,ts}", // 👈 This covers your UI components
    "./services/**/*.{ts,tsx}"    // 👈 This covers your AI services
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
