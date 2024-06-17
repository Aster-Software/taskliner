import { Db } from "mongodb";
import { EsormSchemaDefinition } from "../common/schema";
import { EsormQuery, EsormQueryOptions } from "../common/query";
import { Authorization, authorizeEntityForPermission } from "./server-authorization";
import { EsormBatchOperation } from "../common/batch";

export class EsormServerApi<T extends EsormSchemaDefinition> {
  options: EsormServerApiOptions;

  constructor(options: EsormServerApiOptions) {
    this.options = options;
  }

  getMany = async (query: EsormQueryOptions) => {
    const serialize = (target: any, condition?: EsormQuery) => {
      if (condition === undefined) return target;

      if (condition.operator === "and") target["$and"] = condition.conditions.map((x) => serialize({}, x));
      else if (condition.operator === "or") target["$or"] = condition.conditions.map((x) => serialize({}, x));
      else if (condition.operator === "=") target[condition.column] = { $eq: condition.value };
      else if (condition.operator === "!=") target[condition.column] = { $not: { $eq: condition.value } };
      else if (condition.operator === "in") target[condition.column] = { $in: condition.value };

      return target;
    };

    const filter = serialize({}, query.query);

    const items = await this.options.db.collection(query.type).find(filter).limit(10000).toArray();

    return items;
  };

  getManyWithAuthorization = async (query: EsormQueryOptions, authorization: Authorization<T>) => {
    const items = await this.getMany(query);

    const permissions = authorization[query.type];

    return items.filter((item) => authorizeEntityForPermission("read", item, permissions));
  };

  applyBatchOperation = async (operation: EsormBatchOperation) => {
    console.log("Applying Operations...");

    for (const type in operation.types) {
      const t = operation.types[type];

      for (const [id, entry] of Object.entries(t)) {
        if (entry.action === "create") {
          await this.options.db.collection(type).insertOne({ ...entry.data, _id: id as any });
        }

        if (entry.action === "update") {
          await this.options.db.collection(type).updateOne({ _id: id as any }, { $set: entry.data });
        }

        if (entry.action === "delete") {
          await this.options.db.collection(type).deleteOne({ _id: id as any });
        }
      }
    }
  };

  applyBatchOperationWithAuthorization = async (operation: EsormBatchOperation, authorization: Authorization<T>) => {
    console.log("Applying Operations...");

    for (const type in operation.types) {
      const t = operation.types[type];
      const permissionsRaw = authorization[type];
      const permissions = Array.isArray(permissionsRaw) ? permissionsRaw : [permissionsRaw];

      for (const [id, entry] of Object.entries(t)) {
        if (entry.action === "create") {
          const isAuthorized = authorizeEntityForPermission("create", entry.data, permissions);

          if (isAuthorized) {
            await this.options.db.collection(type).insertOne({ ...entry.data, _id: id as any });
          } else {
            console.log("Unauthorized. Skipping Mutation.");
          }
        }

        if (entry.action === "update") {
          const target = await this.options.db.collection(type).findOne({ _id: id as any });

          const isAuthorizedOriginal = authorizeEntityForPermission("update", target, permissions);
          const isAuthorizedUpdated = authorizeEntityForPermission("update", { ...target, ...entry.data }, permissions);

          if (isAuthorizedOriginal && isAuthorizedUpdated) {
            await this.options.db.collection(type).updateOne({ _id: id as any }, { $set: entry.data });
          } else {
            console.log("Unauthorized. Skipping Mutation.");
          }
        }

        if (entry.action === "delete") {
          const target = await this.options.db.collection(type).findOne({ _id: id as any });

          const isAuthorized = authorizeEntityForPermission("delete", target, permissions);

          if (isAuthorized) {
            await this.options.db.collection(type).deleteOne({ _id: id as any });
          } else {
            console.log("Unauthorized. Skipping Mutation.");
          }
        }
      }
    }
  };
}

type EsormServerApiOptions = {
  db: Db;
};
