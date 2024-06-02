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

// src/router.ts
var EsormRoute = class {
  constructor() {
  }
};
var EsormRouter = class {
};

// src/index.ts
console.log("Hello ESORM");
var TestFunction = () => {
  console.log("ESORM TEST");
};
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