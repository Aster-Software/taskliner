import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Router } from './core/Router'
import { config } from 'dotenv'

config();

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/test', (c) => {
  return c.json({
    data: "JELLO JSON"
  })
})

Object.entries(Router).forEach(([path, config]) => {
  app.post(`/api${path}`, async c => {
    const variables = await config.variables?.parseAsync(c.req.json())
    const context = {};
    const result = await config.handler({ context, variables });

    return c.json({ data: result });
  })
})

app.routes.forEach(route => {
  console.log(route.method, route.path)
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
