import { calc } from "@vanilla-extract/css-utils";
import { createTheme, globalStyle } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { mergeRecipes } from "./_VanillaExtractRecipes.css";
import { colord } from "colord";

const Zinc = colord("#09090b");

export const [theme, vars] = createTheme({
  color: {
    panel: Zinc.alpha(0.2).toHex(),
    panel_hover: Zinc.alpha(0.3).toHex(),

    border: Zinc.alpha(0.3).toHex(),

    // t70: "rgb(0, 5, 15, 0.00)"
    // t60: "rgb(0, 5, 15, 0.00)"
    // t50: "rgb(0, 5, 15, 0.00)"
    // t40: "rgb(0, 5, 15, 0.00)"
    // t30: "rgb(0, 5, 15, 0.00)"
    // t20: "rgb(0, 5, 15, 0.00)"
    // t10: "rgb(0, 5, 15, 0.00)"
    // t09: "rgb(0, 5, 15, 0.00)"
    // t08: "rgb(0, 5, 15, 0.00)"
    // t07: "rgb(0, 5, 15, 0.00)"
    // t06: "rgb(0, 5, 15, 0.00)"
    // t05: "rgb(0, 5, 15, 0.00)"
    // t04: "rgb(0, 5, 15, 0.00)"
    // t03: "rgb(0, 5, 15, 0.00)"
    // t02: "rgb(0, 5, 15, 0.00)"
    // t01: "rgb(0, 5, 15, 0.00)"
    // t00: "rgb(0, 5, 15, 0.00)"
  },
});

globalStyle("html, body", {
  margin: 0,
});

export const button = recipe({
  base: {},
  variants: {
    variant: {
      solid: { background: "blue", borderLeft: "5px solid cyan" },
      filled: { background: "black" },
    },
  },
});

export const panel = recipe({
  base: {
    background: vars.color.panel,
  },
  variants: {
    variant: {
      solid: { background: vars.color.panel },
      filled: { background: "white" },
      dark: { background: "grey" },
    },
  },
});

export const hoverable = recipe({
  base: {
    cursor: "pointer",
    ":hover": {
      background: "grey",
    },
  },
});

export const recipes = {
  button,
  panel,
  hoverable,
};

export const test = mergeRecipes(button, panel, hoverable);
export const t2 = mergeRecipes(button, panel, hoverable);
