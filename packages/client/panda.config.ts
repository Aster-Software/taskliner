import { defineConfig, defineLayerStyles } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: [
    "./src/**/*.{ts,tsx,js,jsx,astro}",
    "./pages/**/*.{ts,tsx,js,jsx,astro}",
    "./panda/**/*.{ts,tsx,js,jsx,astro}",
  ],

  // Files to exclude
  exclude: [],

  presets: ["@pandacss/preset-base", "@park-ui/panda-preset"],

  jsxFramework: "solid",

  // The output directory for your css system
  outdir: "styled-system",

  globalCss: {
    ":root": {
      letterSpacing: 0.12,
    },
  },

  // Useful for theme customization
  theme: {
    extend: {
      layerStyles: defineLayerStyles({
        container: {
          description: "container styles",
          value: {
            background: "t50",
            border: "2px solid {colors.t80}",
          },
        },
      }),
      tokens: {
        colors: {
          canvas: { value: "white" },
          ink: { value: "rgb(32, 32, 32)" },

          panel: { value: "{colors.t00}" },
          panel_hover: { value: "{colors.t04}" },
          panel_text: { value: "{colors.t80}" },
          panel_border: { value: "{colors.t20}" },
          panel_placeholder: { value: "{colors.t30}" },

          subtle: { value: "{colors.t08}" },
          subtle_hover: { value: "{colors.t15}" },
          subtle_text: { value: "{colors.t80}" },
          subtle_border: { value: "clear" },
          subtle_placeholder: { value: "{colors.t40}" },

          primary: { value: "{colors.t80}" },
          primary_hover: { value: "{colors.t99}" },
          primary_text: { value: "white" },
          primary_border: { value: "clear" },
          primary_placeholder: { value: "rgba(255, 255, 255, 0.4)" },

          background: { value: "{colors.t05}" },
          background_hover: { value: "{colors.t08}" },

          border: { value: "{colors.t20}" },

          disabled_text: { value: "{colors.t40}" },
          placeholder_text: { value: "{colors.t30}" },

          focus: { value: "rgba(0, 200, 255, 0.5)" },

          t99: { value: "rgba(0, 4, 10, 0.99)" },
          t95: { value: "rgba(0, 4, 10, 0.95)" },
          t90: { value: "rgba(0, 4, 10, 0.90)" },
          t85: { value: "rgba(0, 4, 10, 0.85)" },
          t80: { value: "rgba(0, 4, 10, 0.80)" },
          t75: { value: "rgba(0, 4, 10, 0.75)" },
          t70: { value: "rgba(0, 4, 10, 0.70)" },
          t60: { value: "rgba(0, 4, 10, 0.60)" },
          t50: { value: "rgba(0, 4, 10, 0.50)" },
          t40: { value: "rgba(0, 4, 10, 0.40)" },
          t30: { value: "rgba(0, 4, 10, 0.30)" },
          t20: { value: "rgba(0, 4, 10, 0.20)" },
          t15: { value: "rgba(0, 4, 10, 0.15)" },
          t10: { value: "rgba(0, 4, 10, 0.10)" },
          t09: { value: "rgba(0, 4, 10, 0.09)" },
          t08: { value: "rgba(0, 4, 10, 0.08)" },
          t07: { value: "rgba(0, 4, 10, 0.07)" },
          t06: { value: "rgba(0, 4, 10, 0.06)" },
          t05: { value: "rgba(0, 4, 10, 0.05)" },
          t04: { value: "rgba(0, 4, 10, 0.04)" },
          t03: { value: "rgba(0, 4, 10, 0.03)" },
          t02: { value: "rgba(0, 4, 10, 0.02)" },
          t01: { value: "rgba(0, 4, 10, 0.01)" },
          t00: { value: "rgba(0, 4, 10, 0.00)" },
        },
        borders: {
          clear: { value: "1px solid transparent" },
          focus: { value: "1px solid {colors.focus}" },
          default: { value: "1px solid {colors.t10}" },
        },
      },
    },
  },
  utilities: {
    extend: {
      xComponent: {
        values: { type: "boolean" },
        transform(value, { token }) {
          return {
            padding: `0px ${token("spacing.4")}`,
            height: token("spacing.9"),
            background: token(`colors.t00`),
            border: token(`borders.default`),
            borderRadius: token("radii.sm"),
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          };
        },
      },
      xComponentClickable: {
        values: { type: "boolean" },
        transform(value, { token }) {
          return {
            cursor: "pointer",
            "&:hover": {
              background: token(`colors.t04`),
            },
          };
        },
      },
      xSubtleFocus: {
        values: { type: "boolean" },
        transform(value, { token }) {
          return {
            "&:focus-visible": {
              outline: token("borders.focus"),
            },
          };
        },
      },
    },
  },
});
