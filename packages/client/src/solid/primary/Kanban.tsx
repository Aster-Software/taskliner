import { Grid, HStack, styled } from "@style/jsx";
import {
  For,
  createEffect,
  createMemo,
  createRenderEffect,
  createUniqueId,
  onCleanup,
} from "solid-js";
import { Button } from "../components/Button";
import { TaskCard } from "./TaskCard";
import { Convex, createQuery } from "../utilities/ConvexUtils";
import { useWorkspaceId } from "./_PrimaryUtils";
import { api } from "../../../../api/convex/_generated/api";
import { smoothDnD } from "smooth-dnd";
import { autorun, makeAutoObservable, reaction, runInAction, toJS } from "mobx";
import Sortable from "sortablejs";
import { css } from "@style/css";
import type { Doc } from "../../../../api/convex/_generated/dataModel";

export const Kanban = () => {
  const workspace_id = useWorkspaceId();

  return (
    <Grid gap={4} columns={4}>
      <Column status={undefined} />
      <Column status={"on-deck"} />
      <Column status={"is-progress"} />
      <Column status={"done"} />
    </Grid>
  );
};

const dragstate = makeAutoObservable({
  current: null as null | Doc<"task">,

  setCurrent: (c: null | Doc<"task">) => {
    dragstate.current = c;
  },
});

const Column = (props: { status: string | undefined }) => {
  const workspace_id = useWorkspaceId();
  const tasks = createQuery(api.task.get, { workspace_id });

  const id = createUniqueId();

  console.log("RENDER COLUMN");

  const state = makeAutoObservable({
    sortable: null as Sortable | null,

    remount: () => {
      console.log("DRAGGABLE SETUP");

      state.sortable?.destroy();

      queueMicrotask(() => {
        const containerElement = document.getElementById(id)!;

        const sortable = Sortable.create(containerElement, {
          //   group: "tasks",
          animation: 150,
          ghostClass: css({ outline: "focus" }),

          group: {
            name: "tasks",
            pull: "clone",
            put: true,
            revertClone: true,

            // pull: true|false|["foo", "bar"]|'clone'|function — ability to move from the list. clone — copy the item, rather than move. Or an array of group names which the elements may be put in. Defaults to true.
            // put: true|false|["baz", "qux"]|function — whether elements can be added from other lists, or an array of group names from which elements can be added.
            // revertClone: boolean — revert cloned element to initial position after moving to a another list.
          },

          setData: (e, x) => {
            const task = tasks.data
              .filter((x) => x.status === props.status)
              .find((y) => y._id === x.dataset.taskId);

            console.log({ task });

            dragstate.setCurrent(task ?? null);
          },
          onAdd: (e) => {
            console.log("ADD", e);

            // e.item.remove();

            setTimeout(() => {
              if (dragstate.current) {
                Convex.mutation(api.task.update, {
                  workspace_id,
                  task_id: dragstate.current._id,
                  status: props.status,
                });

                dragstate.setCurrent(null);
              }
            }, 10);
          },
          onEnd: (e) => {
            console.log("END");

            // Remove the dragged item from dom
            e.item.remove();

            // dragstate.setCurrent(null);
          },
        });

        runInAction(() => (state.sortable = sortable));
      });
    },
  });

  const dispose = reaction(
    () => ({ isReady: tasks.isLoading === false, tasks: toJS(tasks.data) }),
    (data) => state.remount(),
    {
      fireImmediately: true,
      delay: 1,
    },
  );

  onCleanup(() => {
    dispose();

    state.sortable?.destroy();
  });

  return (
    <styled.div xPanel padding={4}>
      <Grid gap={4}>
        <styled.h3 textStyle="sm-heading">Pipeline</styled.h3>
        <Grid id={id} gap={1} alignContent="start" height="500px">
          <For each={tasks.data.filter((x) => x.status === props.status)}>
            {(task) => <TaskCard task={task} />}
          </For>
        </Grid>
        <HStack>
          <Button
            variant="solid"
            onClick={() =>
              Convex.mutation(api.task.create, {
                workspace_id: workspace_id,
                name: (Math.random() * 1000).toFixed(0),
              })
            }
          >
            Create Task
          </Button>
        </HStack>
      </Grid>
    </styled.div>
  );
};
