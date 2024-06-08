import { Container, HStack, VStack, styled } from "@style/jsx";
import { useContext, type ComponentProps } from "solid-js";
import { FormGroupContext } from "./FormGroup";
import { ComponentSystem } from "./_ComponentStyleSystem";

const Base = styled(
  "input",
  {
    base: {
      h: 9,
      px: 4,
      bg: "panel",
      border: "subtle",
      rounded: "sm",
      truncate: true,
      cursor: "auto",
      _focusVisible: { outline: "focus" },
      display: "block",
      w: "100%",
    },
    variants: {
      variant: ComponentSystem.InputVariants,
    },
    defaultVariants: {},
  },
  {
    defaultProps: {
      type: "text",
    },
  },
);

export const TextInput = (props: ComponentProps<typeof Base>) => {
  const id = useContext(FormGroupContext);

  return <Base id={id} {...props} />;
};
