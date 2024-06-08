import { styled } from "@style/jsx";
import { ComponentSystem } from "./_ComponentStyleSystem";

export const IconButton = styled("button", {
  base: {
    ...ComponentSystem.Base.control,
    px: 0,
    w: 9,
    h: 9,
    display: "grid",
    alignContent: "center",
    justifyContent: "center",
  },
  variants: { variant: ComponentSystem.ControlVariants },
  defaultVariants: {},
});
