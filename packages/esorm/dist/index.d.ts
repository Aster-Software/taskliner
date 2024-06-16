import * as mongodb from 'mongodb';
import { z } from 'zod';
import { E as EsormSchemaDefinition, a as EntityType, b as EsormQueryOptions, c as EsormBatchOperation } from './client-CULOeO7j.js';
export { d as EsormClient } from './client-CULOeO7j.js';

declare const Esorm: <T extends EsormSchemaDefinition, XUser>(params: {
    port: number;
    mongodb_db: string;
    mongodb_url: string;
    schema: T;
    authenticate: () => Promise<XUser>;
    authorize: { [Key in keyof T]: (x: EntityType<T[Key]["properties"]>, user: XUser) => boolean; };
}) => Promise<{
    start: () => void;
    createEntity: <K extends keyof T & string>(type: K, obj: EntityType<T[K]["properties"]>) => Promise<void>;
    getOne: (type: keyof T & string, id: string) => Promise<mongodb.WithId<mongodb.Document>>;
    getMany: (query: EsormQueryOptions) => Promise<mongodb.WithId<mongodb.Document>[]>;
    getManyWithAuthorization: (query: EsormQueryOptions, user: XUser) => Promise<mongodb.WithId<mongodb.Document>[]>;
    applyBatchOperation: (operation: EsormBatchOperation) => Promise<void>;
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

declare const TestFunction: () => void;

export { Esorm, EsormTypes, TestFunction };
