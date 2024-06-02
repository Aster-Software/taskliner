import { z } from "zod";
import { database } from "../core/Database.js";
import { DB } from "../core/DatabaseTypes.js";
import { SelectQueryBuilder, Selectable } from "kysely";
import { Query } from "pg";

type ColumnV3Type = "int4" | "float4" | "bool" | "text";
type InputV3Type = "number" | "string" | "boolean";

type ColumnType<T extends ColumnV3<any>> = z.infer<T["schema"]>;



// ---

class RouterV3<T extends { [key: string]: ResourceV3<any> }> {
    config: T

    constructor(config: T) {
        this.config = config
    }

    // getRoutes() {
    //     const result = {} as 
    //         { [Property in keyof T as Property extends string ? `/api/resource/${Property}/get-one` : never]: RouteV3<T[Property]["inputSchema"], ""> } &
    //         { [Property in keyof T as Property extends string ? `/api/resource${Property}/get-many` : never]: RouteV3<T[Property]["inputSchema"], ""> };

    //     return result;
    // }
}

export class ResourceV3<T extends { [key: string]: ColumnV3<any> }> {
    config: T;

    _types: {
        _resource: {
            id: string;
            x_created_time: string;
            x_updated_time: string;
            data: { [Key in keyof T]: ColumnType<T[Key]> }
        }
    } = undefined as any;

    constructor(options: { config: T }) {
        this.config = options.config;
    }

    async getOne(input: QueryInput[]) {
        const qb = database.selectFrom("x_object").selectAll()
        
        const addInputToQuery = <T extends SelectQueryBuilder<any, any, any>>(qb: T, i: QueryInput) => {
            if (i.operation === "and") return;

            qb.where(`"data"->"${i.column}"`, i.operation, i.value)
        }

        input.forEach(i => addInputToQuery(qb, i))

        return await qb.limit(1).executeTakeFirstOrThrow();
    }

    async getMany(input: QueryInput[]) {
        const qb = database.selectFrom("x_object").selectAll()
        
        const addInputToQuery = <T extends SelectQueryBuilder<any, any, any>>(qb: T, i: QueryInput) => {
            if (i.operation === "and") return;

            qb.where(`"data"->"${i.column}"`, i.operation, i.value)
        }

        input.forEach(i => addInputToQuery(qb, i))

        return await qb.execute()
    }

    async createOne(input: { [Property in keyof T]: z.infer<T[Property]["schema"]> }) {}
    async updateOne(input: { [Property in keyof T]: z.infer<T[Property]["schema"]> }) {}
    async deleteOne(input: { [Property in keyof T]: z.infer<T[Property]["schema"]> }) {}
}

class ColumnV3<SchemaType extends z.ZodTypeAny> {
    schema: SchemaType

    constructor(options: { schema: SchemaType }) {
        this.schema = options.schema
    }
}

class InputV3<Schema extends z.ZodTypeAny> {
    schema: Schema

    constructor(options: {
        schema: Schema
    }) {
        this.schema = options.schema;
    }

    parse(value: any) {
        return this.schema.parse(value)
    }
}

class RouteV3<TInput extends z.ZodTypeAny, TResult> {
    inputSchema: TInput;
    handler: () => Promise<TResult>;

    constructor(options: {
        inputSchema: TInput,
        handler: () => Promise<TResult>,
    }) {
        this.inputSchema = options.inputSchema;
        this.handler = options.handler
    }
}

const Columns = {
    String: new ColumnV3({ schema: z.string() }),
    Number: new ColumnV3({ schema: z.number() }),
    Boolean: new ColumnV3({ schema: z.boolean() }),
}

const TestWorkspaceResource = new ResourceV3({
    config: {
        name: Columns.String,
    },
});

const TestProjectResource = new ResourceV3({
    config: {
        workspace_id: Columns.String,
        name: Columns.String,
    }
})

// await TestWorkspaceResource.getMany({})
// await TestProjectResource.getMany({ workspace_id: "test" })

export const TestRouter = new RouterV3({
    workspace: TestWorkspaceResource,
    project: TestProjectResource
});

export type RouterType = typeof TestRouter;

export type QueryInput = {
    operation: "=" | ">" | "<",
    column: string,
    value: string,
} | {
    operation: "and",
    clauses: QueryInput[]
}