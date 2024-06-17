import { EsormSchemaDefinition } from "../common/schema";

type Action = "read" | "create" | "update" | "delete";

export type Permission = {
  action: "all" | Action;
  scope?: Record<string, any>;
  fields?: string[];
};

export type Authorization<T extends EsormSchemaDefinition> = {
  [Key in keyof T]: Permission | Permission[];
};

export const authorizeEntityForPermission = (action: Action, entity: any, permissions: Permission | Permission[]) => {
  const p = Array.isArray(permissions) ? permissions : [permissions];

  return p.some((permission) => {
    const isCorrectAction = permission.action === "all" || permission.action === action;

    if (isCorrectAction === false) return false;

    const isCorrectScope = Object.entries(permission.scope).every(([key, value]) => entity[key] === value);

    return isCorrectScope;
  });
};
