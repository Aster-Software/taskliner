import type { ComplexStyleRule } from "@vanilla-extract/css";
import type {
  RecipeVariants,
  RuntimeFn,
  recipe,
} from "@vanilla-extract/recipes";
import {
  splitProps,
  type Component,
  type ComponentProps,
  type JSX,
} from "solid-js";
import { Dynamic } from "solid-js/web";

type RecipeStyleRule = ComplexStyleRule | string;
type VariantDefinitions = Record<string, RecipeStyleRule>;
type BooleanMap<T> = T extends "true" | "false" ? boolean : T;
type VariantGroups = Record<string, VariantDefinitions>;

type RecipeRuntimeFn = ReturnType<typeof recipe>;
type VariantsArg<R> = R extends RecipeRuntimeFn ? Parameters<R>[0] : never;

export const styled = <R extends () => void>(
  element: keyof JSX.IntrinsicElements,
  recipe?: R,
) => {
  const variants = (recipe as any)?.variants() ?? [];

  const Component = (
    props: ComponentProps<typeof element> | VariantsArg<R>,
  ) => {
    const [local, others] = splitProps(props as any, variants as any);

    return (
      <Dynamic
        component={element}
        {...others}
        class={(others as any).class + " " + (recipe as any)?.(local)}
      />
    );
  };

  return Component;
};

const T1 = styled("button");

const Test = () => <T1 style={{ "font-size": "blue" }}></T1>;
