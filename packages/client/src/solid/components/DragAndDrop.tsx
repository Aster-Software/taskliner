import { Center, Float, styled } from "@style/jsx";
import { makeAutoObservable } from "mobx";
import { For, Show, createUniqueId, type JSXElement } from "solid-js";
import { createConstructedComponent } from "./_ComponentStyleSystem";

import { DraggableListStore, G, type DraggableProps } from "./DragAndDropStore";
import { assertIsDefined, createRef } from "../utilities/utils";
import { Fill } from "./Fill";

export const Root = <T extends any>(props: DraggableProps<T>) => {
  const controller = DraggableListStore.create(props);

  return (
    <DraggableListStore.Provider value={controller}>
      <styled.div position="relative">
        <styled.div
          id={controller.id}
          ref={controller.ref.set}
          display="grid"
          alignItems="start"
          gap={0.5}
          minHeight={G.isDragging ? "50px" : "0px"}
          onDragEnter={(e) => e.preventDefault()} // Necessary to make the div a drop zone
          onDragOver={(e) => e.preventDefault()} // Necessary to make the div a drop zone
          data-draggable-list
        >
          <For each={controller.props.items}>
            {(item, index) => (
              <Draggable index={index()}>
                {controller.props.render?.(item, index())}
              </Draggable>
            )}
          </For>
        </styled.div>
        {props.children}
      </styled.div>
    </DraggableListStore.Provider>
  );
};

const Draggable = (props: { index: number; children?: JSXElement }) => {
  const controller = DraggableListStore.useContext();

  assertIsDefined(controller);

  const state = makeAutoObservable({
    ref: createRef(),
  });

  return (
    <styled.div
      id={createUniqueId()}
      ref={state.ref.set}
      position="relative"
      transition="transform 150ms"
      draggable
      onDragStart={(e) => G.startDrag(e.currentTarget, controller.id)}
      onDragEnd={() => G.endDrag()}
      data-draggable-list-id={controller.id}
      data-draggable-item // Indicates that this is a draggable item
      data-draggable-index={props.index}
      data-draggable-original // Indicates that this is an original copy, not the clone
    >
      {props.children}
    </styled.div>
  );
};

const Fallback = (props: { children?: JSXElement }) => {
  const controller = DraggableListStore.useContext();

  assertIsDefined(controller);

  return (
    <Show when={!controller.props.items?.length && !G.isDragging}>
      <Fill>{props.children}</Fill>
    </Show>
  );
};

export const DraggableList = createConstructedComponent(Root, {
  Fallback,
});
