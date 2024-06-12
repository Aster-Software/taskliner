import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Router } from "./core/Router.js";
import { config } from "dotenv";
import { ResourceV3, TestRouter } from "./esorm/everything.js";
import { database } from "./core/Database.js";
import { esorm, test } from "./esormdb.js";

test();

config();

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/test", (c) => {
  return c.json({
    data: "JELLO JSON",
  });
});

// Object.entries(Router).forEach(([path, config]) => {
//   app.post(`/api${path}`, async c => {
//     const input = await config.input?.parseAsync(c.req.json())
//     const resource = config.resource
//     const context = {};
//     const result = await config.handler({ context, input, resource });

//     return result ? c.json(result) : c.json({ type: "void" });
//   })
// })

// Object.entries(TestRouter.config).forEach(([key, cc]) => {
//   const config = cc as ResourceV3<any>;

//   // GET ONE
//   // app.get(`/api/resource/${path}/get-one`, async c => {
//   //   const input = await config.input.
//   // })

//   // GET MANY
//   app.post(`/api/resource/${key}/get-many`, async c => {
//     console.log("GETMANY")

//     const body = await c.req.json()
//     // const input = await config._validateGetManyInput(body)
//     const result = await config.getMany([]);

//     console.log({ result });

//     return c.json({ data: result })
//   });
// })

// Object.entries(TestRouter.config).forEach(([key, cc]) => {
//   const config = cc as ResourceV3<any>;

//   // GET ONE
//   // app.get(`/api/resource/${path}/get-one`, async c => {
//   //   const input = await config.input.
//   // })

//   // GET MANY
//   app.post(`/api/resource/${key}/get-many`, async c => {
//     console.log("GETMANY")

//     const body = await c.req.json()
//     const input = await config._validateGetManyInput(body)
//     const result = await config.getMany([]);

//     console.log({ result });

//     return c.json({ data: result })
//   });
// })

app.routes.forEach((route) => {
  console.log(route.method, route.path);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
