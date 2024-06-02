import { Kysely, PostgresDialect } from "kysely";
import { DB } from "../core/DatabaseTypes.js";
import { database } from "../core/Database.js";

type Resource<Context = void, Result = void> = {
    context?: (input: any) => Context,
    process?: (params: { data: Result, context: Context }) => Result
}

const init = <DB>(database: Kysely<DB>) => {

    class ResourceV3<Table extends keyof DB & string, Context = void> {
        table: Table;
        options: {
            context?: (input: any) => Context,
            process?: (params: { data: DB[Table], context: Context }) => DB[Table]
        }

        constructor(
            table: Table,
            options: {
                context?: (input: any) => Context,
                process?: (params: { data: DB[Table], context: Context }) => DB[Table]
            }
        ) {
            this.table = table;
            this.options = options;
        }

        async getOne() {
            return await database.selectFrom(this.table).selectAll().executeTakeFirst()
        }

        async getMany() {
            return await database.selectFrom(this.table).selectAll().execute();
        }
    }

    class RouterV3<RouterType extends Partial<{ [Key in keyof DB]: Key extends string ? ResourceV3<Key, any> : never }>> {
        config: RouterType

        constructor(config: RouterType) {
            this.config = config;
        }
    }

    return {
        ResourceV3,
        RouterV3,
    }
}

const V3 = init(database);

export const RouterV3 = new V3.RouterV3({
    workspace: new V3.ResourceV3("workspace", {}),
    project: new V3.ResourceV3("project", {}),
})

export type RouterTypeV3 = typeof RouterV3;