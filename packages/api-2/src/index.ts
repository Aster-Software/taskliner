import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get("/", c => {
    return c.text("Hello World");
});

serve({
    fetch: app.fetch,
    port: 4000,
}, () => {
    console.log("Server started on port 4000");
})

export default app;