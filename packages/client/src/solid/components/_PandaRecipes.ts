import { css, cva } from "@style/css";
import {
  ComponentBaseDefault,
  ComponentBaseDefaultClickable,
  ComponentBasePrimary,
  ComponentBasePrimaryClickable,
  ComponentBaseSubtle,
  ComponentBaseSubtleClickable,
} from "./_PandaUtils";

export const component_base = cva({
  base: {
    h: 9,
    px: 4,
    rounded: "sm",

    bg: "panel",
    color: "panel_text",
    border: "panel",
    _placeholder: { color: "panel_placeholder" },
  },
  variants: {
    variant: {
      filled: {
        bg: "background",
        border: "clear",
      },
      solid: {
        bg: "primary",
        border: "clear",
        color: "primary_text",
        _placeholder: { color: "primary_placeholder" },
      },
    },
  },
});

export const control = cva({
  base: {
    xComponent: true,
    cursor: "pointer",
  },
  variants: {
    variant: {
      default: { cv: "default" },
      primary: { cv: "primary" },
      subtle: { cv: "subtle" },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const input = cva({
  base: {
    h: 9,
    px: 4,
    rounded: "sm",
    truncate: true,
    cursor: "auto",
    _focusVisible: { outline: "focus" },
    _placeholder: { color: "placeholder_text" },
  },
  variants: {
    variant: {
      default: ComponentBaseDefault,
      primary: ComponentBasePrimary,
      subtle: ComponentBaseSubtle,
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const control_hoverable = cva({
  base: {
    cursor: "pointer",
    _hover: { bg: "panel_hover" },
  },
  variants: {
    variant: {
      filled: {
        _hover: { bg: "background_hover" },
      },
      solid: {
        _hover: { bg: "primary_hover" },
      },
    },
  },
});
