import { cva } from "@style/css";
import { Grid, styled } from "@style/jsx";

import type {
  RecipeConfig,
  RecipeDefinition,
  RecipeRuntimeFn,
} from "@style/types";
import merge from "merge";
import { control, control_hoverable, input } from "./_PandaRecipes";
import { mergeRecipes } from "./_PandaUtils";

const t1 = mergeRecipes(control.config, control_hoverable.config);

const B = styled("button", control);

const Button = styled("button");
const TextInput = styled("input", input);

export const PandaTest = () => {
  return (
    <styled.div padding={30} display="grid" gap={4}>
      <styled.div fontSize="lg">Panda Test</styled.div>

      <Grid gridAutoFlow="column" justifyContent="start">
        <B>Solid 2</B>
        <B variant="primary">Solid 2</B>
        <B variant="subtle">Filled 2</B>
      </Grid>
      <Grid gridAutoFlow="column" justifyContent="start">
        <B>Solid 2</B>
        <B variant="primary">Solid 2</B>
        <B variant="subtle">Filled 2</B>
      </Grid>
      <Grid gridAutoFlow="column" justifyContent="start">
        <TextInput placeholder="Write Here..." />
        <TextInput variant="primary" placeholder="Write Here..." />
        <TextInput variant="subtle" placeholder="Write Here..." />
      </Grid>
      <Grid gridAutoFlow="column" justifyContent="start">
        <TextInput disabled placeholder="Write Here..." />
        <TextInput disabled variant="primary" placeholder="Write Here..." />
        <TextInput disabled variant="subtle" placeholder="Write Here..." />
      </Grid>
    </styled.div>
  );
};
