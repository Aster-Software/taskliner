import { useParams } from "@solidjs/router";
import type { Id } from "../../../../api/convex/_generated/dataModel";

export const useWorkspaceId = () => {
  const params = useParams();
  const workspace_id = params.workspace_id as Id<"workspace">;

  return workspace_id;
};

export const useProjectId = () => {
  const params = useParams();
  const project_id = params.project_id as Id<"project">;

  return project_id;
};

export const useTaskId = () => {
  const params = useParams();
  const task_id = params.task_id as Id<"task">;

  return task_id;
};
