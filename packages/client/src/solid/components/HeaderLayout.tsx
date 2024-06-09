import { styled } from "@style/jsx";
import { createConstructedComponent } from "./_ComponentStyleSystem";

const Root = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    gap: 1,
  },
});

const Left = styled("div", {
  base: {
    display: "grid",
    gap: 1,
    gridAutoFlow: "column",
  },
});

const Right = styled("div", {
  base: {
    display: "grid",
    gap: 1,
    gridAutoFlow: "column",
    justifyContent: "end",
  },
});

export const HorizontalLayout = createConstructedComponent(Root, {
  Left,
  Right,
});
