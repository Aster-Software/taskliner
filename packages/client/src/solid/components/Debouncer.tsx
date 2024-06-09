import { makeAutoObservable, runInAction, untracked } from "mobx";
import { createEffect, onCleanup, type JSXElement } from "solid-js";
import { createTimeout } from "../utilities/utils";

export const Debouncer = <T extends any = undefined>(props: {
  value: T;

  onChange?: (value: T) => void;
  debounce?: number; // ms
  children?: (p: { value: T; change: (value: T) => void }) => JSXElement;
}) => {
  const state = makeAutoObservable({
    value: untracked(() => props.value),
    timeout: createTimeout(),

    change: (value: T) => {
      state.value = value;

      state.timeout.set(
        () => props.onChange?.(state.value),
        props.debounce ?? 500,
      );
    },
  });

  createEffect(() => runInAction(() => (state.value = props.value)));

  return props.children?.(state);
};
