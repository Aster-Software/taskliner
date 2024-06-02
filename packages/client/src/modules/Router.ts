import { z } from "zod"

export const CreateRoute = <
    T_InputSchema extends z.ZodTypeAny,
    T_Result
>(options: {
    input: T_InputSchema,
    handler: () => Promise<T_Result>,
}) => {
    return options;
}

export const CreateRouter = <T_Router extends { [key: string]: ReturnType<typeof CreateRoute> }>(config: T_Router) => {
    return {
        config,

        routes: Object.values(config),
    }
}

const TestRoute = CreateRoute({
    input: z.object({}),
    handler: async () => {
        return "Hello World"
    }
})

export const Router = CreateRouter({
    "/test": TestRoute
});

export type RouterType = typeof Router;