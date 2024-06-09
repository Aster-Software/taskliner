import { makeAutoObservable } from "mobx";
import {
  createRef,
  createStoreWithContext,
  getDomAncestors,
  insertChildAtIndex,
} from "../utilities/utils";
import {
  createEffect,
  createUniqueId,
  onCleanup,
  type JSXElement,
} from "solid-js";

export const G = makeAutoObservable({
  isDragging: false,
  draggingListID: "",
  draggingListIndex: -1,

  currentTarget: null as Element | null,
  currentClone: null as Element | null,

  currentListId: "",
  currentListIndex: -1,

  lists: new Map<string, DraggableListController>(),

  registerList: (list: DraggableListController) => {
    G.lists.set(list.id, list);
  },
  unregisterList: (list: DraggableListController) => {
    G.lists.delete(list.id);
  },

  startDrag: (element: Element, draggingListID: string) => {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.outline = "1px solid pink";
    delete clone.dataset.draggableOriginal; // Delete this data flag to know that it's a clone
    clone.before;

    G.isDragging = true;
    G.currentTarget = element;
    G.currentClone = clone;
    G.draggingListID = draggingListID;
    G.draggingListIndex = Number(clone.dataset.draggableIndex);

    setTimeout(() => {
      if (G.currentTarget instanceof HTMLElement) {
        G.currentTarget.style.display = "none";
      }
    });
  },
  commenceDrag: (currentListId: string, currentListIndex: number) => {
    // Abort if this group is not allowed
    const fromList = G.lists.get(G.draggingListID);
    const toList = G.lists.get(currentListId);

    if (fromList === undefined) return;
    if (toList === undefined) return;
    if (fromList.props.group !== toList.props.group) return;

    // Insert Clone
    if (
      G.currentListId !== currentListId ||
      G.currentListIndex !== currentListIndex
    ) {
      const list = document.getElementById(currentListId);

      if (list && G.currentClone) {
        const cloneIndex = [...list.children].indexOf(G.currentClone);
        const adjustment =
          cloneIndex !== -1 && cloneIndex < currentListIndex ? 1 : 0; // Adjust for the clone's current position in the list

        insertChildAtIndex(list, G.currentClone, currentListIndex + adjustment);
      }
    }

    G.currentListId = currentListId;
    G.currentListIndex = currentListIndex;
  },
  endDrag: () => {
    const fromList = G.lists.get(G.draggingListID);
    const toList = G.lists.get(G.currentListId);

    console.log({
      fromList,
      toList,
    });

    if (fromList && toList) {
      toList.props.onAdd?.({
        payload: fromList.props.items?.[G.draggingListIndex],
        fromList,
        fromIndex: G.draggingListIndex,
        toList,
        toIndex: G.currentListIndex,
      });
    }

    G.currentClone?.remove();

    if (G.currentTarget instanceof HTMLElement) {
      G.currentTarget.style.removeProperty("display");
    }

    G.isDragging = false;
    G.currentTarget = null;
    G.currentClone = null;
    G.draggingListID = "";

    G.currentListId = "";
    G.currentListIndex = -1;
  },
});

// Dragover Event
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

      if (listId) G.commenceDrag(listId, index + adjustment);
    } else {
      const list = ancestors.find(
        (x) => x instanceof HTMLElement && x.dataset.draggableList,
      );

      if (
        list &&
        [...list.children].filter(
          (x) => x instanceof HTMLElement && x.style.display !== "none",
        ).length === 0
      )
        G.commenceDrag(list.id, 0);
    }
  }
});

export const DraggableListStore = createStoreWithContext(
  (props: DraggableProps<any>) => {
    const state = makeAutoObservable({
      id: createUniqueId(),
      ref: createRef(),

      children: [] as Element[],
      draggedOver: false,
      draggedOverIndex: -1,

      props,

      reconstruct: () => {
        if (state.ref.el) {
          state.children = [...state.ref.el.children].filter(
            (x) => x instanceof HTMLElement && x.dataset.draggableOriginal,
          );
        }
      },
    });

    // Register Grid
    createEffect(() => {
      G.registerList(state);

      onCleanup(() => G.unregisterList(state));
    });

    // Observe DOM Children
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
  },
);

export type DraggableListController = typeof DraggableListStore._type;

export type DraggableProps<T> = {
  group?: string;

  onAdd?: (p: {
    payload: any;
    fromIndex: any;
    fromList: DraggableListController;
    toIndex: any;
    toList: DraggableListController;
  }) => void;

  items?: T[];
  render?: (item: T, index: number) => JSXElement;
  children?: JSXElement;
};
