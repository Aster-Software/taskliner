import { SelectQueryBuilder } from "kysely";

export type EsormQueryLine = {
    operator: "="
    column: string;
    value: any;
} | {
    operator: "or";
    clauses: EsormQueryLine[];
} | {
    operator: "and",
    clauses: EsormQueryLine[];
};

// TODO: Add support for arrays of query lines
export type EsormQuery = void | EsormQueryLine; // EsormQueryLine | EsormQueryLine[];

// TODO: Add support for AND operators
// TODO: Add support for OR operators
export const applyEsormQueryToQB = <T extends SelectQueryBuilder<any, any, any>>(qb: T, query: EsormQuery) => {
    if (query) {
        if (query.operator === "=") {
            qb.where(query.column, query.operator, query.value)
        }
    }
    
    return qb;
}