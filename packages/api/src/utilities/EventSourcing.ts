// Maybe New Method...?
// 
// Event sourcing. EVERYTHING that happens in the system is an event.
// - Using Data Driven Design (DDD). EVERYTHING is data (any kind of action, etc);
// - Every resource is its own type.
// 
// Aggregate:
//   getType: (x: T) => string                        <-- aggregate Type
//   getID: (x: T) => string                          <-- aggregate ID
//   getAuthorizedFor: (x: T, context) => boolean     <-- use this to build authorization into any resource (OR NOT. MAYBE DO THIS ON QUERIES AND ACTIONS INSTEAD)
//   
// Query:
//   input: TInput
//   process: (input: TInput, context) => any,        <-- use this to authorize and get vital context information
//   execute: () => T
// 
// Action:
//   input: TInput
//   process: (input: TInput, context) => any,        <-- use this to authorize and get vital context information
//   execute: () => Event(s)                          <-- events hold all changes to the system. an action does not necessarily need to emit events. the change can be external.
//
// Resource:
//   getOne: () => T
//   getMany: (input: TInput) => T[]
//   deleteOne: () => void;
//   updateOne: () => void;
// 
// Event:
//   type: string;
//   id: string;
//   path: string[]
//   input: any;

// 1. Clients can create objects
// 2. Clients get realtime updates on objects
// 3. Clients can edit objects offline and upload updates when they are back online
// 4. The API defines queries
// 5. Queries are defined in custom SQL
// 6. Queries can efficiently update themselves


import { SelectQueryBuilder, Selectable } from "kysely";
import { database } from "../core/Database";
import { DB } from "../core/DatabaseTypes";
import { z } from "zod";
import Hono from "hono"

type BaseAggregate = {
    id: string;

    x_updated_time: string;
    x_deleted: boolean;
}

const GetDefaultQueryBuilder = <TTable extends keyof DB>(table: TTable) => {
    const qb = database.selectFrom(table);

    return qb;
}

const DefineResourceAggregate = <T extends BaseAggregate>(options: {
    type: string;
    x_updated_time: boolean;
    x_deleted: boolean;
}) => options;

const DefineQueryNext = <T extends BaseAggregate, TInput extends z.ZodTypeAny, TTable extends keyof DB, TResult extends any>(
    table: TTable,
    aggregate: ReturnType<typeof DefineResourceAggregate<any>>,
    getter: (qb: ReturnType<typeof GetDefaultQueryBuilder<TTable>>) => TResult,

    input: TInput
) => {
    return {
        execute: async (input: z.infer<TInput>) => {
            const qb = GetDefaultQueryBuilder(table)

            const result = await getter(qb);

            return result;
        }
    }
}

const DefineQueryOne = <T extends { type: string; id: string; data: any }>(options: {
    getData: () => T
}) => options;

const DefineQuery = <T extends { type: string; id: string; data: any }>(options: {
    getData: () => T[]
}) => options;









