import { makeAutoObservable } from "mobx";
import { createContext, useContext } from "solid-js";

export function assertIsDefined(value: unknown): asserts value {
  if (value === null) throw new Error("Assertion Error: null");
  if (value === undefined) throw new Error("Assertion Error: undefined");
}

export const createRef = () => {
  const state = makeAutoObservable({
    el: null as HTMLElement | null,
    set: (ref: null | HTMLElement) => (state.el = ref),
  });

  return state;
};

export const getDomAncestors = (el: Element) => {
  const ancestors = [];

  let current = el as Element | null;

  while (current) {
    ancestors.push(current);

    current = current.parentElement;
  }

  return ancestors;
};

export const insertChildAtIndex = (
  target: Element,
  child: Element,
  index: number,
) => {
  if (index >= target.children.length) {
    target.appendChild(child);
  } else {
    target.insertBefore(child, target.children[index]);
  }
};

export const createStoreWithContext = <T>(inst: () => T) => {
  const Context = createContext<T>();

  const useStoreContext = () => {
    const store = useContext(Context);

    assertIsDefined(store);

    return store;
  };

  return {
    create: inst,
    Provider: Context.Provider,
    useContext: useStoreContext,
    _type: undefined as T,
  };
};
