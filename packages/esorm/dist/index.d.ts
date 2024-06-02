import * as kysely_dist_cjs_util_type_utils from 'kysely/dist/cjs/util/type-utils';
import * as kysely from 'kysely';
import { Kysely, Insertable } from 'kysely';
import * as kysely_dist_cjs_parser_table_parser from 'kysely/dist/cjs/parser/table-parser';

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

type EsormObjectType = "string" | "number" | "boolean" | "json";
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
    [key: string]: EsormColumn<any>;
}> {
    name: string;
    columns: T;
    constructor(options: {
        name: string;
        columns: T;
    });
    getOne(query: EsormQuery): Promise<void>;
}
declare class EsormColumn<T extends EsormObjectType> {
    type: EsormObjectType;
    constructor(type: EsormObjectType);
}

declare class EsormRoute<T> {
    constructor();
}
declare class EsormRouter<T> {
}

declare const TestFunction: () => void;

export { EsormColumn, EsormDatabase, EsormTable as EsormObject, EsormRoute, EsormRouter, TestFunction };
