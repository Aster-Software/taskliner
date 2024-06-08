import { cva } from "@style/css";
import { Grid, styled } from "@style/jsx";

const button = {
  base: {
    h: 9,
    px: 4,
  },
  variants: {
    variant: {
      solid: { bg: "black", color: "white" },
      filled: { bg: "grey" },
    },
  },
};

const Button = styled("button", button);

export const PandaTest = () => {
  return (
    <styled.div padding={30} display="grid" gap={4}>
      <styled.div fontSize="lg">Panda Test</styled.div>

      <Grid gridAutoFlow="column" justifyContent="start">
        <Button>Default</Button>
        <Button variant="solid">Solid</Button>
        <Button variant="filled">Filled</Button>
      </Grid>
    </styled.div>
  );
};
