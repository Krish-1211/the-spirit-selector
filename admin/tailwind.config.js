/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    900: "#0a0a0a",
                    800: "#111111",
                    700: "#1a1a1a",
                    600: "#242424",
                    500: "#2e2e2e",
                    accent: "#8b1a1a",
                    "accent-light": "#c0392b",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                serif: ["Playfair Display", "Georgia", "serif"],
            },
        },
    },
    plugins: [],
};
