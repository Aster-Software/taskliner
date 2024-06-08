import { styled } from "@style/jsx";
import { ComponentSystem } from "./_ComponentStyleSystem";

export const Button = styled("button", {
  base: ComponentSystem.Base.input,
  variants: { variant: ComponentSystem.ControlVariants },
  defaultVariants: {},
});
