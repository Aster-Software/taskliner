import { Container, HStack, VStack, styled } from "@style/jsx";
import { useContext, type ComponentProps } from "solid-js";
import { FormGroupContext } from "./FormGroup";
import { ComponentSystem } from "./_ComponentStyleSystem";

const Base = styled("input", {
  base: {
    xComponent: true,
    xSubtleFocus: true,
    display: "block",
    w: "100%",
  },
});

export const TextInput = (props: ComponentProps<typeof Base>) => {
  const id = useContext(FormGroupContext);

  return <Base type="text" id={id} {...props} />;
};
