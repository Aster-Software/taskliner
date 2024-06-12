import * as kysely_dist_cjs_util_type_utils from 'kysely/dist/cjs/util/type-utils';
import * as kysely from 'kysely';
import { Kysely, Insertable, ColumnType } from 'kysely';
import * as kysely_dist_cjs_parser_table_parser from 'kysely/dist/cjs/parser/table-parser';
import { z } from 'zod';
import { Hono } from 'hono';

type EsormQueryLine = {
    operator: "=";
    column: string;
    value: any;
} | {
    operator: "or";
    clauses: EsormQueryLine[];
} | {
    operator: "and";
    clauses: EsormQueryLine[];
};
type EsormQuery = void | EsormQueryLine;

type RoutesConfig<DB> = Partial<{
    [Key in keyof DB & string]: {};
}>;
type RouteOutputConfig = {
    path: string;
    validator: (input: unknown) => unknown;
    handler: (input: unknown) => unknown;
};
declare class EsormDatabase<KKDB> {
    connection: Kysely<KKDB>;
    routes: RoutesConfig<KKDB>;
    constructor(options: {
        connection: Kysely<KKDB>;
        routes: RoutesConfig<KKDB>;
    });
    getOne<K extends keyof KKDB & string>(key: K, query: EsormQuery): Promise<kysely_dist_cjs_util_type_utils.DrainOuterGeneric<{} & kysely_dist_cjs_util_type_utils.DrainOuterGeneric<{ [C in kysely.AnyColumn<KKDB, kysely_dist_cjs_parser_table_parser.ExtractTableAlias<KKDB, K>>]: (kysely_dist_cjs_parser_table_parser.ExtractTableAlias<KKDB, K> extends infer T_3 extends keyof KKDB ? { [T_2 in T_3]: kysely.SelectType<C extends keyof KKDB[T_2] ? KKDB[T_2][C] : never>; } : never)[kysely_dist_cjs_parser_table_parser.ExtractTableAlias<KKDB, K>]; }> extends infer T ? { [K_1 in keyof T]: ({} & kysely_dist_cjs_util_type_utils.DrainOuterGeneric<{ [C in kysely.AnyColumn<KKDB, kysely_dist_cjs_parser_table_parser.ExtractTableAlias<KKDB, K>>]: (kysely_dist_cjs_parser_table_parser.ExtractTableAlias<KKDB, K> extends infer T_1 extends keyof KKDB ? { [T_2 in T_1]: kysely.SelectType<C extends keyof KKDB[T_2] ? KKDB[T_2][C] : never>; } : never)[kysely_dist_cjs_parser_table_parser.ExtractTableAlias<KKDB, K>]; }>)[K_1]; } : never>>;
    getMany<K extends keyof KKDB & string>(key: K, query: EsormQuery): Promise<kysely_dist_cjs_util_type_utils.DrainOuterGeneric<{} & kysely_dist_cjs_util_type_utils.DrainOuterGeneric<{ [C in kysely.AnyColumn<KKDB, kysely_dist_cjs_parser_table_parser.ExtractTableAlias<KKDB, K>>]: (kysely_dist_cjs_parser_table_parser.ExtractTableAlias<KKDB, K> extends infer T_3 extends keyof KKDB ? { [T_2 in T_3]: kysely.SelectType<C extends keyof KKDB[T_2] ? KKDB[T_2][C] : never>; } : never)[kysely_dist_cjs_parser_table_parser.ExtractTableAlias<KKDB, K>]; }> extends infer T ? { [K_1 in keyof T]: ({} & kysely_dist_cjs_util_type_utils.DrainOuterGeneric<{ [C in kysely.AnyColumn<KKDB, kysely_dist_cjs_parser_table_parser.ExtractTableAlias<KKDB, K>>]: (kysely_dist_cjs_parser_table_parser.ExtractTableAlias<KKDB, K> extends infer T_1 extends keyof KKDB ? { [T_2 in T_1]: kysely.SelectType<C extends keyof KKDB[T_2] ? KKDB[T_2][C] : never>; } : never)[kysely_dist_cjs_parser_table_parser.ExtractTableAlias<KKDB, K>]; }>)[K_1]; } : never>[]>;
    insert<K extends keyof KKDB & string>(key: K, objects: Insertable<KKDB[K]>[]): Promise<void>;
    delete<K extends keyof KKDB & string>(key: K, objects: Insertable<KKDB[K]>): Promise<void>;
    getRoutes(): RouteOutputConfig[];
}
declare class EsormTable<T extends {
    [key: string]: EsormColumn$1<any>;
}> {
    name: string;
    columns: T;
    constructor(options: {
        name: string;
        columns: T;
    });
    getOne(query: EsormQuery): Promise<void>;
}
declare class EsormColumn$1<T extends EsormColumnType$1> {
    type: EsormColumnType$1;
    validator: typeof EsormColumnType$1[T]["validator"];
    constructor(type: T);
}
type EsormColumnType$1 = "int4" | "int8" | "float4" | "float8" | "bool" | "text" | "timestamptz";
declare const EsormColumnType$1: {
    int4: {
        validator: z.ZodNumber;
    };
    int8: {
        validator: z.ZodNumber;
    };
    float4: {
        validator: z.ZodNumber;
    };
    float8: {
        validator: z.ZodNumber;
    };
    bool: {
        validator: z.ZodBoolean;
    };
    text: {
        validator: z.ZodString;
    };
    timestamptz: {
        validator: z.ZodString;
    };
};

