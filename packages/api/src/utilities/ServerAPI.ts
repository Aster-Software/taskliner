import { z } from "zod";
import { getLookupTable } from "./Utilities";

// queries -> CreateQueryRoute
// actions -> CreateActionRoute
// 
// data is normalized as resources.
// - a resource has a type and an ID
// - nested resources are not allowed. normalize it.
// - a single query returns a single resource type only.
// 
// actions may specify which resources they modify.
// - in which case, the resources will automatically refetch...?
// 
// actions emit events.
// - the event defines which resource is changing.
// - the event is used by the server to broadcast changes to all clients that have that resource currently loaded.
//
// Notes and Observations Through Experience
// - Cache and API separation is necessary. Strongly tying the two together creates bountiful complexity.
// - API result must indicate the resource type. This is necessary for the cache to work automatically.
// 
// Event Table
// resource_name: string;
// resource_id: string;
// updated_at: timestamp;
// version: int;    

type Resource<TypeOfResource, TypeOfQuery extends z.ZodTypeAny> = ReturnType<typeof CreateResource<TypeOfResource>>;
type ResourceDictionary<TypeOfDictionary extends { [key: string]: Resource<any, any> }> = ReturnType<typeof CreateResourceDictionary<TypeOfDictionary>>;

export const CreateResource = <TypeOfResource>(options: {
    getID: (item: TypeOfResource) => string,
    onCreate: (t: TypeOfResource) => void;
    onUpdate: (t: TypeOfResource) => void;
    onDelete: (t: TypeOfResource) => void;
}) => {
    return {
        ...options,

        writeResultArray: (array: TypeOfResource[]) => {
            const ids = array.map(x => options.getID(x));
            const lookup = getLookupTable(array, x => options.getID(x));

            return {
                _result_type: "array" as const,
                ids: ids,
                data: array,
            }
        },
        writeResultItem: (item: TypeOfResource) => {
            const id = options.getID(item);

            return {
                _result_type: "object" as const,
                id,
                data: item
            }
        },

        /** Emit a mutation event */
        emit: (params: {
            action: "create" | "update" | "delete",
            data: TypeOfResource
        }) => {},

        _types: {
            _resource: undefined as any as TypeOfResource,
        }
    };
}

export const CreateResourceDictionary = <TypeOfDictionary extends { [key: string]: Resource<any, any> }>(options: TypeOfDictionary) => {
    return {
        ...options,
        _types: {}
    }
}

export const CreateRoute = <
    ResponseType,
    ResultType extends "none" | "array" | "object",
    InputSchemaType extends z.ZodTypeAny,
    TResource extends Resource<any, any> | void = void
>(
    options: {
        type: "query" | "mutation";
        resource?: TResource,
        input?: InputSchemaType,
        handler: (params: {
            context: any,
            input: z.infer<InputSchemaType>,
            resource: TResource
        }) => Promise<{
            _result_type: ResultType;
            ids: string[],
            data: ResponseType[]
        } | void>
    }
) => {
    return {
        ...options,
        _types: {
            _input: undefined as z.infer<InputSchemaType>,
            _result: undefined as ResponseType,
            _result_type: undefined as any as ResultType,

            _final_result_type: undefined as any as ResultType extends "array" ? ResponseType[] : ResponseType
        }
    }
}

export const CreateRouter = <RouterType extends { [key: string]: ReturnType<typeof CreateRoute> }>(routes: RouterType) => {
    return routes;
}

export const writeResult = <T>(data?: T) => {
    return {
        _result_type: "none" as const,
        ids: [""],
        data: [data]
    }
}