import { makeAutoObservable } from "mobx";
import {
  createContext,
  onCleanup,
  useContext,
  type JSXElement,
} from "solid-js";

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

export const createTimeout = () => {
  const state = makeAutoObservable({
    timeout: null as null | ReturnType<typeof setTimeout>,

    set: (fn: () => void, ms: number) => {
      if (state.timeout) clearTimeout(state.timeout);

      state.timeout = setTimeout(fn, ms);
    },
    clear: () => {
      if (state.timeout) clearTimeout(state.timeout);

      state.timeout = null;
    },
  });

  onCleanup(() => state.clear());

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

export const createStoreWithContext = <X extends (options: any) => any>(
  inst: X,
) => {
  type T = ReturnType<X>;

  const Context = createContext<T>();

  const useStoreContext = () => {
    const store = useContext(Context);

    assertIsDefined(store);

    return store;
  };

  return {
    create: inst,
    Provider: Context.Provider,
    Contextual: (props: { children?: (store: T) => JSXElement }) => {
      const store = useContext(Context);

      assertIsDefined(store);

      return props?.children?.(store);
    },
    useContext: useStoreContext,
    _type: undefined as T,
  };
};
