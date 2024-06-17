import * as mongodb from 'mongodb';
import { Db } from 'mongodb';
import { z } from 'zod';
import { E as EsormSchemaDefinition, a as EsormQueryOptions, b as EsormBatchOperation } from '../batch-CklXvhbI.js';

type Action = "read" | "create" | "update" | "delete";
type Permission = {
    action: "all" | Action;
    scope?: Record<string, any>;
    fields?: string[];
};
type Authorization<T extends EsormSchemaDefinition> = {
    [Key in keyof T]: Permission | Permission[];
};

declare class EsormServerApi<T extends EsormSchemaDefinition> {
    options: EsormServerApiOptions;
    constructor(options: EsormServerApiOptions);
    getMany: (query: EsormQueryOptions) => Promise<mongodb.WithId<mongodb.Document>[]>;
    getManyWithAuthorization: (query: EsormQueryOptions, authorization: Authorization<T>) => Promise<mongodb.WithId<mongodb.Document>[]>;
    applyBatchOperation: (operation: EsormBatchOperation) => Promise<void>;
    applyBatchOperationWithAuthorization: (operation: EsormBatchOperation, authorization: Authorization<T>) => Promise<void>;
}
type EsormServerApiOptions = {
    db: Db;
};

declare const Esorm: <T extends EsormSchemaDefinition, XSession>(esormOptions: EsormOptions<T, XSession>) => Promise<{
    db: mongodb.Db;
    api: EsormServerApi<EsormSchemaDefinition>;
    start: () => void;
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
type EsormOptions<T extends EsormSchemaDefinition, XSession> = {
    port: number;
    mongodb_db: string;
    mongodb_url: string;
    schema: T;
    authenticate: (token: string) => Promise<XSession>;
    authorize: (session: XSession, api: EsormServerApi<T>) => Promise<Authorization<T>>;
};

export { Esorm, type EsormOptions, EsormTypes };
