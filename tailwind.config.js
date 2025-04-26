module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "m-3syslightoutline": "var(--m-3syslightoutline)",
        "m-3syslightprimary": "var(--m-3syslightprimary)",
        "m-3syslightsurface": "var(--m-3syslightsurface)",
        "m3state-layerslighton-primaryopacity-008":
          "var(--m3state-layerslighton-primaryopacity-008)",
        "m3state-layerslighton-primaryopacity-012":
          "var(--m3state-layerslighton-primaryopacity-012)",
        "m3state-layerslighton-surface-variantopacity-008":
          "var(--m3state-layerslighton-surface-variantopacity-008)",
        "m3state-layerslighton-surface-variantopacity-012":
          "var(--m3state-layerslighton-surface-variantopacity-012)",
        "m3syslightinverse-surface": "var(--m3syslightinverse-surface)",
        "m3syslighton-primary": "var(--m3syslighton-primary)",
        "m3syslighton-primary-container":
          "var(--m3syslighton-primary-container)",
        "m3syslighton-surface": "var(--m3syslighton-surface)",
        "m3syslighton-surface-variant": "var(--m3syslighton-surface-variant)",
        "m3syslightoutline-variant": "var(--m3syslightoutline-variant)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      boxShadow: { "m3-elevation-light-1": "var(--m3-elevation-light-1)" },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
  },
  plugins: [],
  darkMode: ["class"],
};
