/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: false, // Disable dark mode
  theme: {
    extend: {
      colors: {
        // Add custom colors if needed
      },
      backgroundColor: {
        // Custom background colors if needed
      },
      textColor: {
        // Custom text colors if needed
      },
    },
  },
  plugins: [],
};
