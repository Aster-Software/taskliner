import { z } from 'zod';

type EsormProperty = {
    schema: z.ZodTypeAny;
};
type EsormPropertiesDefinition = Record<string, EsormProperty>;
type EsormSchemaDefinition = Record<string, {
    relations: {};
    properties: EsormPropertiesDefinition;
}>;

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

export { type EsormSchemaDefinition as E, type EsormQueryOptions as a, type EsormBatchOperation as b, EsormQueryBuilder as c, type EsormQuery as d };
