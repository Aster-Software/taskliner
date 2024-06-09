import { css } from "@style/css";
import { styled } from "@style/jsx";
import { grid } from "@style/patterns";

const Root = styled("div", {
  base: {
    display: "grid",
    position: "absolute",
    w: "100%",
    h: "100%",
    gridTemplateRows: "auto minmax(0, 1fr)",
  },
});

const Header = styled("div", {
  base: {},
});

const Content = styled("div", {
  base: {
    overflow: "auto",
  },
});

export const ContentWithHeaderLayout = {
  Root,
  Header,
  Content,
};
