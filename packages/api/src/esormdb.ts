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
        description: EsormTypes.string,
        status: EsormTypes.string,
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

  const workspaces = await esorm.getMany({ type: "workspace" });
  const tasks = await esorm.getMany({ type: "task" });

  console.log({
    workspaces,
    tasks,
  });

  console.log("Finished Esorm Test!");
};
