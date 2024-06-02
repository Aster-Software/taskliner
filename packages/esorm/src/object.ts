import { DatabaseConnection, Insertable, Kysely, Selectable, isKyselyProps } from "kysely";
import { EsormQuery, applyEsormQueryToQB } from "./query";

type BaseEsormObject = {
    id: string;
    created: string;
    updated: string;
}

type EsormObjectType = "string" | "number" | "boolean" | "json";

type RoutesConfig<DB> = Partial<{ [Key in keyof DB & string]: {} }>;

type RouteOutputConfig = {
    path: string;
    validator: (input: unknown) => unknown,
    handler: (input: unknown) => unknown,
}

export class EsormDatabase<KKDB> {
    connection: Kysely<KKDB>;
    routes: RoutesConfig<KKDB>;

    constructor(options: {
        connection: Kysely<KKDB>,
        routes: RoutesConfig<KKDB>,
    }) {
        this.connection = options.connection,
        this.routes = options.routes;
    }

    async getOne<K extends keyof KKDB & string>(key: K, query: EsormQuery) {
        const qb = this.connection.selectFrom(key).selectAll()

        applyEsormQueryToQB(qb, query);

        return qb.executeTakeFirstOrThrow();
    }

    async getMany<K extends keyof KKDB & string>(key: K, query: EsormQuery) {
        const qb = this.connection.selectFrom(key).selectAll()

        applyEsormQueryToQB(qb, query);

        return qb.execute();
    }
    
    async insert<K extends keyof KKDB & string>(key: K, objects: Insertable<KKDB[K]>[]) {
        await this.connection.insertInto(key).values(objects).execute();
    }

    async delete<K extends keyof KKDB & string>(key: K, objects: Insertable<KKDB[K]>) {
        // await this.connection.deleteFrom(key)
    }

    getRoutes(): RouteOutputConfig[] {
        return Object.entries(this.routes).map(([key, config]) => ({
            path: `/${key}/get-many`,
            validator: (input: unknown) => input,
            handler: (query: EsormQuery) => this.getMany(key as any),
        }))
    }
}

export class EsormTable<T extends { [key: string]: EsormColumn<any> }> {
    name: string;
    columns: T

    constructor(options: {
        name: string;
        columns: T,
    }) {
        this.name = options.name;
        this.columns = options.columns;
}

    async getOne(query: EsormQuery) {
        // const qb = 
    }
}

export class EsormColumn<T extends EsormObjectType> {
    type: EsormObjectType

    constructor(type: EsormObjectType) {
        this.type = type;
    }
}