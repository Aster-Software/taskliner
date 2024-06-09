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
import { DraggableList } from "../components/DragAndDrop";

export const KanbanV2 = () => {
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

  return (
    <styled.div xPanel padding={4}>
      <Grid gap={4}>
        <styled.h3 textStyle="sm-heading">Pipeline</styled.h3>
        <DraggableList
          onAdd={(e) => {
            console.log("ADD", e);

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
          }}
        >
          <For each={tasks.data.filter((x) => x.status === props.status)}>
            {(task) => (
              <DraggableList.Draggable>
                <TaskCard task={task} />
              </DraggableList.Draggable>
            )}
          </For>
        </DraggableList>
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
