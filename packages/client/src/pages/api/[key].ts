import type { APIRoute } from "astro";
import { Router } from "../../modules/Router";

export const POST: APIRoute = (props) => {
    const action = Router.config[props.url.pathname.slice(4) as any as keyof typeof Router.config];

    console.log("KEY", props.params, props.url.pathname);

    const json = { data: "test" }
    const data = JSON.stringify(json);
    return new Response(data)
}