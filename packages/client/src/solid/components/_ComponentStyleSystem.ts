import type { SystemStyleObject } from "@pandacss/dev";
import { css, cva } from "@style/css";
import type { RecipeRuntimeFn, RecipeVariantRecord } from "@style/types";
import type { DeepUnion } from "./_DeepUnion";

export const recipes = {
  test: cva({
    base: {
      bg: "royalblue",
    },
    variants: {
      variant: {
        default: {},
        filled: {},
        solid: {
          bg: "red",
        },
      },
    },
  }),

  panel: cva({
    base: {
      bg: "panel",
      border: "subtle",
      rounded: "sm",
      p: 6,
    },
    variants: {},
  }),

  input: cva({
    base: {
      h: 9,
      px: 4,
      bg: "panel",
      border: "subtle",
      rounded: "sm",
      truncate: true,
      cursor: "auto",
      _focusVisible: { outline: "focus" },
    },
    variants: {
      variant: {
        default: {},
        filled: {
          bg: "background",
          border: "clear",
        },
        solid: {
          bg: "primary",
          border: "clear",
          color: "white",
        },
      },
    },
  }),
};

export const mergeRecipes = <T extends RecipeRuntimeFn<any>[]>(
  ...recipes: T
): RecipeRuntimeFn<T[number]["config"]["variants"]> => {
  const base = {} as any;
  const variants = {} as any;

  for (const recipe of recipes) {
    Object.assign(base, recipe.config.base);

    for (const key in recipe.config.variants) {
      variants[key] = variants[key] || {};

      for (const k2 in recipe.config.variants[key]) {
        variants[key][k2] = variants[key][k2] || {};

        Object.assign(variants[key][k2], recipe.config.variants[key][k2]);
      }
    }
  }

  console.log({
    base,
    variants,
  });

  return cva({
    base,
    variants,
  });
};

export const mergeRecipes2 = <
  R1 extends RecipeRuntimeFn<any>,
  R2 extends RecipeRuntimeFn<any>,
>(
  r1: R1,
  r2: R2,
) => {
  return (props: Parameters<R1>[0] & Parameters<R2>[0]) =>
    css(r1.raw(props), r2.raw(props));
};

export const mergeRecipes3 = <
  X1 extends RecipeVariantRecord,
  X2 extends RecipeVariantRecord,
  R1 extends RecipeRuntimeFn<X1>,
  R2 extends RecipeRuntimeFn<X2>,
>(
  r1: R1,
  r2: R2,
) => {
  return (props: DeepUnion<Parameters<R1>[0], Parameters<R2>[0]>) =>
    css(r1.raw(props as any), r2.raw(props as any));
};

const test = mergeRecipes3(recipes.input, recipes.test);

const Base = {
  control: css.raw({
    h: 9,
    px: 4,
    border: "subtle",
    bg: "panel",
    rounded: "sm",
    truncate: true,
    cursor: "pointer",
    _hover: { bg: "panel_hover" },
  }),
  input: css.raw({
    h: 9,
    px: 4,
    bg: "panel",
    border: "subtle",
    rounded: "sm",
    truncate: true,
    cursor: "auto",
    _focusVisible: { outline: "focus" },
  }),
};

const ControlVariants = {
  default: css.raw({}),
  filled: css.raw({
    bg: "background",
    border: "clear",
    _hover: { bg: "background_hover" },
  }),
  solid: css.raw({
    bg: "primary",
    border: "clear",
    color: "white",
    _hover: { bg: "primary_hover" },
  }),
};

const InputVariants = {
  default: css.raw({}),
  filled: css.raw({
    bg: "background",
    border: "clear",
  }),
};

export const ComponentSystem = {
  Base,

  InputVariants,
  ControlVariants,
};

export const getTransformedRecord = <
  T extends { [key: string]: any },
  FN extends <K extends keyof T>(value: T[K], key: K) => any,
  XX extends { [Key in keyof T]: ReturnType<FN> },
>(
  record: T,
  fn: FN,
) => {
  const result = {} as XX;

  Object.entries(record).map((entry) => {
    const key = entry[0] as keyof T;
    const value = entry[1] as T[keyof T];

    result[key] = fn(value, key);
  });

  return result;
};

export const getParts = <
  T extends { [key: string]: SystemStyleObject },
  X extends {
    [Key in keyof T & string as `& [data-part="${Key}"]`]: SystemStyleObject;
  },
>(
  input: T,
): X => {
  const result = {} as X;

  for (const [key, value] of Object.entries(input)) {
    (result as any)[`& [data-part="${key}"]`] = value;
  }

  console.log({ parts: result });

  return result;
};

export const createConstructedComponent = <T, X extends Record<string, any>>(
  root: T,
  components: X,
) => {
  for (const key in components) {
    (root as any)[key] = components[key];
  }

  return root as T & X;
};
