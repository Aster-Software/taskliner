import { EsormColumn, EsormDatabase, EsormObject } from "esorm";
import { database } from "./core/Database.js";
import { DB } from "./core/DatabaseTypes.js";
import { createId } from "@paralleldrive/cuid2";

export const esormDB = new EsormDatabase<DB>({
    connection: database as any,
    routes: {
        workspace: {},
    }
});

const workspaces = await esormDB.getMany("workspace");

console.log("WORKSPACES:", workspaces)
