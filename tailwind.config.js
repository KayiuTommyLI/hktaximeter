// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'dseg': ['DSEG7Classic', 'monospace'], // Keep this for digital displays only
        'sans': ['ui-sans-serif', 'system-ui'],
        'mono': ['ui-monospace', 'SFMono-Regular'], // Remove DSEG from here
      },
      aspectRatio: {
        '10/6': '10 / 6',
      },
    },
  },
  plugins: [],
}
