import { cva } from "@style/css";
import { styled } from "@style/jsx";
import { BorderStyle } from "./Style";

export const TextInput = styled("input", {
  base: {
    display: "block",
    width: "100%",
    px: 5,
    py: 2,
  },
});

export const LabelGroup = styled("label", {
  base: {
    display: "block",
    width: "100%",
    ...BorderStyle,
  },
});
