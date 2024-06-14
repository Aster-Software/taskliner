import { Esorm, EsormTypes } from "esorm";
import { Environment } from "./core/Environment.js";
import { config } from "dotenv";
import { createId } from "@paralleldrive/cuid2";

config();

const password = process.env.ATLAS_PASSWORD;
const mongodb_db = "test";
const mongodb_url = `mongodb+srv://jaekwak02:${password}@taskliner-test.rknmnru.mongodb.net/?retryWrites=true&w=majority&appName=taskliner-test`;

export const esorm = await Esorm({
  port: 4000,
  mongodb_db,
  mongodb_url,
  schema: {
    workspace: {
      relations: {},
      properties: {
        name: EsormTypes.string,
      },
    },
    task: {
      relations: {},
      properties: {
        name: EsormTypes.string,
        description: EsormTypes.string,
        status: EsormTypes.string,
      },
    },
  },
});

export type EsormType = typeof esorm;

export const test = async () => {
  console.log("Starting Esorm Test...");

  // await esorm.apply_operation({
  //   operation: "create",
  //   type: "workspace",
  //   id: createId(),
  //   data: {
  //     name: `Heller World ${(Math.random() * 1000).toFixed()}`,
  //   },
  // });

  esorm.apply_operations([
    // {
    //   operation: "update",
    //   type: "workspace",
    //   id: "none",
    //   column: "name",
    //   value: "Workspace 2",
    // },
    // {
    //   operation: "update",
    //   type: "workspace",
    //   id: "t431s5zipquyyhsdf5vmc4yf",
    //   column: "description",
    //   value: "This is a description of the project",
    // },
    // {
    //   operation: "update",
    //   type: "workspace",
    //   id: "t431s5zipquyyhsdf5vmc4yf",
    //   column: "status",
    //   value: "dormant",
    // },
  ]);

  const workspaces = await esorm.getMany({ type: "workspace" });
  const tasks = await esorm.getMany({ type: "task" });

  console.log({
    workspaces,
    tasks,
  });

  console.log("Finished Esorm Test!");
};
