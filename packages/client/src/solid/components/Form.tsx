import { Grid, HStack, styled } from "@style/jsx";
import { createConstructedComponent } from "./_ComponentStyleSystem";
import type { JSXElement } from "solid-js";
import { Button } from "./Button";

const Root = (props: {
  onSubmit?: (
    e: Event & {
      submitter: HTMLElement;
    } & {
      currentTarget: HTMLFormElement;
      target: Element;
    },
  ) => Promise<void>;
  children?: JSXElement;
}) => {
  return (
    <styled.form
      display="grid"
      gap={4}
      onSubmit={async (e) => {
        e.preventDefault();

        await props.onSubmit?.(e);
      }}
    >
      {props.children}
    </styled.form>
  );
};

const Title = styled("h2", {
  base: {
    textStyle: "sm-heading",
  },
});

const Footer = styled(
  HStack,
  {
    base: {},
  },
  {
    defaultProps: {
      justifyContent: "end",
    },
  },
);

const CancelButton = (props: { onClick?: () => {}; children?: JSXElement }) => {
  return (
    <Button type="button" onClick={props.onClick}>
      {props.children ?? "Cancel"}
    </Button>
  );
};

const SubmitButton = (props: { onClick?: () => {}; children?: JSXElement }) => {
  return (
    <Button type="submit" variant="solid" onClick={props.onClick}>
      {props.children ?? "Save"}
    </Button>
  );
};

export const Form = createConstructedComponent(Root, {
  Title,
  Footer,
  CancelButton,
  SubmitButton,
});
