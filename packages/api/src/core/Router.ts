import { createId } from "@paralleldrive/cuid2";
import { CreateRoute, CreateRouter, writeResult } from "../utilities/ServerAPI.js";
import { database } from "./Database.js";
import { Resources } from "./Resources.js";

export const Router = CreateRouter({
    "/test": CreateRoute({
        type: "query",
        handler: async () => {
            return writeResult("Hello ROUTER")
        }
    }),

    "/get-workspaces": CreateRoute({
        type: "query",
        handler: async () => {
            const result = await database.selectFrom("workspace").selectAll().execute();

            return Resources.workspace.writeResultArray(result);
        }
    }),

    "/create-workspace": CreateRoute({
        type: "mutation",
        handler: async () => {
            const result = await database.insertInto("workspace").values([
                {
                    id: createId(),
                    name: "Hello World",
                }
            ]).returningAll().execute();

            Resources.workspace.emit({
                action: "create",
                data: result[0],
            });
        }
    }),

    "/get-projects": CreateRoute({
        type: "query",
        handler: async () => {
            const result = await database.selectFrom("project").selectAll().execute();

            return writeResult(result);
        }
    }),
    "/get-tasks": CreateRoute({
        type: "query",
        handler: async () => {
            const result = await database.selectFrom("task").selectAll().execute();

            return writeResult(result)
        }
    }),
})

export type RouterType = typeof Router;
export type RouterInputType<Path extends keyof RouterType> = RouterType[Path]["_types"]["_input"]
export type RouterResultType<Path extends keyof RouterType> = RouterType[Path]["_types"]["_result"]