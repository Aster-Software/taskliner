import { z } from "zod";

type EsormPropertyType = "string" | "number" | "boolean";
type EsormProperty = { schema: z.ZodTypeAny };
type EsormPropertiesDefinition = Record<string, EsormProperty>;

export type EsormSchemaDefinition = Record<
  string,
  {
    relations: {};
    properties: EsormPropertiesDefinition;
  }
>;

export type EsormBaseEntityType = { _id: string };

export type EntityType<T extends EsormPropertiesDefinition> = EsormBaseEntityType &
  Partial<{
    [K in keyof T]: z.infer<T[K]["schema"]>;
  }>;

export type SchemaType<T extends EsormSchemaDefinition> = {
  [K in keyof T]: EntityType<T[K]["properties"]>;
};