declare class EsormRoute<T> {
    constructor();
}
declare class EsormRouter<DB> {
    app: Hono;
    db: EsormDatabase<DB>;
    constructor(options: {
        db: EsormDatabase<DB>;
    });
}

type EsormColumnType = "int4" | "int8" | "bool" | "float4" | "float8" | "text" | "jsonb";
type EsormColumn = {
    type: EsormColumnType;
    references?: string;
    onDelete?: "CASCADE" | "SET NULL";
};
type EsormPropertiesDefinition = Record<string, EsormColumn>;
type EsormSchemaDefinition = Record<string, {
    relations: {};
    properties: EsormPropertiesDefinition;
}>;
declare const Esorm: <T extends EsormSchemaDefinition>(schema: T, connection: Kysely<any>) => {
    db: Kysely<{ [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }>;
    schema: T;
    get: <K extends keyof T & string>(type: K) => Promise<kysely_dist_cjs_util_type_utils.DrainOuterGeneric<{} & kysely_dist_cjs_util_type_utils.DrainOuterGeneric<{ [C in kysely.AnyColumn<{ [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }, kysely_dist_cjs_parser_table_parser.ExtractTableAlias<{ [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }, K>>]: (kysely_dist_cjs_parser_table_parser.ExtractTableAlias<{ [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }, K> extends infer T_4 extends keyof { [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; } ? { [T_3 in T_4]: kysely.SelectType<C extends keyof { [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }[T_3] ? { [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }[T_3][C] : never>; } : never)[kysely_dist_cjs_parser_table_parser.ExtractTableAlias<{ [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }, K>]; }> extends infer T_1 ? { [K_1 in keyof T_1]: ({} & kysely_dist_cjs_util_type_utils.DrainOuterGeneric<{ [C in kysely.AnyColumn<{ [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }, kysely_dist_cjs_parser_table_parser.ExtractTableAlias<{ [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }, K>>]: (kysely_dist_cjs_parser_table_parser.ExtractTableAlias<{ [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }, K> extends infer T_2 extends keyof { [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; } ? { [T_3 in T_2]: kysely.SelectType<C extends keyof { [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }[T_3] ? { [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }[T_3][C] : never>; } : never)[kysely_dist_cjs_parser_table_parser.ExtractTableAlias<{ [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }, K>]; }>)[K_1]; } : never>[]>;
    create: <K_2 extends keyof T & string>(type: K_2, data: any) => Promise<void>;
    /** Apply one operation */
    apply_operation: (db: Kysely<{ [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; }>, operation: {
        operation: "delete";
        type: keyof T & string;
        id: string;
    } | {
        operation: "create";
        type: keyof T & string;
        id: string;
    } | {
        operation: "update";
        type: keyof T & string;
        id: string;
        path: string[];
        value: any;
    }) => Promise<void>;
    /** Apply many operations */
    apply_operations: (operations: ({
        operation: "delete";
        type: keyof T & string;
        id: string;
    } | {
        operation: "create";
        type: keyof T & string;
        id: string;
    } | {
        operation: "update";
        type: keyof T & string;
        id: string;
        path: string[];
        value: any;
    })[]) => Promise<void>;
    _type_db: { [Key in keyof T]: {
        id: string;
        created: number;
        updated: number;
        data: Generated<Json>;
    }; };
    _type_schema: T;
};
type Generated<T> = T extends ColumnType<infer S, infer I, infer U> ? ColumnType<S, I | undefined, U> : ColumnType<T, T | undefined, T>;
type Json = JsonValue;
type JsonArray = JsonValue[];
type JsonObject = {
    [K in string]?: JsonValue;
};
type JsonPrimitive = boolean | number | string | null;
type JsonValue = JsonArray | JsonObject | JsonPrimitive;

declare const TestFunction: () => void;

export { Esorm, EsormColumn$1 as EsormColumn, EsormDatabase, EsormTable as EsormObject, EsormRoute, EsormRouter, TestFunction };
