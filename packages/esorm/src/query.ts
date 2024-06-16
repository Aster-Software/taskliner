export type EsormQueryOperator = "=" | "in" | "<" | "<=" | ">" | ">=" | "!=";
export type EsormQueryCondition = {
  operator: EsormQueryOperator;
  column: string;
  value: any;
};
export type EsormQuery =
  | undefined
  | EsormQueryCondition
  | {
      operator: "and";
      conditions: EsormQuery[];
    }
  | {
      operator: "or";
      conditions: EsormQuery[];
    };

export type EsormQueryOptions = {
  type: string;
  query?: EsormQuery;
  sort?: string | [string, "asc" | "desc"] | [string, "asc" | "desc"][];
  limit?: number;
  offset?: number;
};

export const EsormQueryBuilder = {
  where: (column: string, operator: EsormQueryOperator, value: any) => {
    const condition: EsormQueryCondition = {
      operator,
      column,
      value,
    };

    return condition;
  },
  and: (...conditions: EsormQuery[]) => ({ operator: "and" as const, conditions }),
  or: (...conditions: EsormQuery[]) => ({ operator: "or" as const, conditions }),
};

export const checkEntityPassesQuery = (query: EsormQuery, entity: any) => {
  if (query.operator === "and") return query.conditions.every((condition) => checkEntityPassesQuery(condition, entity));
  if (query.operator === "or") return query.conditions.some((condition) => checkEntityPassesQuery(condition, entity));
  if (query.operator === "=") return entity[query.column] === query.value;
  if (query.operator === "!=") return entity[query.column] !== query.value;
  if (query.operator === "in") return query.value.includes(entity[query.column]);

  return false;
};
