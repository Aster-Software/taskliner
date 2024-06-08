import { Toast, Toaster, createToaster } from "@ark-ui/solid";
import { styled } from "@style/jsx";
import { BorderStyle } from "./Style";
import { css } from "@style/css";

export const ToasterController = createToaster({
  gap: 24,
  placement: "bottom-end",
  overlap: true,
  duration: 10000,
});

export const ToasterManager = () => {
  return (
    <Toaster toaster={ToasterController}>
      {(toast) => (
        <Toast.Root
          class={css({
            padding: 3,
            bg: "blue",
            ...BorderStyle,
          })}
        >
          <Toast.Title class={css({ bg: "blue" })}>{toast().title}</Toast.Title>
          <Toast.Description>{toast().description}</Toast.Description>
          <Toast.ActionTrigger>Do Action</Toast.ActionTrigger>
          <Toast.CloseTrigger>X</Toast.CloseTrigger>
        </Toast.Root>
      )}
    </Toaster>
  );
};

const StyledToast = {
  Root: styled(Toast.Root, {
    base: {
      padding: 3,
      ...BorderStyle,
      bg: "blue",
    },
  }),
};
