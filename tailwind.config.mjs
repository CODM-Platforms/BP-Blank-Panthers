/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        panther: {
          dark: '#0f1115',
          card: '#1a1d24',
          border: '#2a2e37',
          gold: '#e6c875',
          'gold-hover': '#f7d87c',
          text: '#a0aabf',
          white: '#ffffff',
        },
        "on-error-container": "#ffdad6", "secondary-fixed": "#dde2f0", "primary-container": "#b1f800",
        "on-secondary": "#2b313a", "surface-container-high": "#282a2f", "on-tertiary": "#243141",
        "on-primary-container": "#4d6e00", "on-surface": "#e2e2e8", "inverse-primary": "#486800",
        "primary-fixed-dim": "#9bd900", "on-primary-fixed": "#131f00", "background": "#111318",
        "error": "#ffb4ab", "surface-container-highest": "#333539", "surface-container-low": "#191c20",
        "inverse-surface": "#e2e2e8", "outline-variant": "#424a33", "on-error": "#690005",
        "surface-dim": "#111318", "on-surface-variant": "#c2caad", "on-background": "#e2e2e8",
        "tertiary-fixed": "#d6e4f8", "on-tertiary-fixed-variant": "#3a4858", "on-primary-fixed-variant": "#354e00",
        "on-secondary-container": "#b3b8c5", "primary": "#ffffff", "surface-variant": "#333539",
        "inverse-on-surface": "#2e3035", "surface-container-lowest": "#0c0e12", "on-secondary-fixed-variant": "#414751",
        "tertiary": "#ffffff", "outline": "#8c9479", "secondary-container": "#434954", "on-tertiary-container": "#586577",
        "tertiary-fixed-dim": "#bac8dc", "secondary": "#c1c7d3", "surface-bright": "#37393e",
        "on-primary": "#243600", "surface": "#111318", "primary-fixed": "#b1f800", "on-tertiary-fixed": "#0f1c2b",
        "on-secondary-fixed": "#161c25", "error-container": "#93000a", "tertiary-container": "#d6e4f8",
        "surface-container": "#1d2024", "secondary-fixed-dim": "#c1c7d3", "surface-tint": "#9bd900"
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
      spacing: { "space-xs": "0.25rem", "space-xl": "2.5rem", "gutter-sm": "0.75rem", "space-lg": "1.5rem", "margin-mobile": "1rem", "space-sm": "0.5rem", "margin": "2rem", "gutter-lg": "1.5rem", "gutter": "1.25rem", "space-md": "1rem" },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'monospace'],
        "headline-xl": ["Space Grotesk", "sans-serif"], "headline-md": ["Space Grotesk", "sans-serif"], "label-md": ["Space Grotesk", "sans-serif"],
        "headline-lg": ["Space Grotesk", "sans-serif"], "body-lg": ["Inter", "sans-serif"], "headline-sm": ["Space Grotesk", "sans-serif"],
        "headline-lg-mobile": ["Space Grotesk", "sans-serif"], "body-md": ["Inter", "sans-serif"], "label-sm": ["Space Grotesk", "sans-serif"],
        "title-sm": ["Inter", "sans-serif"], "title-md": ["Inter", "sans-serif"], "body-sm": ["Inter", "sans-serif"], "headline-xl-mobile": ["Space Grotesk", "sans-serif"]
      },
      fontSize: {
        "headline-xl": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.03em", "fontWeight": "700" }],
        "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.08em", "fontWeight": "700" }],
        "headline-lg": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-lg": ["16px", { "lineHeight": "24px", "letterSpacing": "0em", "fontWeight": "400" }],
        "headline-sm": ["18px", { "lineHeight": "24px", "letterSpacing": "0em", "fontWeight": "600" }],
        "headline-lg-mobile": ["26px", { "lineHeight": "34px", "letterSpacing": "-0.01em", "fontWeight": "700" }],
        "body-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0em", "fontWeight": "400" }],
        "label-sm": ["10px", { "lineHeight": "14px", "letterSpacing": "0.1em", "fontWeight": "700" }],
        "title-sm": ["14px", { "lineHeight": "20px", "letterSpacing": "0em", "fontWeight": "600" }],
        "title-md": ["16px", { "lineHeight": "22px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "body-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.01em", "fontWeight": "400" }],
        "headline-xl-mobile": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }]
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
};
