import type { ColumnType } from "kysely";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Project {
  creation_time: Timestamp | null;
  deadline_end: Timestamp | null;
  deadline_start: Timestamp | null;
  id: string;
  name: string | null;
  workspace_id: string;
}

export interface Task {
  creation_time: Timestamp | null;
  deadline_end: Timestamp | null;
  deadline_start: Timestamp | null;
  id: string;
  name: string | null;
  project_id: string;
}

export interface Workspace {
  creation_time: Timestamp | null;
  id: string;
  name: string | null;
}

export interface DB {
  project: Project;
  task: Task;
  workspace: Workspace;
}
