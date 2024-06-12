import { Esorm } from "esorm";
import { PostgresDialect } from "kysely";
import pg from "pg";
import { Environment } from "./core/Environment.js";
import { config } from "dotenv";
import { database } from "./core/Database.js";
import { createId } from "@paralleldrive/cuid2";

config();

export const esorm = Esorm(
  {
    workspace: {
      relations: {},
      properties: {
        name: { type: "string" },
      },
    },
    task: {
      relations: {},
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        status: { type: "string" },
      },
    },
  },
  database as any,
);

export const test = async () => {
  console.log("Starting Esorm Test...");

  const workspaces = await esorm.get("workspace");
  const tasks = await esorm.get("task");

  console.log(
    "T1",
    workspaces.map((x) => x.data.name),
  );

  const id = createId();

  await esorm.apply_operations([
    { operation: "delete", type: "workspace", id: workspaces[0].id },
    { operation: "create", type: "workspace", id },
    { operation: "update", type: "workspace", id, path: ["name"], value: (Math.random() * 1000).toFixed() },
  ]);

  const w2 = await esorm.get("workspace");

  console.log(
    "T2",
    w2.map((x) => x.data.name),
  );
};
