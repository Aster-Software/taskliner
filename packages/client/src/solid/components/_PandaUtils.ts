import { css } from "@style/css";
import type {
  RecipeConfig,
  RecipeDefinition,
  RecipeRuntimeFn,
} from "@style/types";
import merge from "merge";

export const mergeRecipes = <
  T extends (RecipeDefinition<any> | RecipeConfig)[],
>(
  ...recipes: T
): RecipeConfig<T[number]["variants"]> => {
  return merge.recursive(true, ...recipes);
};

export const ComponentBaseDefault = css.raw({
  bg: "panel",
  color: "panel_text",
  border: "panel",
  _placeholder: { color: "panel_placeholder" },
  _disabled: { opacity: 0.35 },
});

export const ComponentBasePrimary = css.raw({
  bg: "primary",
  border: "primary",
  color: "primary_text",
  _placeholder: { color: "primary_placeholder" },
  _disabled: { opacity: 0.35 },
});

export const ComponentBaseSubtle = css.raw({
  bg: "subtle",
  border: "subtle",
  color: "subtle_text",
  _placeholder: { color: "subtle_placeholder" },
  _disabled: { opacity: "disabled" },
});

export const ComponentBaseDefaultClickable = css.raw(ComponentBaseDefault, {
  cursor: "pointer",
  _hover: { bg: "panel_hover" },
});

export const ComponentBasePrimaryClickable = css.raw(ComponentBasePrimary, {
  cursor: "pointer",
  _hover: { bg: "primary_hover" },
});

export const ComponentBaseSubtleClickable = css.raw(ComponentBaseSubtle, {
  cursor: "pointer",
  _hover: { bg: "subtle_hover" },
});
