var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Esorm: () => Esorm,
  EsormColumn: () => EsormColumn,
  EsormDatabase: () => EsormDatabase,
  EsormObject: () => EsormTable,
  EsormRoute: () => EsormRoute,
  EsormRouter: () => EsormRouter,
  TestFunction: () => TestFunction
});
module.exports = __toCommonJS(src_exports);

// src/query.ts
var applyEsormQueryToQB = (qb, query) => {
  if (query) {
    if (query.operator === "=") {
      qb.where(query.column, query.operator, query.value);
    }
  }
  return qb;
};

// src/object.ts
var import_zod = require("zod");
var EsormDatabase = class {
  connection;
  routes;
  constructor(options) {
    this.connection = options.connection, this.routes = options.routes;
  }
  async getOne(key, query) {
    const qb = this.connection.selectFrom(key).selectAll();
    applyEsormQueryToQB(qb, query);
    return qb.executeTakeFirstOrThrow();
  }
  async getMany(key, query) {
    const qb = this.connection.selectFrom(key).selectAll();
    applyEsormQueryToQB(qb, query);
    return qb.execute();
  }
  async insert(key, objects) {
    await this.connection.insertInto(key).values(objects).execute();
  }
  async delete(key, objects) {
  }
  getRoutes() {
    return Object.entries(this.routes).map(([key, config]) => ({
      path: `/${key}/get-many`,
      validator: (input) => input,
      handler: (query) => this.getMany(key)
    }));
  }
};
var EsormTable = class {
  name;
  columns;
  constructor(options) {
    this.name = options.name;
    this.columns = options.columns;
  }
  async getOne(query) {
  }
};
var EsormColumn = class {
  type;
  validator;
  constructor(type) {
    this.type = type;
    this.validator = EsormColumnType[type].validator;
  }
};
var EsormColumnType = {
  int4: { validator: import_zod.z.number().int() },
  int8: { validator: import_zod.z.number().int() },
  float4: { validator: import_zod.z.number().int() },
  float8: { validator: import_zod.z.number().int() },
  bool: { validator: import_zod.z.boolean() },
  text: { validator: import_zod.z.string() },
  timestamptz: { validator: import_zod.z.string().datetime() }
};

// src/router.ts
var import_hono = require("hono");
var EsormRoute = class {
  constructor() {
  }
};
var EsormRouter = class {
  app;
  db;
  constructor(options) {
    this.app = new import_hono.Hono();
    this.db = options.db;
    Object.entries(this.db.routes).forEach(([key, path]) => {
      this.app.post(`/${key}/get-many`, (c) => {
        const input = c.req.json();
        const result = this.db.getMany(key, input);
        return c.json({
          data: result
        });
      });
    });
  }
};

// src/esorm.ts
var import_cuid2 = require("@paralleldrive/cuid2");
var Esorm = (schema, connection) => {
  const db = connection;
  const result = {
    db,
    schema,
    get: async (type) => {
      return await db.selectFrom(type).selectAll().orderBy("created").execute();
    },
    create: async (type, data) => {
      const record = {
        id: (0, import_cuid2.createId)(),
        created: Date.now(),
        updated: Date.now(),
        data
      };
      await db.insertInto(type).values([record]).execute();
    },
    /** Apply one operation */
    apply_operation: async (db2, operation) => {
      console.log("APPLY", operation);
      if (operation.operation === "create") {
        const record = {
          id: operation.id,
          created: Date.now(),
          updated: Date.now(),
          data: {}
        };
        await db2.insertInto(operation.type).values([record]).execute();
      }
      if (operation.operation === "delete") {
        await db2.deleteFrom(operation.type).where("id", "=", operation.id).executeTakeFirst();
      }
      if (operation.operation === "update") {
        if (operation.path.length === 0)
          return;
        const item = await db2.selectFrom(operation.type).where("id", "=", operation.id).select("data").executeTakeFirstOrThrow();
        let current = item.data;
        let p = operation.path.slice(1);
        let k = operation.path.at(-1);
        for (const key of p) {
          current = typeof current === "object" ? current[key] : void 0;
        }
        if (typeof current === "object") {
          current[k] = operation.value;
        }
        await db2.updateTable(operation.type).where("id", "=", operation.id).set("data", item.data).execute();
      }
      return;
    },
    /** Apply many operations */
    apply_operations: async (operations) => {
      await db.transaction().execute(async (db2) => {
        for (const operation of operations) {
          await result.apply_operation(db2, operation);
        }
      });
    },
    _type_db: void 0,
    _type_schema: void 0
  };
  return result;
};

// src/index.ts
console.log("Hello ESORM");
var TestFunction = () => {
  console.log("ESORM TEST");
};
console.log("Arg 0", process.argv[0]);
console.log("Arg 1", process.argv[1]);
console.log("Arg 2", process.argv[2]);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Esorm,
  EsormColumn,
  EsormDatabase,
  EsormObject,
  EsormRoute,
  EsormRouter,
  TestFunction
});
//# sourceMappingURL=index.js.map