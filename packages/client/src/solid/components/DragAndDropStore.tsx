import { makeAutoObservable } from "mobx";
import {
  createRef,
  createStoreWithContext,
  getDomAncestors,
  insertChildAtIndex,
} from "../utilities/utils";
import { createEffect, createUniqueId } from "solid-js";

export const DragAndDropGlobalState = makeAutoObservable({
  isDragging: false,
  draggingListID: "",

  currentTarget: null as Element | null,
  currentClone: null as Element | null,

  currentListId: "",
  currentListIndex: -1,

  startDrag: (element: Element, draggingListID: string) => {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.outline = "5px solid pink";
    delete clone.dataset.draggableOriginal; // Delete this data flag to know that it's a clone
    clone.before;

    DragAndDropGlobalState.isDragging = true;
    DragAndDropGlobalState.currentTarget = element;
    DragAndDropGlobalState.currentClone = clone;
    DragAndDropGlobalState.draggingListID = draggingListID;

    setTimeout(() => {
      if (DragAndDropGlobalState.currentTarget instanceof HTMLElement) {
        DragAndDropGlobalState.currentTarget.style.display = "none";
      }
    });
  },
  commenceDrag: (currentListId: string, currentListIndex: number) => {
    // Insert Clone
    if (
      DragAndDropGlobalState.currentListId !== currentListId ||
      DragAndDropGlobalState.currentListIndex !== currentListIndex
    ) {
      const list = document.getElementById(currentListId);

      if (list && DragAndDropGlobalState.currentClone) {
        const cloneIndex = [...list.children].indexOf(
          DragAndDropGlobalState.currentClone,
        );
        const adjustment =
          cloneIndex !== -1 && cloneIndex < currentListIndex ? 1 : 0; // Adjust for the clone's current position in the list

        insertChildAtIndex(
          list,
          DragAndDropGlobalState.currentClone,
          currentListIndex + adjustment,
        );
      }
    }

    DragAndDropGlobalState.currentListId = currentListId;
    DragAndDropGlobalState.currentListIndex = currentListIndex;
  },
  endDrag: () => {
    DragAndDropGlobalState.currentClone?.remove();

    if (DragAndDropGlobalState.currentTarget instanceof HTMLElement) {
      DragAndDropGlobalState.currentTarget.style.removeProperty("display");
    }

    DragAndDropGlobalState.isDragging = false;
    DragAndDropGlobalState.currentTarget = null;
    DragAndDropGlobalState.currentClone = null;
    DragAndDropGlobalState.draggingListID = "";

    DragAndDropGlobalState.currentListId = "";
    DragAndDropGlobalState.currentListIndex = -1;
  },
});

window.addEventListener("dragover", (e) => {
  if (e.target instanceof Element) {
    const ancestors = getDomAncestors(e.target);

    // TODO: Account for zero items

    const item = ancestors.find(
      (x) =>
        x instanceof HTMLElement &&
        x.dataset.draggableItem &&
        x.dataset.draggableOriginal,
    );

    if (item && item instanceof HTMLElement) {
      const listId = item.dataset.draggableListId;
      const index = Number(item.dataset.draggableIndex);

      const rect = item.getBoundingClientRect();
      const adjustment = e.clientY < rect.top + rect.height / 2 ? 0 : 1;

      if (listId)
        DragAndDropGlobalState.commenceDrag(listId, index + adjustment);
    }
  }
});

export const DraggableListStore = createStoreWithContext(() => {
  const state = makeAutoObservable({
    id: createUniqueId(),
    ref: createRef(),

    children: [] as Element[],
    draggedOver: false,
    draggedOverIndex: -1,

    reconstruct: () => {
      if (state.ref.el) {
        state.children = [...state.ref.el.children].filter(
          (x) => x instanceof HTMLElement && x.dataset.draggableOriginal,
        );
      }
    },
  });

  createEffect(() => {
    if (state.ref.el) {
      state.reconstruct();

      const observer = new MutationObserver((change) => {
        state.reconstruct();
      });

      observer.observe(state.ref.el, {
        childList: true,
      });
    }
  });

  return state;
});
