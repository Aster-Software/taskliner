import { Float, styled } from "@style/jsx";
import { makeAutoObservable } from "mobx";
import {
  createContext,
  createEffect,
  createUniqueId,
  useContext,
  type JSXElement,
} from "solid-js";
import { createConstructedComponent } from "./_ComponentStyleSystem";

import { DraggableListStore, DragAndDropGlobalState } from "./DragAndDropStore";
import {
  assertIsDefined,
  createRef,
  getDomAncestors,
} from "../utilities/utils";

export const Root = (props: {
  onAdd?: (e: {}) => void;

  children?: JSXElement;
}) => {
  const state = DraggableListStore.create();

  return (
    <styled.div>
      <DraggableListStore.Provider value={state}>
        <styled.div
          id={state.id}
          ref={state.ref.set}
          display="grid"
          gap={2}
          minHeight="50px"
          onDragEnter={(e) => e.preventDefault()} // Necessary to make the div a drop zone
          onDragOver={(e) => e.preventDefault()} // Necessary to make the div a drop zone
          onDrop={(e) => {
            console.log("DROP");
          }}
        >
          {props.children}
        </styled.div>
      </DraggableListStore.Provider>

      <styled.div height="50px"></styled.div>
      <div>draggedOverIndex: {state.draggedOverIndex}</div>
      <div>children: {state.children.length}</div>
    </styled.div>
  );
};

const Draggable = (props: { children?: JSXElement }) => {
  const controller = DraggableListStore.useContext();

  assertIsDefined(controller);

  const state = makeAutoObservable({
    ref: createRef(),

    get index() {
      if (state.ref.el) {
        return controller.children.indexOf(state.ref.el);
      } else {
        return -1;
      }
    },
  });

  return (
    <styled.div
      id={createUniqueId()}
      ref={state.ref.set}
      position="relative"
      transition="transform 150ms"
      draggable
      onDragStart={(e) =>
        DragAndDropGlobalState.startDrag(e.currentTarget, controller.id)
      }
      onDragEnd={() => DragAndDropGlobalState.endDrag()}
      data-draggable-list-id={controller.id}
      data-draggable-item // Indicates that this is a draggable item
      data-draggable-index={state.index}
      data-draggable-original // Indicates that this is an original copy, not the clone
    >
      {props.children}

      <Float placement="middle-end">{state.index}</Float>
    </styled.div>
  );
};

export const DraggableList = createConstructedComponent(Root, {
  Draggable,
});
