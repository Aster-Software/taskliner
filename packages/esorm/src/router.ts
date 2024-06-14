import { Hono } from "hono";
import { EsormDatabase } from "./object";

export class EsormRoute<T> {
  constructor() {}
}

export class EsormRouter<DB> {
  app: Hono;
  db: EsormDatabase<DB>;

  constructor(options: { db: EsormDatabase<DB> }) {
    this.app = new Hono();
    this.db = options.db;

    Object.entries(this.db.routes).forEach(([key, path]) => {
      this.app.post(`/${key}/get-many`, (c) => {
        const input = c.req.json();
        const result = this.db.getMany(key as any, input as any);

        return c.json({
          data: result,
        });
      });
    });
  }
}
