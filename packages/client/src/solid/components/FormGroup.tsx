import { createContext, createUniqueId, type JSXElement } from "solid-js";
import { css } from "@style/css";
import { styled } from "@style/jsx";

export const FormGroup = (props: { label?: string; children?: JSXElement }) => {
  const id = createUniqueId();

  return (
    <FormGroupContext.Provider value={id}>
      <div>
        <styled.label for={id} fontSize="xs">
          {props.label}
        </styled.label>
        {props.children}
      </div>
    </FormGroupContext.Provider>
  );
};

export const FormGroupContext = createContext<string>();
