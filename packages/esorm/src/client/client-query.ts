import { makeAutoObservable, runInAction, toJS, untracked } from "mobx";
import { EsormQuery, EsormQueryBuilder, checkEntityPassesQuery } from "../common/query";
import { deterministicStringify } from "../common/utils";
import { BaseSchema } from "./client-utils";
import { ClientApiDriver } from "./client-api-driver";
import { EsormBatchOperation } from "../common/batch";

export class ClientQueryModule<Schema extends BaseSchema> {
  entities = new Map<string, any>();
  queries = {} as Record<string, any>;
  options: ClientQueryModuleOptions;

  constructor(options: ClientQueryModuleOptions) {
    makeAutoObservable(this);

    this.options = options;
  }

  getMany = async <Key extends keyof Schema>(options: {
    type: Key;
    query?: (qb: typeof EsormQueryBuilder) => EsormQuery;
    sort?: string | [string, "asc" | "desc"] | [string, "asc" | "desc"][];
  }) => {
    // TODO: This method should basically create a query, read the data, and then unsubscribe from the query right away.
    // This way, this function uses the exact same logic as other queries, but does not hold onto the subscription longer than necessary.
    // The user should be warned that using esorm this way is not recommended.

    const result = await this.options.apiDriver.reqEntity({
      action: "get-many",
      type: options.type,
      query: options.query?.(EsormQueryBuilder),
      sort: options.sort,
    });

    return result as Schema[Key][];
  };

  getOrCreateQuery = <Type extends keyof Schema & string>(options: {
    type: Type;
    query?: (qb: typeof EsormQueryBuilder) => EsormQuery;
    sort?: string | [string, "asc" | "desc"] | [string, "asc" | "desc"][];
    limit?: number;
    offset?: number;
  }) => {
    const module = this; // Need to cache here to use in context below
    const query = options.query(EsormQueryBuilder);
    const key = deterministicStringify({
      ...options,
      query,
    });

    const create = () => {
      console.log("Creating Query", key);

      const state = makeAutoObservable({
        key,
        query,

        count: 1,

        isLoading: true,
        isError: false,

        get data() {
          const r: Schema[Type][] = [...module.entities]
            .filter(([key, value]) => {
              if (!key.startsWith(options.type)) return false;

              return query ? checkEntityPassesQuery(query, value) : true;
            })
            .map(([key, value]) => value);

          return r;
        },

        start: async () => {
          runInAction(() => {
            state.isLoading = true;
            state.isError = false;
          });

          try {
            const result = await this.getMany(options);

            state.success(result);

            this.updateEntities(options.type, result);
          } catch (e) {
            state.error();
          }
        },
        success: (data: Schema[Type][]) => {
          console.log("QUERY SUCCESS");

          state.isLoading = false;
          state.isError = false;
        },
        error: () => {
          state.isLoading = false;
          state.isError = true;
        },
        dispose: () => {
          console.log("DISPOSING QUERY (?)");

          this.queries[key].count--;

          if (this.queries[key].count === 0) {
            console.log("EMPTY QUERY. REMOVING...");

            delete this.queries[key];
          }
        },
      });

      untracked(() => state.start());

      return state;
    };

    runInAction(() => {
      if (this.queries[key] === undefined) {
        this.queries[key] = create();
      } else {
        this.queries[key].count++;
      }
    });

    return this.queries[key] as ReturnType<typeof create>;
  };

  updateEntities = <Type extends keyof Schema & string>(type: Type, entities: Schema[Type][]) => {
    entities.forEach((entity) => {
      const key = `${type}|${entity._id}`;

      this.entities.set(key, entity);
    });
  };

  applyOperation = (patch: EsormBatchOperation) => {
    Object.entries(patch.types).forEach(([type, record]) => {
      Object.entries(record).forEach(([id, entry]) => {
        const k = `${type}|${id}`;

        if (entry.action === "delete") {
          this.entities.delete(k);
        } else {
          const target = this.entities.get(k);

          if (target) {
            Object.entries(entry.data).forEach(([key, value]) => {
              console.log("SET", key, value);

              target[key] = value;
            });
          } else {
            console.log("CREATE", entry.data);

            this.entities.set(k, entry.data);
          }
        }
      });
    });
  };
}

type ClientQueryModuleOptions = {
  apiDriver: ClientApiDriver;
};
