import { styled } from "@style/jsx";
import type { Doc } from "../../../../api/convex/_generated/dataModel";
import { createUniqueId } from "solid-js";

export const TaskCard = (props: { task: Doc<"task"> }) => {
  console.log("TASK CARD");

  const id = createUniqueId();

  return (
    <styled.div data-task-id={props.task._id} xPanel p={2}>
      Task
      {props.task.name}
    </styled.div>
  );
};
