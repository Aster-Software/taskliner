import { styled } from "@style/jsx";
import type { Doc } from "../../../../api/convex/_generated/dataModel";
import { createUniqueId } from "solid-js";
import { A } from "@solidjs/router";
import { useProjectId, useWorkspaceId } from "./_PrimaryUtils";
import { Modal } from "../components/Modal";
import { TaskSettingsForm } from "./TaskSettingsForm";

export const TaskCard = (props: { task: Doc<"task"> }) => {
  console.log("TASK CARD");

  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();

  return (
    <Modal.Root>
      <Modal.Contextual>
        {(modal) => (
          <styled.button
            data-task-id={props.task._id}
            xBlock
            xPanel
            xComponentClickable
            p={2}
            onClick={() => modal.setIsOpen(true)}
          >
            {props.task.name || (
              <styled.div color="placeholder_text">Untitled Task</styled.div>
            )}
          </styled.button>
        )}
      </Modal.Contextual>
      <Modal.Content title="Task" w="500px" h="600px">
        <TaskSettingsForm task={props.task} />
      </Modal.Content>
    </Modal.Root>
  );
};
