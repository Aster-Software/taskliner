import { createId } from "@paralleldrive/cuid2";
import { CreateRoute, CreateRouter } from "../utilities/ServerAPI";
import { database } from "./Database";

export const Router = CreateRouter({
    "/test": CreateRoute({
        handler: async () => {
            return "Hello ROUTER"
        }
    }),

    "/get-workspaces": CreateRoute({
        handler: async () => {
            return await database.selectFrom("workspace").selectAll().execute();
        }
    }),
    "/create-workspace": CreateRoute({
        handler: async () => {
            const result = await database.insertInto("workspace").values([
                {
                    id: createId(),
                    name: "Hello World",
                }
            ]).execute();

            return result.values()
        }
    }),

    "/get-projects": CreateRoute({
        handler: async () => {
            return await database.selectFrom("project").selectAll().execute();
        }
    }),
    "/get-tasks": CreateRoute({
        handler: async () => {
            return await database.selectFrom("task").selectAll().execute();
        }
    }),
})

export type RouterType = typeof Router;