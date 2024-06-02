import type { Component } from "solid-js";
import { createEffect, createResource, createSignal } from "solid-js"
import { useAPIResource } from "../utilities/ClientAPI";

export const Test: Component = (props) => {
  console.log("RENDER")

  const value = useAPIResource("/test", {})
  const workspaces = useAPIResource("/get-workspaces", {})

  return <div>
    <div>TEST SUCCESS</div>
  </div>
}