import { Generated, Selectable } from "kysely";
import { CreateResource, CreateResourceDictionary } from "../utilities/ServerAPI";
import { DB } from "./DatabaseTypes";

export const Resources = CreateResourceDictionary({
    workspace: CreateResource({
        getID: (item: Selectable<DB["workspace"]>) => item.id,
        onCreate: () => {},
        onUpdate: () => {},
        onDelete: () => {},
    }),
    // project: CreateResource<DB["project"]>({
    //     onCreate: ()
    // }),
    // task: CreateResource<DB["task"]>({
    //     onCreate: ()
    // }),
})