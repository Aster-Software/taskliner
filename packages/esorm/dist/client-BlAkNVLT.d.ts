import { z } from 'zod';
import * as mongodb from 'mongodb';

type EsormQueryOperator = "=" | "in" | "<" | "<=" | ">" | ">=" | "!=";
type EsormQueryCondition = {
    operator: EsormQueryOperator;
    column: string;
    value: any;
};
type EsormQuery = undefined | EsormQueryCondition | {
    operator: "and";
    conditions: EsormQuery[];
} | {
    operator: "or";
    conditions: EsormQuery[];
};
type EsormQueryOptions = {
    type: string;
    query?: EsormQuery;
    sort?: string | [string, "asc" | "desc"] | [string, "asc" | "desc"][];
    limit?: number;
    offset?: number;
};
declare const EsormQueryBuilder: {
    where: (column: string, operator: EsormQueryOperator, value: any) => EsormQueryCondition;
    and: (...conditions: EsormQuery[]) => {
        operator: "and";
        conditions: EsormQuery[];
    };
    or: (...conditions: EsormQuery[]) => {
        operator: "or";
        conditions: EsormQuery[];
    };
};

type EsormCreateEntityOperation = {
    operation: "create";
    type: string;
    id: string;
    data: any;
};
type EsormDeleteEntityOperation = {
    operation: "delete";
    type: string;
    id: string;
};
type EsormUpdateOperation = {
    operation: "update";
    type: string;
    id: string;
    column: string;
    value: any;
};
type EsormOperation = EsormCreateEntityOperation | EsormDeleteEntityOperation | EsormUpdateOperation;

type EsormProperty = {
    schema: z.ZodTypeAny;
};
type EsormPropertiesDefinition = Record<string, EsormProperty>;
type EsormSchemaDefinition = Record<string, {
    relations: {};
    properties: EsormPropertiesDefinition;
}>;
declare const Esorm: <T extends EsormSchemaDefinition>(params: {
    port: number;
    mongodb_db: string;
    mongodb_url: string;
    schema: T;
}) => Promise<{
    start: () => void;
    createEntity: <K extends keyof T & string>(type: K, obj: Partial<{ [P in keyof T[K]["properties"]]: z.TypeOf<T[K]["properties"][P]["schema"]>; }>) => Promise<void>;
    getOne: (type: keyof T & string, id: string) => Promise<mongodb.WithId<mongodb.Document>>;
    getMany: (query: EsormQueryOptions) => Promise<mongodb.WithId<mongodb.Document>[]>;
    apply_operation: (operation: EsormOperation) => Promise<void>;
    apply_operations: (operations: EsormOperation[]) => Promise<void>;
    _SCHEMATYPE: T;
}>;
declare const EsormTypes: {
    string: {
        schema: z.ZodString;
    };
    number: {
        schema: z.ZodNumber;
    };
    boolean: {
        schema: z.ZodBoolean;
    };
};

declare const EsormClient: <R extends {
    _SCHEMATYPE: EsormSchemaDefinition;
}>() => {
    createOne: <Key extends keyof R["_SCHEMATYPE"]>(type: Key, data: {
        _id: string;
    } & Partial<{ [P in keyof R["_SCHEMATYPE"][Key]["properties"]]: z.TypeOf<R["_SCHEMATYPE"][Key]["properties"][P]["schema"]>; }>) => Promise<{ [Key_1 in keyof R["_SCHEMATYPE"]]: {
        _id: string;
    } & Partial<{ [P_1 in keyof R["_SCHEMATYPE"][Key_1]["properties"]]: z.TypeOf<R["_SCHEMATYPE"][Key_1]["properties"][P_1]["schema"]>; }>; }[Key][]>;
    getMany: <Key_2 extends keyof R["_SCHEMATYPE"]>(options: {
        type: Key_2;
        query?: (qb: typeof EsormQueryBuilder) => EsormQuery;
        sort?: string | [
            string,
            "asc" | "desc"
        ] | [
            string,
            "asc" | "desc"
        ][];
        limit?: number;
        offset?: number;
    }) => Promise<{ [Key_1 in keyof R["_SCHEMATYPE"]]: {
        _id: string;
    } & Partial<{ [P_1 in keyof R["_SCHEMATYPE"][Key_1]["properties"]]: z.TypeOf<R["_SCHEMATYPE"][Key_1]["properties"][P_1]["schema"]>; }>; }[Key_2][]>;
    createQuery: <Key_3 extends keyof R["_SCHEMATYPE"]>(options: () => {
        type: Key_3;
        query?: (qb: typeof EsormQueryBuilder) => EsormQuery;
        sort?: string | [
            string,
            "asc" | "desc"
        ] | [
            string,
            "asc" | "desc"
        ][];
        limit?: number;
        offset?: number;
    }) => {
        isLoading: boolean;
        isError: boolean;
        data: ({
            _id: string;
        } & Partial<{ [P_2 in keyof R["_SCHEMATYPE"][Key_3]["properties"]]: z.TypeOf<R["_SCHEMATYPE"][Key_3]["properties"][P_2]["schema"]>; }>)[];
        success: (data: ({
            _id: string;
        } & Partial<{ [P_2 in keyof R["_SCHEMATYPE"][Key_3]["properties"]]: z.TypeOf<R["_SCHEMATYPE"][Key_3]["properties"][P_2]["schema"]>; }>)[]) => void;
        error: () => void;
    };
    setEntityValue: <Key_4 extends keyof R["_SCHEMATYPE"] & string, K extends "_id" | (keyof R["_SCHEMATYPE"][Key_4]["properties"] & string)>(type: Key_4, target: {
        _id: string;
    } & Partial<{ [P_3 in keyof R["_SCHEMATYPE"][Key_4]["properties"]]: z.TypeOf<R["_SCHEMATYPE"][Key_4]["properties"][P_3]["schema"]>; }>, key: K, value: ({
        _id: string;
    } & Partial<{ [P_3 in keyof R["_SCHEMATYPE"][Key_4]["properties"]]: z.TypeOf<R["_SCHEMATYPE"][Key_4]["properties"][P_3]["schema"]>; }>)[K]) => void;
};

export { type EsormSchemaDefinition as E, Esorm as a, EsormTypes as b, EsormClient as c };
