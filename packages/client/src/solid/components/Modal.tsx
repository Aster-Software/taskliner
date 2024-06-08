import { Dialog } from "@ark-ui/solid";
import { css } from "@style/css";
import { Stack, VStack } from "@style/jsx";
import { makeAutoObservable } from "mobx";
import type { JSXElement } from "solid-js";
import { Show } from "solid-js";
import { Portal } from "solid-js/web";

type ControllerProps = {};

const Root = (props: { children?: JSXElement }) => {
  const state = makeAutoObservable({
    isOpen: false,

    setIsOpen: (value: boolean) => (state.isOpen = value),
  });

  return (
    <Dialog.Root
      open={state.isOpen}
      onOpenChange={(e) => state.setIsOpen(e.open)}
    >
      {props.children}
    </Dialog.Root>
  );
};

const Trigger = (props: { children?: JSXElement }) => {
  return <Dialog.Trigger>{props.children}</Dialog.Trigger>;
};

const Content = (props: {
  title?: JSXElement;
  description?: JSXElement;

  w?: string;
  h?: string;

  children?: JSXElement;
}) => {
  return (
    <Portal>
      <Dialog.Backdrop
        class={css({ pos: "fixed", inset: 0, bg: "black", opacity: 0.2 })}
      />
      <Dialog.Positioner
        class={css({
          position: "fixed",
          inset: 0,
          display: "grid",
          alignContent: "center",
          justifyContent: "center",
        })}
      >
        <Dialog.Content
          class={css({
            position: "relative",
            w: props.w,
            h: props.h,
            bg: "white",
            p: 4,
            rounded: "sm",
          })}
        >
          <Stack gap={4} direction="column">
            <Show when={props.title}>
              <Dialog.Title class={css({ fontSize: "xl" })}>
                {props.title}
              </Dialog.Title>
            </Show>
            <Show when={props.description}>
              <Dialog.Description>{props.description}</Dialog.Description>
            </Show>
            {props.children}
          </Stack>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  );
};

export const Modal = {
  Root,
  Trigger,
  Content,
};
