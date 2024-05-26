import { z } from "zod";

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

export const CreateRoute = <
    ResponseType,
    VariablesSchemaType extends z.ZodTypeAny,
>(
    options: {
        variables?: VariablesSchemaType,
        handler: (params: {
            context: any,
            variables: z.infer<VariablesSchemaType>
        }) => Promise<ResponseType>
    }
) => {
    return {
        ...options,
        _types: {
            _variables: undefined as z.infer<VariablesSchemaType>,
            _result: undefined as ResponseType,
        }
    }
}

export const CreateRouter = <RouterType extends { [key: string]: ReturnType<typeof CreateRoute> }>(routes: RouterType) => {
    return routes;
}