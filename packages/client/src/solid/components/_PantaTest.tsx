import { cva } from "@style/css";
import { Grid, styled } from "@style/jsx";

import type {
  RecipeConfig,
  RecipeDefinition,
  RecipeRuntimeFn,
} from "@style/types";
import merge from "merge";
import { mergeRecipes } from "./_PandaUtils";
import { SelectInput } from "./SelectInput";
import { TextInput } from "./TextInput";
import { Button } from "./Button";

export const PandaTest = () => {
  return (
    <styled.div display="grid" gap="4">
      <styled.div textStyle="sm-heading">Panda Test</styled.div>
      <styled.div textStyle="md-heading">Panda Test</styled.div>
      <styled.div textStyle="lg-heading">Panda Test</styled.div>

      <Grid gridAutoFlow="column" justifyContent="start">
        <Button>Solid 2</Button>
        <Button>Solid 2</Button>
        <Button>Filled 2</Button>
      </Grid>
      <Grid gridAutoFlow="column" justifyContent="start">
        <Button>Solid 2</Button>
        <Button>Solid 2</Button>
        <Button>Filled 2</Button>
      </Grid>
      <Grid gridAutoFlow="column" justifyContent="start">
        <TextInput placeholder="Write Here..." />
        <TextInput placeholder="Write Here..." />
        <TextInput placeholder="Write Here..." />
      </Grid>
      <Grid gridAutoFlow="column" justifyContent="start">
        <TextInput disabled placeholder="Write Here..." />
        <TextInput disabled placeholder="Write Here..." />
        <TextInput disabled placeholder="Write Here..." />
      </Grid>
      <Grid gridAutoFlow="column" justifyContent="start">
        <SelectInput
          options={[
            { label: "React", value: "react" },
            { label: "Solid", value: "solid" },
            { label: "Vue", value: "vue" },
            { label: "Svelte", value: "svelte", disabled: true },
          ]}
        />
      </Grid>
    </styled.div>
  );
};
