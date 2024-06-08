import { createContext, createUniqueId, type JSXElement } from "solid-js";
import { LabelGroup } from "./FormComponents";
import { css } from "@style/css";

export const FormGroup = (props: { label?: string; children?: JSXElement }) => {
  const id = createUniqueId();

  return (
    <FormGroupContext.Provider value={id}>
      <div>
        <label for={id} class={css({ fontSize: "xs" })}>
          {props.label}
        </label>
        {props.children}
      </div>
    </FormGroupContext.Provider>
  );
};

export const FormGroupContext = createContext<string>();
