import { action } from "@solidjs/router";
import { database } from "../../../api/src/core/database";
import { createId } from "@paralleldrive/cuid2"

export const createWorkspace = action(async (formData: FormData) => {
    "use server";

    console.log("Creating Workspace")

    await database.insertInto("workspace").values([
        {
            id: createId(),
            name: "Hello World",
        }
    ])
})