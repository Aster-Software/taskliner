import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

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

export interface XEvent {
  action: string | null;
  data: Json | null;
  target_id: string | null;
  timestamp: Timestamp;
  type: string | null;
  version: Generated<Int8>;
}

export interface XObject {
  created_timestamp: Timestamp;
  data: Generated<Json>;
  deleted: Generated<boolean>;
  id: string;
  updated_timestamp: Timestamp;
}

export interface DB {
  project: Project;
  task: Task;
  workspace: Workspace;
  x_event: XEvent;
  x_object: XObject;
}
