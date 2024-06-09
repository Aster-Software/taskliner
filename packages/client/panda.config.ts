import {
  defineConfig,
  defineLayerStyles,
  defineTextStyles,
} from "@pandacss/dev";
import { colord } from "colord";

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
      // letterSpacing: 0.12,

      fontSize: "lg",
      fontFamily: "Inter",
      fontOpticalSizing: "auto",
      fontWeight: 500,
      fontStyle: "normal",
      fontVariationSettings: `"slnt" 0`,
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
          canvas_hover: { value: colord("#ffffff").darken(0.05).toRgbString() },
          ink: { value: "rgb(32, 32, 32)" },

          indicator: { value: "{colors.t40}" },

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

          background: { value: "{colors.t02}" },
          background_hover: { value: "{colors.t06}" },

          border: { value: "{colors.t20}" },

          disabled_text: { value: "{colors.t40}" },
          placeholder_text: { value: "{colors.t30}" },

          focus: { value: colord("#0ea5e9").toHex() },

          t99: { value: "rgba(0, 4, 15, 0.99)" },
          t95: { value: "rgba(0, 4, 15, 0.95)" },
          t90: { value: "rgba(0, 4, 15, 0.90)" },
          t85: { value: "rgba(0, 4, 15, 0.85)" },
          t80: { value: "rgba(0, 4, 15, 0.80)" },
          t75: { value: "rgba(0, 4, 15, 0.75)" },
          t70: { value: "rgba(0, 4, 15, 0.70)" },
          t60: { value: "rgba(0, 4, 15, 0.60)" },
          t50: { value: "rgba(0, 4, 15, 0.50)" },
          t40: { value: "rgba(0, 4, 15, 0.40)" },
          t30: { value: "rgba(0, 4, 15, 0.30)" },
          t20: { value: "rgba(0, 4, 15, 0.20)" },
          t15: { value: "rgba(0, 4, 15, 0.15)" },
          t10: { value: "rgba(0, 4, 15, 0.10)" },
          t09: { value: "rgba(0, 4, 15, 0.09)" },
          t08: { value: "rgba(0, 4, 15, 0.08)" },
          t07: { value: "rgba(0, 4, 15, 0.07)" },
          t06: { value: "rgba(0, 4, 15, 0.06)" },
          t05: { value: "rgba(0, 4, 15, 0.05)" },
          t04: { value: "rgba(0, 4, 15, 0.04)" },
          t03: { value: "rgba(0, 4, 15, 0.03)" },
          t02: { value: "rgba(0, 4, 15, 0.02)" },
          t01: { value: "rgba(0, 4, 15, 0.01)" },
          t00: { value: "rgba(0, 4, 15, 0.00)" },
        },
        borders: {
          clear: { value: "1px solid transparent" },
          focus: { value: "1px solid {colors.focus}" },
          subtle: { value: "1px solid {colors.t10}" },
        },
        fontSizes: {},
        opacity: {
          disabled: { value: 0.3 },
        },
        fonts: {
          inter: {
            value: "Inter",
          },
        },
      },
    },
    textStyles: {
      caption: {
        description: "Smaller text. Use this for labels.",
        value: {
          fontSize: "sm",
        },
      },

      "sm-heading": {
        value: {
          fontSize: "lg",
          fontFamily: "Inter",
          fontOpticalSizing: "auto",
          fontWeight: 500,
          fontStyle: "normal",
          fontVariationSettings: `"slnt" 0`,
        },
      },
      "md-heading": {
        value: {
          fontSize: "xl",
        },
      },
      "lg-heading": {
        value: {
          fontSize: "2xl",
        },
      },
    },
  },
  utilities: {
    extend: {
      xBlock: {
        values: { type: "boolean" },
        transform: (value, { token }) => {
          if (value === false) return {};

          return {
            display: "block",
            width: "100%",
          };
        },
      },
      xPanel: {
        values: { type: "boolean" },
        transform: (value, { token }) => {
          if (value === false) return {};

          return {
            background: token(`colors.canvas`),
            border: token(`borders.subtle`),
            borderRadius: token("radii.sm"),
          };
        },
      },
      xComponent: {
        values: { type: "boolean" },
        transform: (value, { token }) => {
          if (value === false) return {};

          return {
            padding: `0px ${token("spacing.3")}`,
            height: token("spacing.8"),
            background: token(`colors.canvas`),
            border: token(`borders.subtle`),
            borderRadius: token("radii.sm"),
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            fontSize: token("fontSizes.sm"),
            display: "flex",
            alignItems: "center",
            "&:disabled": { opacity: 0.35 },
            "&::placeholder": { color: token("colors.t30") },
          };
        },
      },
      xComponentClickable: {
        values: { type: "boolean" },
        transform: (value, { token }) => {
          if (value === false) return {};

          return {
            cursor: "pointer",
            "&:hover": {
              background: token(`colors.canvas_hover`),
            },
          };
        },
      },
      xSubtleFocus: {
        values: { type: "boolean" },
        transform: (value, { token }) => {
          if (value === false) return {};

          return {
            "&:focus-visible": {
              outline: token("borders.focus"),
              outlineOffset: -1,
            },
          };
        },
      },
    },
  },
});
