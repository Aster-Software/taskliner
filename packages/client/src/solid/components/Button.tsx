// import { styled } from "./_StyledComponent";
// import { recipes } from "./_VanillaExtract.css";
// import { mergeRecipes } from "./_VanillaExtractRecipes.css";

import { styled } from "@style/jsx";
import {
  ComponentBaseDefaultClickable,
  ComponentBasePrimaryClickable,
  ComponentBaseSubtleClickable,
} from "./_PandaUtils";

export const Button = styled("button", {
  base: {
    xComponent: true,
    xComponentClickable: true,
  },
});
