import { styled } from "@style/jsx";

export const Button = styled("button", {
  base: {
    xComponent: true,
    xComponentClickable: true,
  },
  variants: {
    variant: {
      solid: {
        bg: "primary",
        color: "canvas",
        _hover: {
          bg: "primary_hover",
        },
      },
      subtle: {
        bg: "transparent",
      },
    },
  },
});
