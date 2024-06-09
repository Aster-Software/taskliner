import { Grid, HStack, styled } from "@style/jsx";
import { Button } from "../components/Button";
import { TaskCard } from "./TaskCard";
import { Convex, createQuery } from "../utilities/ConvexUtils";
import { useWorkspaceId } from "./_PrimaryUtils";
import { api } from "../../../../api/convex/_generated/api";
import { makeAutoObservable } from "mobx";
import type { Doc } from "../../../../api/convex/_generated/dataModel";
import { DraggableList } from "../components/DragAndDrop";
import { LeftIcon } from "../components/Icon";
import { HorizontalLayout } from "../components/HeaderLayout";
import { IconButton } from "../components/IconButton";

export const KanbanV2 = () => {
  const workspace_id = useWorkspaceId();

  return (
    <Grid gap={4} columns={4}>
      <Column title="Backlog" status={undefined} />
      <Column title="On Deck" status={"on-deck"} />
      <Column title="In Progress" status={"is-progress"} />
      <Column title="Done" status={"done"} />
    </Grid>
  );
};

const Column = (props: { title: string; status: string | undefined }) => {
  const workspace_id = useWorkspaceId();
  const tasks = createQuery(api.task.get, { workspace_id });

  return (
    <styled.div>
      <Grid gap={2}>
        <HorizontalLayout>
          <HorizontalLayout.Left>
            <styled.h3 textStyle="sm-heading">{props.title}</styled.h3>
          </HorizontalLayout.Left>
          <HorizontalLayout.Right>
            <IconButton
              class="fas fa-plus"
              onClick={() =>
                Convex.mutation(api.task.create, {
                  workspace_id: workspace_id,
                  name: (Math.random() * 1000).toFixed(0),
                })
              }
            />
          </HorizontalLayout.Right>
        </HorizontalLayout>
        <DraggableList
          onAdd={(e) => {
            Convex.mutation(api.task.update, {
              workspace_id,
              task_id: e.payload._id,
              status: props.status,
            });
          }}
          items={tasks.data.filter((x) => x.status === props.status)}
          render={(task) => <TaskCard task={task} />}
        />
      </Grid>
    </styled.div>
  );
};
