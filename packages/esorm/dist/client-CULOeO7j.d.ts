import { z } from 'zod';

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

type EsormBatchOperation = {
    types: Record<string, Record<string, {
        action: "create" | "update" | "delete";
        data: any;
    }>>;
};

type EsormProperty = {
    schema: z.ZodTypeAny;
};
type EsormPropertiesDefinition = Record<string, EsormProperty>;
type EsormSchemaDefinition = Record<string, {
    relations: {};
    properties: EsormPropertiesDefinition;
}>;
type EsormBaseEntityType = {
    _id: string;
};
type EntityType<T extends EsormPropertiesDefinition> = EsormBaseEntityType & Partial<{
    [K in keyof T]: z.infer<T[K]["schema"]>;
}>;

type BaseSchema = {
    [key: string]: {
        _id: string;
    };
};

declare class ClientApiDriver {
    constructor();
    req: (options: {
        url: string;
        body: any;
    }) => Promise<unknown>;
    reqEntity: (body: any) => Promise<unknown>;
}

declare class ClientQueryModule<Schema extends BaseSchema> {
    entities: Map<string, any>;
    queries: Record<string, any>;
    options: ClientQueryModuleOptions;
    constructor(options: ClientQueryModuleOptions);
    getMany: <Key extends keyof Schema>(options: {
        type: Key;
        query?: (qb: typeof EsormQueryBuilder) => EsormQuery;
        sort?: string | [
            string,
            "asc" | "desc"
        ] | [
            string,
            "asc" | "desc"
        ][];
    }) => Promise<Schema[Key][]>;
    getOrCreateQuery: <Type extends keyof Schema & string>(options: {
        type: Type;
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
        key: string;
        query: EsormQuery;
        count: number;
        isLoading: boolean;
        isError: boolean;
        readonly data: Schema[Type][];
        start: () => Promise<void>;
        success: (data: Schema[Type][]) => void;
        error: () => void;
        dispose: () => void;
    };
    updateEntities: <Type extends keyof Schema & string>(type: Type, entities: Schema[Type][]) => void;
    applyOperation: (patch: EsormBatchOperation) => void;
}
type ClientQueryModuleOptions = {
    apiDriver: ClientApiDriver;
};

declare class ClientOperationsModule<FinalType extends BaseSchema> {
    operationsCommitting: EsormBatchOperation;
    operationsLocal: EsormBatchOperation;
    options: ClientOperationsModuleOptions;
    constructor(options: ClientOperationsModuleOptions);
    update: () => Promise<void>;
}
type ClientOperationsModuleOptions = {
    apiDriver: ClientApiDriver;
};

declare class ClientSocketModule<Schema extends BaseSchema> {
    options: ClientSocketOptions<Schema>;
    ws: WebSocket;
    constructor(options: ClientSocketOptions<Schema>);
    loop(): void;
    reconnect(): void;
    send: (action: string, data: any) => void;
    subscribeToQuery: (query: EsormQuery) => void;
    unsubscribeFromQuery: (query: EsormQuery) => void;
}
type ClientSocketOptions<Schema extends BaseSchema> = {
    url: string;
    operationsModule: ClientOperationsModule<Schema>;
    queryModule: ClientQueryModule<Schema>;
};

declare const EsormClient: <R extends {
    _SCHEMATYPE: EsormSchemaDefinition;
}>() => {
    apiDriver: ClientApiDriver;
    operationsModule: ClientOperationsModule<BaseSchema>;
    queryModule: ClientQueryModule<{ [Key in keyof R["_SCHEMATYPE"]]: {
        _id: string;
    } & Partial<{ [P in keyof R["_SCHEMATYPE"][Key]["properties"]]: z.TypeOf<R["_SCHEMATYPE"][Key]["properties"][P]["schema"]>; }>; }>;
    socketModule: ClientSocketModule<BaseSchema>;
    /** For use with SolidJS */
    createQuery: <Key_1 extends keyof R["_SCHEMATYPE"] & string>(getOptions: () => {
        type: Key_1;
        query?: (qb: typeof EsormQueryBuilder) => EsormQuery;
        sort?: string | [string, "asc" | "desc"] | [string, "asc" | "desc"][];
        limit?: number;
        offset?: number;
    }) => {
        readonly query: {
            key: string;
            query: EsormQuery;
            count: number;
            isLoading: boolean;
            isError: boolean;
            readonly data: { [Key in keyof R["_SCHEMATYPE"]]: {
                _id: string;
            } & Partial<{ [P in keyof R["_SCHEMATYPE"][Key]["properties"]]: z.TypeOf<R["_SCHEMATYPE"][Key]["properties"][P]["schema"]>; }>; }[Key_1][];
            start: () => Promise<void>;
            success: (data: { [Key in keyof R["_SCHEMATYPE"]]: {
                _id: string;
            } & Partial<{ [P in keyof R["_SCHEMATYPE"][Key]["properties"]]: z.TypeOf<R["_SCHEMATYPE"][Key]["properties"][P]["schema"]>; }>; }[Key_1][]) => void;
            error: () => void;
            dispose: () => void;
        };
    };
    createEntityValue: <Key_2 extends keyof R["_SCHEMATYPE"] & string>(type: Key_2, value: {
        _id: string;
    } & Partial<{ [P_1 in keyof R["_SCHEMATYPE"][Key_2]["properties"]]: z.TypeOf<R["_SCHEMATYPE"][Key_2]["properties"][P_1]["schema"]>; }>) => void;
    setEntityValue: <Key_3 extends keyof R["_SCHEMATYPE"] & string, K extends "_id" | (keyof R["_SCHEMATYPE"][Key_3]["properties"] & string)>(type: Key_3, target: {
        _id: string;
    } & Partial<{ [P_2 in keyof R["_SCHEMATYPE"][Key_3]["properties"]]: z.TypeOf<R["_SCHEMATYPE"][Key_3]["properties"][P_2]["schema"]>; }>, key: K, value: ({
        _id: string;
    } & Partial<{ [P_2 in keyof R["_SCHEMATYPE"][Key_3]["properties"]]: z.TypeOf<R["_SCHEMATYPE"][Key_3]["properties"][P_2]["schema"]>; }>)[K]) => void;
};

export { type EsormSchemaDefinition as E, type EntityType as a, type EsormQueryOptions as b, type EsormBatchOperation as c, EsormClient as d };