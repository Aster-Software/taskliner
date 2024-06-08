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
  constructor(type) {
    this.type = type;
  }
};
var Columns = {
  Int4: { type: "int4", validator: import_zod.z.number().int() },
  Int8: { type: "int8", validator: import_zod.z.number().int() },
  Float4: { type: "float4", validator: import_zod.z.number() },
  Float8: { type: "float4", validator: import_zod.z.number() },
  Text: { type: "text", validator: import_zod.z.string() },
  TimestampTz: { type: "timestamptz", validator: import_zod.z.string().datetime() }
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
  EsormColumn,
  EsormDatabase,
  EsormObject,
  EsormRoute,
  EsormRouter,
  TestFunction
});
//# sourceMappingURL=index.js.map